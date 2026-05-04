import express from "express";
import Appoitment from "../models/AppointmentSchema.js";
import Doctor from "../models/DoctorSchema.js";
import auth from "../auth/Middleware.js";
import { getDoctorProfileForUser } from "../utils/doctorAccess.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();
const ACTIVE_STATUSES = ["pending", "approved", "reschedule_pending"];
const ALL_STATUSES = ["pending", "approved", "rejected", "cancelled", "completed", "reschedule_pending"];

const formatDoctorName = (name) => {
    if (!name) return "N/A";
    const cleanName = name.trim();
    // Simplified prefix check
    if (cleanName.toLowerCase().startsWith("dr.") || cleanName.toLowerCase().startsWith("dr ") || cleanName.toLowerCase().startsWith("doctor")) {
        return cleanName;
    }
    return `Dr. ${cleanName}`;
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const formatTime = (time) => {
    if (!time) return "N/A";
    try {
        if (time.includes('AM') || time.includes('PM')) return time;
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHours = h % 12 || 12;
        return `${formattedHours}:${minutes} ${ampm}`;
    } catch (e) {
        return time;
    }
};

const getEmailHtml = ({ patientName, doctorName, date, time, title, message, oldSchedule = null }) => {
    return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #f8fcfd; padding: 20px; border-bottom: 2px solid #008e9b;">
            <h2 style="color: #008e9b; margin: 0;">${title}</h2>
        </div>
        <div style="padding: 20px;">
            <p>Hello <strong>${patientName}</strong>,</p>
            <p style="line-height: 1.5;">${message}</p>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Doctor:</strong> ${doctorName}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
                ${oldSchedule ? `<p style="margin: 10px 0 0 0; color: #777; font-size: 13px; border-top: 1px solid #eee; padding-top: 10px;"><strong>Previous:</strong> ${oldSchedule}</p>` : ''}
            </div>

            <p>Thank you,<br/><strong>MediCare Team</strong></p>
        </div>
    </div>
    `;
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
                const appDateFormatted = formatDate(populatedAppointment.date);
                const appTimeFormatted = formatTime(populatedAppointment.time);

                await sendEmail({
                    to: patientEmail,
                    subject: `Appointment Submitted - ${formattedDocName} - ${appDateFormatted}`,
                    html: getEmailHtml({
                        patientName,
                        doctorName: formattedDocName,
                        date: appDateFormatted,
                        time: appTimeFormatted,
                        title: "Appointment Request Submitted",
                        message: "Your appointment request has been submitted and is pending review."
                    })
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

        const oldDate = appointment.date;
        const oldTime = appointment.time;

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

        // If a doctor reschedules, set to reschedule_pending
        if (isRescheduling && !status) {
            appointment.status = "reschedule_pending";
            appointment.oldDate = oldDate;
            appointment.oldTime = oldTime;
        } else if (status) {
            appointment.status = status;
        }

        const updatedAppointment = await appointment.save();

        const populated = await Appoitment.findById(updatedAppointment._id)
            .populate("doctor")
            .populate("user", "name email");

        const patientEmail = populated.user?.email;
        const patientName = populated.user?.name || "Patient";

        const isApproved = status === "approved";
        const isRejected = status === "rejected";
        const isRescheduledMail = isRescheduling && !isRejected && !isApproved;

        if (isApproved || isRejected || isRescheduledMail) {
            if (patientEmail) {
                setImmediate(async () => {
                    try {
                        const formattedDocName = formatDoctorName(populated.doctor?.name);
                        const appDateFormatted = formatDate(populated.date);
                        const appTimeFormatted = formatTime(populated.time);

                        let mailSubject, mailTitle, mailMessage, oldSchedule = null;

                        if (isRescheduledMail) {
                            mailSubject = `Appointment Reschedule Request - ${formattedDocName} - ${appDateFormatted}`;
                            mailTitle = "Appointment Reschedule Request";
                            mailMessage = "Your doctor proposed a new appointment time. Please open your account to accept or reject the new time.";
                            oldSchedule = `${formatDate(oldDate)} at ${formatTime(oldTime)}`;
                        } else if (isApproved) {
                            mailSubject = `Appointment Approved - ${formattedDocName} - ${appDateFormatted}`;
                            mailTitle = "Appointment Approved";
                            mailMessage = "Your appointment has been approved.";
                        } else {
                            mailSubject = `Appointment Rejected - ${formattedDocName} - ${appDateFormatted}`;
                            mailTitle = "Appointment Rejected";
                            mailMessage = "Your appointment request was rejected.";
                        }

                        await sendEmail({
                            to: patientEmail,
                            subject: mailSubject,
                            html: getEmailHtml({
                                patientName,
                                doctorName: formattedDocName,
                                date: appDateFormatted,
                                time: appTimeFormatted,
                                title: mailTitle,
                                message: mailMessage,
                                oldSchedule
                            })
                        });

                        const logType = isRescheduledMail ? "reschedule_pending" : (isApproved ? "approved" : "rejected");
                        console.log(`EMAIL_SENT: appointment ${logType} to ${patientEmail}`);
                    } catch (emailError) {
                        console.error(`EMAIL_ERROR: appointment update ${emailError.message}`);
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

// User response to reschedule request
router.put("/:id/reschedule-response", auth(), async (req, res) => {
    try {
        const { id } = req.params;
        const { response } = req.body; // "accept" or "reject"

        console.log("🔄 Reschedule response request:", {
            appointmentId: id,
            response,
            userId: req.user.id
        });

        const appointment = await Appoitment.findById(id);
        if (!appointment) {
            console.warn("⚠️ Appointment not found:", id);
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (appointment.user?.toString() !== req.user.id) {
            console.warn("⚠️ Access denied - user mismatch:", {
                appointmentOwnerId: appointment.user?.toString(),
                requestUserId: req.user.id
            });
            return res.status(403).json({ message: "Access denied." });
        }

        if (response === "accept") {
            appointment.status = "approved";
        } else {
            appointment.status = "pending";
        }

        const saved = await appointment.save();
        const populated = await Appoitment.findById(saved._id)
            .populate("doctor")
            .populate("user", "name email");

        console.log("✅ Appointment updated:", {
            id: saved._id,
            newStatus: appointment.status,
            patientEmail: populated.user?.email
        });

        const patientEmail = populated.user?.email;
        if (patientEmail) {
            setImmediate(async () => {
                try {
                    const formattedDocName = formatDoctorName(populated.doctor?.name);
                    const appDateFormatted = formatDate(populated.date);

                    await sendEmail({
                        to: patientEmail,
                        subject: `Appointment Reschedule ${response === "accept" ? "Accepted" : "Rejected"} - ${formattedDocName}`,
                        html: getEmailHtml({
                            patientName: populated.user?.name || "Patient",
                            doctorName: formattedDocName,
                            date: appDateFormatted,
                            time: formatTime(populated.time),
                            title: `Appointment Reschedule ${response === "accept" ? "Accepted" : "Rejected"}`,
                            message: response === "accept"
                                ? "Your new appointment time is confirmed."
                                : "Your appointment is pending again. The doctor/admin can propose another time."
                        })
                    });
                    console.log("📧 Email sent to:", patientEmail);
                } catch (err) {
                    console.error("❌ EMAIL_ERROR: reschedule response", err.message);
                }
            });
        }

        res.json(populated);
    } catch (error) {
        console.error("❌ Reschedule response error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
