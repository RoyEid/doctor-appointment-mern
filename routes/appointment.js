import express from "express";
import Appointment from "../models/AppointmentSchema.js";
import Doctor from "../models/DoctorSchema.js";
import User from "../models/UserSchema.js";
import auth from "../auth/Middleware.js";
import { getDoctorProfileForUser } from "../utils/doctorAccess.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

const ACTIVE_STATUSES = ["pending", "approved", "reschedule_pending"];
const ALL_STATUSES = [
    "pending",
    "approved",
    "rejected",
    "cancelled",
    "completed",
    "reschedule_pending",
];

const DEFAULT_SLOTS = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
];

const formatDoctorName = (name) => {
    if (!name) return "N/A";

    const cleanName = name.trim();
    const lower = cleanName.toLowerCase();

    if (
        lower.startsWith("dr.") ||
        lower.startsWith("dr ") ||
        lower.startsWith("doctor")
    ) {
        return cleanName;
    }

    return `Dr. ${cleanName}`;
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

const formatTime = (time) => {
    if (!time) return "N/A";

    try {
        if (time.includes("AM") || time.includes("PM")) return time;

        const [hours, minutes] = time.split(":");
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? "PM" : "AM";
        const formattedHours = h % 12 || 12;

        return `${formattedHours}:${minutes} ${ampm}`;
    } catch (e) {
        return time;
    }
};

const getEmailHtml = ({
    patientName,
    doctorName,
    date,
    time,
    title,
    message,
    oldSchedule = null,
}) => {
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
          ${oldSchedule
            ? `<p style="margin: 10px 0 0 0; color: #777; font-size: 13px; border-top: 1px solid #eee; padding-top: 10px;"><strong>Previous:</strong> ${oldSchedule}</p>`
            : ""
        }
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

const isPastDate = (dateValue) => {
    const dayRange = getDayRange(dateValue);
    if (!dayRange) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return dayRange.dayStart < today;
};

const getDoctorSlots = (doctorProfile) => {
    if (
        doctorProfile &&
        Array.isArray(doctorProfile.availableSlots) &&
        doctorProfile.availableSlots.length > 0
    ) {
        return doctorProfile.availableSlots;
    }

    return DEFAULT_SLOTS;
};

const getDoctorByProfileOrUser = async (doctorId) => {
    let doctorProfile = await Doctor.findById(doctorId);

    if (!doctorProfile) {
        doctorProfile = await Doctor.findOne({ userId: doctorId });
    }

    return doctorProfile;
};

const hasDoctorConflict = async ({
    appointmentId = null,
    doctorId,
    doctor,
    date,
    time,
}) => {
    const dayRange = getDayRange(date);

    if (!dayRange) return false;

    const conflict = await Appointment.findOne({
        _id: appointmentId ? { $ne: appointmentId } : { $exists: true },
        $or: [{ doctorId }, { doctor }],
        date: { $gte: dayRange.dayStart, $lte: dayRange.dayEnd },
        time,
        status: { $in: ACTIVE_STATUSES },
    });

    return Boolean(conflict);
};

const sendAppointmentEmail = async ({
    patientEmail,
    patientName,
    doctorName,
    date,
    time,
    subject,
    title,
    message,
    oldSchedule = null,
}) => {
    if (!patientEmail) return;

    setImmediate(async () => {
        try {
            await sendEmail({
                to: patientEmail,
                subject,
                html: getEmailHtml({
                    patientName,
                    doctorName,
                    date,
                    time,
                    title,
                    message,
                    oldSchedule,
                }),
            });

            console.log(`EMAIL_SENT: ${subject} to ${patientEmail}`);
        } catch (emailError) {
            console.error(`EMAIL_ERROR: ${emailError.message}`);
        }
    });
};

/**
 * Availability endpoint
 * Patient uses this to see available 30-minute slots.
 *
 * Example:
 * GET /appointments/availability?doctorId=DOCTOR_PROFILE_ID&date=2026-05-06
 *
 * Returns:
 * {
 *   date,
 *   doctorId,
 *   slots: [
 *     { time: "09:00", available: true },
 *     { time: "09:30", available: false, status: "approved" }
 *   ],
 *   availableSlots: ["09:00"],
 *   bookedSlots: ["09:30"]
 * }
 */
router.get("/availability", async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        if (!doctorId || !date) {
            return res.status(400).json({
                message: "doctorId and date are required.",
            });
        }

        const dayRange = getDayRange(date);

        if (!dayRange) {
            return res.status(400).json({
                message: "Invalid date.",
            });
        }

        const doctorProfile = await getDoctorByProfileOrUser(doctorId);

        if (!doctorProfile) {
            return res.status(404).json({
                message: "Doctor not found.",
            });
        }

        const allSlots = getDoctorSlots(doctorProfile);

        const appointments = await Appointment.find({
            $or: [{ doctorId: doctorProfile.userId }, { doctor: doctorProfile._id }],
            date: { $gte: dayRange.dayStart, $lte: dayRange.dayEnd },
            status: { $in: ACTIVE_STATUSES },
        })
            .populate("user", "name email")
            .select("time status user reason date");

        const bookedMap = new Map();

        appointments.forEach((appointment) => {
            bookedMap.set(appointment.time, appointment);
        });

        const slots = allSlots.map((slot) => {
            const appointment = bookedMap.get(slot);

            return {
                time: slot,
                available: !appointment,
                status: appointment?.status || null,

                // Patient UI should NOT show these.
                // Doctor UI may use them if needed.
                patient:
                    req.user?.role === "doctor" || req.user?.role === "admin"
                        ? appointment?.user || null
                        : null,
                reason:
                    req.user?.role === "doctor" || req.user?.role === "admin"
                        ? appointment?.reason || null
                        : null,
            };
        });

        return res.json({
            doctorId: doctorProfile._id,
            doctorUserId: doctorProfile.userId,
            date: dayRange.dayStart,
            durationMinutes: 30,
            slots,
            availableSlots: slots
                .filter((slot) => slot.available)
                .map((slot) => slot.time),
            bookedSlots: slots
                .filter((slot) => !slot.available)
                .map((slot) => slot.time),
        });
    } catch (error) {
        console.error("AVAILABILITY_ERROR:", error);

        return res.status(500).json({
            message: "Could not load availability.",
        });
    }
});

