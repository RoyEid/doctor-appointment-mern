import express, { Router } from "express";
import Appoitment from "../models/AppointmentSchema.js";
import Doctor from "../models/DoctorSchema.js";
import auth from "../auth/Middleware.js";
import { getDoctorProfileForUser } from "../utils/doctorAccess.js";

const router = express.Router();
const ACTIVE_STATUSES = ["pending", "approved"];

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
        _id: { $ne: appointmentId },
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

router.post("/createAppointment", auth(), async (req, res) => {
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

    // New: Availability check
    if (docProfile && docProfile.availableSlots && docProfile.availableSlots.length > 0) {
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
        status: { $in: ["pending", "approved"] }
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

    const populatedAppointment = await Appoitment.findById(appointment._id).populate("doctor");
    res.status(201).json(populatedAppointment);
});

router.get("/myAppointments", auth(), async (req, res) => {
    try {
        let appointments;
        if (req.user.role === "admin") {
            appointments = await Appoitment.find()
                .populate("doctor")
                .populate("user", "name email")
                .sort({ createdAt: -1 });
        } else if (req.user.role === "doctor") {
            // Find the doctor doc for this user account
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
});

router.post("/deleteAppointment/:id", auth(), async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appoitment.findByIdAndDelete(id);
        if (!appointment) {
            res.status(404).json({ message: "Appointment not found" });
        } else {
            res.status(200).json({ message: "Appointment deleted successfully" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Update Appointment Status & Time (ADMIN & ASSIGNED DOCTOR)
router.put("/:id/status", auth(), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, time, date } = req.body;
        const isAdmin = req.user.role === "admin";
        const isDoctor = req.user.role === "doctor";
        
        if (!isAdmin && !isDoctor) {
            return res.status(403).json({ message: "Access denied." });
        }
        
        if (status && !['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const appointment = await Appoitment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Security Check: doctor must be explicitly assigned via doctorId
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
        if (nextStatus !== "rejected" && nextTime) {
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

        // Rescheduling requires re-confirmation by default.
        if (isRescheduling && !status) {
            appointment.status = "pending";
        }
        
        const updatedAppointment = await appointment.save();
        
        const populated = await Appoitment.findById(updatedAppointment._id)
            .populate("doctor")
            .populate("user", "name email");
        
        res.json(populated);
    } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Get Doctor's Appointments (DOCTOR ONLY)
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

export default router;