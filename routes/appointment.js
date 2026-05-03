import express from "express";
import Appoitment from "../models/AppointmentSchema.js";
import Doctor from "../models/DoctorSchema.js";
import auth from "../auth/Middleware.js";
import { getDoctorProfileForUser } from "../utils/doctorAccess.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();
const ACTIVE_STATUSES = ["pending", "approved"];
const ALL_STATUSES = ["pending", "approved", "rejected", "cancelled", "completed"];

const formatDoctorName = (name) => {
    if (!name) return "N/A";
    const cleanName = name.trim();
    if (cleanName.startsWith("Dr.") || cleanName.startsWith("Dr ")) {
        return cleanName;
    }
    return `Dr. ${cleanName}`;
};


const getDayRange = (dateValue) => {
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return null;
    const dayStart = new Date(parsed);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    return { dayStart, dayEnd };
};

const hasDoctorConflict = async ({ appointmentId, doctorId, doctor, date, time }) => {
    const dayRange = getDayRange(date);
    if (!dayRange) return false;
    const conflict = await Appoitment.findOne({
        _id: appointmentId ? { $ne: appointmentId } : { $exists: true },
        $or: [
            { doctorId },
            { doctor }
        ],
        date: { $gte: dayRange.dayStart, $lte: dayRange.dayEnd },
        time,
        status: { $in: ACTIVE_STATUSES }
    });
    return Boolean(conflict);
};

// Legacy create endpoint (compat)
router.post("/createAppointment", auth(), async (req, res) => {
    return createAppointmentHandler(req, res);
});

// RESTful create: POST /appointments
router.post("/", auth(), async (req, res) => {
    return createAppointmentHandler(req, res);
});