/**
 * Doctor schedule endpoint
 * Doctor sees only their own schedule with patient info.
 *
 * GET /appointments/doctor/schedule?date=2026-05-06
 */
router.get("/doctor/schedule", auth("doctor"), async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                message: "Date is required.",
            });
        }

        const dayRange = getDayRange(date);

        if (!dayRange) {
            return res.status(400).json({
                message: "Invalid date.",
            });
        }

        const doctorDoc = await getDoctorProfileForUser(req.user.id);

        if (!doctorDoc) {
            return res.status(404).json({
                message: "Doctor profile not found.",
            });
        }

        const allSlots = getDoctorSlots(doctorDoc);

        const appointments = await Appointment.find({
            $or: [{ doctorId: req.user.id }, { doctor: doctorDoc._id }],
            date: { $gte: dayRange.dayStart, $lte: dayRange.dayEnd },
            status: { $in: ACTIVE_STATUSES },
        })
            .populate("user", "name email")
            .populate("doctor")
            .sort({ time: 1 });

        const bookedMap = new Map();

        appointments.forEach((appointment) => {
            bookedMap.set(appointment.time, appointment);
        });

        const slots = allSlots.map((slot) => {
            const appointment = bookedMap.get(slot);

            return {
                time: slot,
                available: !appointment,
                appointment: appointment || null,
            };
        });

        return res.json({
            date: dayRange.dayStart,
            durationMinutes: 30,
            slots,
            appointments,
        });
    } catch (error) {
        console.error("DOCTOR_SCHEDULE_ERROR:", error);

        return res.status(500).json({
            message: "Could not load doctor schedule.",
        });
    }
});

/**
 * Create appointment
 */
router.post("/createAppointment", auth(), async (req, res) => {
    return createAppointmentHandler(req, res);
});

router.post("/", auth(), async (req, res) => {
    return createAppointmentHandler(req, res);
});

async function createAppointmentHandler(req, res) {
    try {
        const { doctor, date, time, reason } = req.body;

        if (!doctor || !date || !time || !reason) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const currentUser = await User.findById(req.user.id);

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (currentUser.role !== "user") {
            return res.status(403).json({
                message: "Only patients can book appointments.",
            });
        }

        if (!currentUser.isEmailVerified) {
            return res.status(403).json({
                message: "Please verify your email before booking an appointment.",
            });
        }

        const dayRange = getDayRange(date);

        if (!dayRange) {
            return res.status(400).json({ message: "Invalid appointment date" });
        }

        if (isPastDate(date)) {
            return res.status(400).json({
                message: "Cannot book appointments in the past.",
            });
        }

        const docProfile = await Doctor.findById(doctor);

        if (!docProfile) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        const allowedSlots = getDoctorSlots(docProfile);

        if (!allowedSlots.includes(time)) {
            return res.status(400).json({
                message: `Doctor is only available at: ${allowedSlots.join(", ")}`,
            });
        }

        const conflictExists = await hasDoctorConflict({
            doctorId: docProfile.userId,
            doctor: docProfile._id,
            date: dayRange.dayStart,
            time,
        });

        if (conflictExists) {
            return res.status(400).json({
                message:
                    "This time is already booked for this doctor. Please choose another time.",
            });
        }

        const appointment = await Appointment.create({
            user: req.user.id,
            doctorId: docProfile.userId,
            doctor: docProfile._id,
            date: dayRange.dayStart,
            time,
            reason,
            status: "pending",
        });

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate("doctor")
            .populate("user", "name email");

        const patientEmail = populatedAppointment.user?.email;
        const patientName = populatedAppointment.user?.name || "Patient";
        const formattedDocName = formatDoctorName(populatedAppointment.doctor?.name);
        const appDateFormatted = formatDate(populatedAppointment.date);
        const appTimeFormatted = formatTime(populatedAppointment.time);

        await sendAppointmentEmail({
            patientEmail,
            patientName,
            doctorName: formattedDocName,
            date: appDateFormatted,
            time: appTimeFormatted,
            subject: `Appointment Submitted - ${formattedDocName} - ${appDateFormatted}`,
            title: "Appointment Request Submitted",
            message:
                "Your appointment request has been submitted and is pending review.",
        });

        return res.status(201).json(populatedAppointment);
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(400).json({
                message:
                    "This time is already booked for this doctor. Please choose another time.",
            });
        }

        console.error("CREATE_APPOINTMENT_ERROR:", error);

        return res.status(500).json({
            message: "Could not create appointment.",
        });
    }
}

/**
 * List appointments
 */
router.get("/myAppointments", auth(), async (req, res) => {
    return listAppointmentsHandler(req, res);
});

router.get("/my", auth(), async (req, res) => {
    return listAppointmentsHandler(req, res);
});

async function listAppointmentsHandler(req, res) {
    try {
        let appointments;

        if (req.user.role === "admin") {
            appointments = await Appointment.find()
                .populate("doctor")
                .populate("user", "name email")
                .sort({ createdAt: -1 });
        } else if (req.user.role === "doctor") {
            const doctorDoc = await getDoctorProfileForUser(req.user.id);

            if (!doctorDoc) {
                return res.status(404).json({ message: "Doctor profile not found" });
            }

            appointments = await Appointment.find({
                $or: [{ doctorId: req.user.id }, { doctor: doctorDoc._id }],
            })
                .populate("user", "name email")
                .populate("doctor")
                .sort({ createdAt: -1 });
        } else {
            appointments = await Appointment.find({ user: req.user.id })
                .populate("doctor")
                .sort({ createdAt: -1 });
        }

        return res.json(appointments);
    } catch (error) {
        console.error("LIST_APPOINTMENTS_ERROR:", error);

        return res.status(500).json({
            message: "Error fetching appointments",
        });
    }
}

/**
 * Legacy delete endpoint
 */
router.post("/deleteAppointment/:id", auth(), async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        const isOwner = appointment.user?.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Access denied." });
        }

        await Appointment.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Appointment deleted successfully",
        });
    } catch (error) {
        console.error("LEGACY_DELETE_APPOINTMENT_ERROR:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
});

/**
 * RESTful cancel/delete
 */