async function createAppointmentHandler(req, res) {
    const { doctor, date, time, reason } = req.body;
    if (!doctor || !date || !time || !reason) {
        return res.status(400).json({ message: "Missing fields" });
    }

    const appDate = new Date(date);
    if (Number.isNaN(appDate.getTime())) {
        return res.status(400).json({ message: "Invalid appointment date" });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(appDate);
    bookingDate.setHours(0, 0, 0, 0);
    const bookingDayEnd = new Date(bookingDate);
    bookingDayEnd.setHours(23, 59, 59, 999);

    if (bookingDate < today) {
        return res.status(400).json({ message: "Cannot book appointments in the past" });
    }

    const docProfile = await Doctor.findById(doctor);
    if (!docProfile) {
        return res.status(404).json({ message: "Doctor not found" });
    }

    // Availability check
    if (docProfile && Array.isArray(docProfile.availableSlots) && docProfile.availableSlots.length > 0) {
        if (!docProfile.availableSlots.includes(time)) {
            return res.status(400).json({ message: `Doctor is only available at: ${docProfile.availableSlots.join(", ")}` });
        }
    }

    const existing = await Appoitment.findOne({
        $or: [
            { doctorId: docProfile.userId },
            { doctor }
        ],
        date: { $gte: bookingDate, $lte: bookingDayEnd },
        time,
        status: { $in: ACTIVE_STATUSES }
    });

    if (existing) {
        return res.status(400).json({
            message: "This doctor already has an appointment at the selected date and time."
        });
    }

    const appointment = await Appoitment.create({
        user: req.user.id,
        doctorId: docProfile.userId,
        doctor,
        date: bookingDate,
        time,
        reason,
        status: 'pending'
    });

    const populatedAppointment = await Appoitment.findById(appointment._id)
        .populate("doctor")
        .populate("user", "name email");

    // Extract patient details
    const patientEmail = populatedAppointment.user?.email;
    const patientName = populatedAppointment.user?.name || "Patient";

    console.log(`EMAIL_DEBUG: appointment created, patient email = ${patientEmail || 'MISSING'}`);

    // Send confirmation email (non-blocking)
    if (patientEmail) {
        setImmediate(async () => {
            try {
                const formattedDocName = formatDoctorName(populatedAppointment.doctor?.name);
                const appointmentDate = new Date(populatedAppointment.date).toDateString();
                const appointmentTime = populatedAppointment.time;

                await sendEmail({
                    to: patientEmail,
                    subject: `Appointment Request Submitted - ${formattedDocName} - ${appointmentDate} ${appointmentTime}`,
                    html: `
                        <div style="font-family: sans-serif; color: #333;">
                            <h2 style="color: #008e9b;">Appointment Request Submitted</h2>
                            <p>Hello <strong>${patientName}</strong>,</p>
                            <p>Your appointment request has been successfully submitted and is currently <strong>pending</strong> review.</p>
                            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
                                <p style="margin: 5px 0;"><strong>Doctor:</strong> ${formattedDocName}</p>
                                <p style="margin: 5px 0;"><strong>Date:</strong> ${appointmentDate}</p>
                                <p style="margin: 5px 0;"><strong>Time:</strong> ${appointmentTime}</p>
                            </div>
                            <p>We will notify you once the status of your appointment changes.</p>
                            <p>Best regards,<br/>MediCare Team</p>
                        </div>
                    `
                });

                console.log(`EMAIL_SENT: appointment submitted to ${patientEmail}`);
            } catch (emailError) {
                console.error(`EMAIL_ERROR: appointment submitted ${emailError.message}`);
            }
        });
    } else {
        console.warn("EMAIL_SKIPPED: missing patient email for appointment creation");
    }

    res.status(201).json(populatedAppointment);
}

// Legacy list (role-based aggregate) under /myAppointments
router.get("/myAppointments", auth(), async (req, res) => {
    return listAppointmentsHandler(req, res);
});

// RESTful list for current user: GET /appointments/my
router.get("/my", auth(), async (req, res) => {
    return listAppointmentsHandler(req, res);
});

async function listAppointmentsHandler(req, res) {
    try {
        let appointments;
        if (req.user.role === "admin") {
            appointments = await Appoitment.find()
                .populate("doctor")
                .populate("user", "name email")
                .sort({ createdAt: -1 });
        } else if (req.user.role === "doctor") {
            const doctorDoc = await getDoctorProfileForUser(req.user.id);
            if (!doctorDoc) {
                return res.status(404).json({ message: "Doctor profile not found" });
            }
            appointments = await Appoitment.find({
                $or: [
                    { doctorId: req.user.id },
                    { doctor: doctorDoc._id }
                ]
            })
                .populate("user", "name email")
                .populate("doctor")
                .sort({ createdAt: -1 });
        } else {
            appointments = await Appoitment.find({ user: req.user.id })
                .populate("doctor")
                .sort({ createdAt: -1 });
        }
        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching appointments" });
    }
}

// Legacy delete endpoint (compat) - destructive delete
router.post("/deleteAppointment/:id", auth(), async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appoitment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        const isOwner = appointment.user?.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Access denied." });
        }
        await Appoitment.findByIdAndDelete(id);
        return res.status(200).json({ message: "Appointment deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// RESTful cancel/delete: DELETE /appointments/:id
// - Users cancel their own (status -> cancelled)
// - Admins may hard-delete
router.delete("/:id", auth(), async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appoitment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        const isOwner = appointment.user?.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";

        if (isAdmin) {
            await Appoitment.findByIdAndDelete(id);
            return res.json({ message: "Appointment removed by admin" });
        }

        if (!isOwner) {
            return res.status(403).json({ message: "Access denied." });
        }

        // User cancel -> set status
        if (["approved", "pending"].includes(appointment.status)) {
            appointment.status = "cancelled";
            await appointment.save();
            const populated = await Appoitment.findById(appointment._id)
                .populate("doctor")
                .populate("user", "name email");
            return res.json(populated);
        } else {
            // For rejected/cancelled/completed allow hard delete by owner if desired
            await Appoitment.findByIdAndDelete(id);
            return res.json({ message: "Appointment removed" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update Appointment Status & Time (ADMIN & ASSIGNED DOCTOR)
router.put("/:id/status", auth(), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, time, date } = req.body;
        const isAdmin = req.user.role === "admin";
        const isDoctor = req.user.role === "doctor";

        if (!isAdmin && !isDoctor) {
            return res.status(403).json({ message: "Access denied." });
        }

        if (status && !ALL_STATUSES.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const appointment = await Appoitment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Doctor ownership
        if (isDoctor && appointment.doctorId?.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied. You are not assigned to this appointment." });
        }

        const isRescheduling = time !== undefined || date !== undefined;

        // Doctors can only approve/reject OR reschedule their own appointments.
        if (isDoctor) {
            if (!isRescheduling && (!status || !['approved', 'rejected'].includes(status))) {
                return res.status(400).json({ message: "Doctors can only approve or reject appointments." });
            }
        }

        const nextDate = date !== undefined ? date : appointment.date;
        const nextTime = time !== undefined ? time : appointment.time;
        const nextStatus = status || appointment.status;

        // Prevent double booking for active appointments.
        if (nextStatus !== "rejected" && nextStatus !== "cancelled" && nextTime) {
            const conflictExists = await hasDoctorConflict({
                appointmentId: id,
                doctorId: appointment.doctorId,
                doctor: appointment.doctor,
                date: nextDate,
                time: nextTime
            });
            if (conflictExists) {
                return res.status(400).json({ message: "Time slot already booked for this doctor." });
            }
        }

        if (date !== undefined) {
            const dayRange = getDayRange(date);
            if (!dayRange) {
                return res.status(400).json({ message: "Invalid appointment date" });
            }
            appointment.date = dayRange.dayStart;
        }
        if (time !== undefined) {
            appointment.time = time;
        }
        if (status) {
            appointment.status = status;
        }

        // Rescheduling requires re-confirmation by default if status not provided.
        if (isRescheduling && !status) {
            appointment.status = "pending";
        }

        const updatedAppointment = await appointment.save();

        const populated = await Appoitment.findById(updatedAppointment._id)
            .populate("doctor")
            .populate("user", "name email");

        const patientEmail = populated.user?.email;
        const patientName = populated.user?.name || "Patient";

        if (status === "approved" || status === "rejected") {
            console.log(`EMAIL_DEBUG: appointment status updated to ${status}, patient email = ${patientEmail || 'MISSING'}`);
            
            if (patientEmail) {
                setImmediate(async () => {
                    try {
                        const isApproved = status === "approved";
                        const formattedDocName = formatDoctorName(populated.doctor?.name);
                        const appointmentDate = new Date(populated.date).toDateString();
                        const appointmentTime = populated.time;

                        await sendEmail({
                            to: patientEmail,
                            subject: `Appointment ${isApproved ? "Approved" : "Rejected"} - ${formattedDocName} - ${appointmentDate} ${appointmentTime}`,
                            html: `
                                <div style="font-family: sans-serif; color: #333;">
                                    <h2 style="color: ${isApproved ? "#28a745" : "#dc3545"};">
                                        Appointment ${isApproved ? "Approved" : "Rejected"}
                                    </h2>
                                    <p>Hello <strong>${patientName}</strong>,</p>
                                    <p>
                                        ${isApproved 
                                            ? "Good news! Your appointment has been <strong>approved</strong>." 
                                            : "We regret to inform you that your appointment request has been <strong>rejected</strong>."}
                                    </p>
                                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
                                        <p style="margin: 5px 0;"><strong>Doctor:</strong> ${formattedDocName}</p>
                                        <p style="margin: 5px 0;"><strong>Date:</strong> ${appointmentDate}</p>
                                        <p style="margin: 5px 0;"><strong>Time:</strong> ${appointmentTime}</p>
                                    </div>
                                    <p>
                                        ${isApproved 
                                            ? "Please make sure to arrive 10 minutes early." 
                                            : "If you have any questions, please contact the clinic."}
                                    </p>
                                    <p>Best regards,<br/>MediCare Team</p>
                                </div>
                            `
                        });

                        console.log(`EMAIL_SENT: appointment ${status} to ${patientEmail}`);
                    } catch (emailError) {
                        console.error(`EMAIL_ERROR: appointment status update ${emailError.message}`);
                    }
                });
            } else {
                console.warn("EMAIL_SKIPPED: missing patient email for appointment status update");
            }
        }

        res.json(populated);
    } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Doctor: list appointments
router.get("/doctor", auth("doctor"), async (req, res) => {
    try {
        const doctorDoc = await getDoctorProfileForUser(req.user.id);
        if (!doctorDoc) {
            return res.status(404).json({ message: "Doctor profile not found" });
        }
        const appointments = await Appoitment.find({
            $or: [
                { doctorId: req.user.id },
                { doctor: doctorDoc._id }
            ]
        })
            .populate("user", "name email")
            .populate("doctor")
            .sort({ createdAt: -1 });
        res.json(appointments);
    } catch (error) {
        console.error("Error fetching doctor appointments:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Alias: GET /doctor/appointments
router.get("/doctor/appointments", auth("doctor"), async (req, res) => {
    return router.handle({ ...req, url: "/doctor", method: "GET" }, res);
});

// Doctor: approve
router.put("/doctor/appointments/:id/approve", auth("doctor"), async (req, res) => {
    req.params = req.params || {};
    req.body = { ...req.body, status: "approved" };
    return router.handle({ ...req, url: `/${req.params.id}/status`, method: "PUT" }, res);
});

// Doctor: reject
router.put("/doctor/appointments/:id/reject", auth("doctor"), async (req, res) => {
    req.params = req.params || {};
    req.body = { ...req.body, status: "rejected" };
    return router.handle({ ...req, url: `/${req.params.id}/status`, method: "PUT" }, res);
});

export default router;