router.delete("/:id", auth(), async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        const isOwner = appointment.user?.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";

        if (isAdmin) {
            await Appointment.findByIdAndDelete(id);
            return res.json({ message: "Appointment removed by admin" });
        }

        if (!isOwner) {
            return res.status(403).json({ message: "Access denied." });
        }

        if (["approved", "pending", "reschedule_pending"].includes(appointment.status)) {
            appointment.status = "cancelled";
            await appointment.save();

            const populated = await Appointment.findById(appointment._id)
                .populate("doctor")
                .populate("user", "name email");

            return res.json(populated);
        }

        await Appointment.findByIdAndDelete(id);

        return res.json({ message: "Appointment removed" });
    } catch (error) {
        console.error("DELETE_APPOINTMENT_ERROR:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
});

/**
 * Update appointment status or propose reschedule
 */
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

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (isDoctor && appointment.doctorId?.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Access denied. You are not assigned to this appointment.",
            });
        }

        const isRescheduling = time !== undefined || date !== undefined;

        if (isDoctor) {
            if (
                !isRescheduling &&
                (!status || !["approved", "rejected"].includes(status))
            ) {
                return res.status(400).json({
                    message: "Doctors can only approve, reject, or reschedule appointments.",
                });
            }
        }

        const oldDate = appointment.date;
        const oldTime = appointment.time;

        const doctorProfile = await Doctor.findById(appointment.doctor);

        if (!doctorProfile) {
            return res.status(404).json({
                message: "Doctor profile not found.",
            });
        }

        const nextDate = date !== undefined ? date : appointment.date;
        const nextTime = time !== undefined ? time : appointment.time;
        const nextStatus = status || appointment.status;

        const nextDayRange = getDayRange(nextDate);

        if (!nextDayRange) {
            return res.status(400).json({
                message: "Invalid appointment date.",
            });
        }

        if (isPastDate(nextDate)) {
            return res.status(400).json({
                message: "Cannot reschedule appointments to a past date.",
            });
        }

        const allowedSlots = getDoctorSlots(doctorProfile);

        if (nextTime && !allowedSlots.includes(nextTime)) {
            return res.status(400).json({
                message: `Doctor is only available at: ${allowedSlots.join(", ")}`,
            });
        }

        if (ACTIVE_STATUSES.includes(nextStatus) && nextTime) {
            const conflictExists = await hasDoctorConflict({
                appointmentId: id,
                doctorId: appointment.doctorId,
                doctor: appointment.doctor,
                date: nextDayRange.dayStart,
                time: nextTime,
            });

            if (conflictExists) {
                return res.status(400).json({
                    message: "Time slot already booked for this doctor.",
                });
            }
        }

        if (date !== undefined) {
            appointment.date = nextDayRange.dayStart;
        }

        if (time !== undefined) {
            appointment.time = time;
        }

        if (isRescheduling && !status) {
            appointment.status = "reschedule_pending";
            appointment.oldDate = oldDate;
            appointment.oldTime = oldTime;
        } else if (status) {
            appointment.status = status;
        }

        const updatedAppointment = await appointment.save();

        const populated = await Appointment.findById(updatedAppointment._id)
            .populate("doctor")
            .populate("user", "name email");

        const patientEmail = populated.user?.email;
        const patientName = populated.user?.name || "Patient";
        const formattedDocName = formatDoctorName(populated.doctor?.name);
        const appDateFormatted = formatDate(populated.date);
        const appTimeFormatted = formatTime(populated.time);

        const isApproved = status === "approved";
        const isRejected = status === "rejected";
        const isRescheduledMail = isRescheduling && !isRejected && !isApproved;

        if (isApproved || isRejected || isRescheduledMail) {
            let mailSubject;
            let mailTitle;
            let mailMessage;
            let oldSchedule = null;

            if (isRescheduledMail) {
                mailSubject = `Appointment Reschedule Request - ${formattedDocName} - ${appDateFormatted}`;
                mailTitle = "Appointment Reschedule Request";
                mailMessage =
                    "Your doctor proposed a new appointment time. Please open your account to accept or reject the new time.";
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

            await sendAppointmentEmail({
                patientEmail,
                patientName,
                doctorName: formattedDocName,
                date: appDateFormatted,
                time: appTimeFormatted,
                subject: mailSubject,
                title: mailTitle,
                message: mailMessage,
                oldSchedule,
            });
        }

        return res.json(populated);
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(400).json({
                message: "Time slot already booked for this doctor.",
            });
        }

        console.error("UPDATE_APPOINTMENT_ERROR:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
});

/**
 * Doctor list appointments
 */
router.get("/doctor", auth("doctor"), async (req, res) => {
    try {
        const doctorDoc = await getDoctorProfileForUser(req.user.id);

        if (!doctorDoc) {
            return res.status(404).json({ message: "Doctor profile not found" });
        }

        const appointments = await Appointment.find({
            $or: [{ doctorId: req.user.id }, { doctor: doctorDoc._id }],
        })
            .populate("user", "name email")
            .populate("doctor")
            .sort({ createdAt: -1 });

        return res.json(appointments);
    } catch (error) {
        console.error("DOCTOR_APPOINTMENTS_ERROR:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
});

router.get("/doctor/appointments", auth("doctor"), async (req, res) => {
    try {
        const doctorDoc = await getDoctorProfileForUser(req.user.id);

        if (!doctorDoc) {
            return res.status(404).json({ message: "Doctor profile not found" });
        }

        const appointments = await Appointment.find({
            $or: [{ doctorId: req.user.id }, { doctor: doctorDoc._id }],
        })
            .populate("user", "name email")
            .populate("doctor")
            .sort({ createdAt: -1 });

        return res.json(appointments);
    } catch (error) {
        console.error("DOCTOR_APPOINTMENTS_ALIAS_ERROR:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
});

router.put("/doctor/appointments/:id/approve", auth("doctor"), async (req, res) => {
    req.body = { ...req.body, status: "approved" };
    req.url = `/${req.params.id}/status`;
    return router.handle(req, res);
});

router.put("/doctor/appointments/:id/reject", auth("doctor"), async (req, res) => {
    req.body = { ...req.body, status: "rejected" };
    req.url = `/${req.params.id}/status`;
    return router.handle(req, res);
});

/**
 * Patient response to doctor reschedule request
 */
router.put("/:id/reschedule-response", auth(), async (req, res) => {
    try {
        const { id } = req.params;
        const { response } = req.body;

        if (!["accept", "reject"].includes(response)) {
            return res.status(400).json({
                message: "Response must be accept or reject.",
            });
        }

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found",
            });
        }

        if (appointment.user?.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Access denied.",
            });
        }

        if (appointment.status !== "reschedule_pending") {
            return res.status(400).json({
                message: "This appointment does not have a pending reschedule request.",
            });
        }

        if (response === "accept") {
            appointment.status = "approved";
            appointment.oldDate = null;
            appointment.oldTime = null;
        }

        if (response === "reject") {
            if (appointment.oldDate) {
                appointment.date = appointment.oldDate;
            }

            if (appointment.oldTime) {
                appointment.time = appointment.oldTime;
            }

            appointment.status = "pending";
            appointment.oldDate = null;
            appointment.oldTime = null;
        }

        const saved = await appointment.save();

        const populated = await Appointment.findById(saved._id)
            .populate("doctor")
            .populate("user", "name email");

        const patientEmail = populated.user?.email;
        const patientName = populated.user?.name || "Patient";
        const formattedDocName = formatDoctorName(populated.doctor?.name);
        const appDateFormatted = formatDate(populated.date);
        const appTimeFormatted = formatTime(populated.time);

        await sendAppointmentEmail({
            patientEmail,
            patientName,
            doctorName: formattedDocName,
            date: appDateFormatted,
            time: appTimeFormatted,
            subject: `Appointment Reschedule ${response === "accept" ? "Accepted" : "Rejected"
                } - ${formattedDocName}`,
            title: `Appointment Reschedule ${response === "accept" ? "Accepted" : "Rejected"
                }`,
            message:
                response === "accept"
                    ? "Your new appointment time is confirmed."
                    : "Your appointment is pending again. The doctor can propose another time if needed.",
        });

        return res.json(populated);
    } catch (error) {
        console.error("RESCHEDULE_RESPONSE_ERROR:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
});

export default router;