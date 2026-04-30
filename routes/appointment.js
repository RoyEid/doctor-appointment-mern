import express, { Router } from "express";
import Appoitment from "../models/AppointmentSchema.js";
import Doctor from "../models/DoctorSchema.js";
import auth from "../auth/Middleware.js";

const router = express.Router();

router.post("/createAppointment", auth(), async (req, res) => {
    const { doctor, date, time, reason } = req.body;
    if (!doctor || !date || !time || !reason) {
        return res.status(400).json({ message: "Missing fields" });
    }

    const appDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appDate < today) {
        return res.status(400).json({ message: "Cannot book appointments in the past" });
    }

    // New: Availability check
    const docProfile = await Doctor.findById(doctor);
    if (docProfile && docProfile.availableSlots && docProfile.availableSlots.length > 0) {
        if (!docProfile.availableSlots.includes(time)) {
            return res.status(400).json({ message: `Doctor is only available at: ${docProfile.availableSlots.join(", ")}` });
        }
    }

    const existing = await Appoitment.findOne({
        doctor,
        date,
        time,
        status: { $in: ["pending", "approved"] }
    });

    if (existing) {
        return res.status(400).json({
            message: "Time slot already booked"
        });
    }

    const appointment = await Appoitment.create({
        user: req.user.id,
        doctor,
        date,
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
            const doctorDoc = await Doctor.findOne({ userId: req.user.id });
            if (!doctorDoc) {
                return res.status(404).json({ message: "Doctor profile not found" });
            }
            appointments = await Appoitment.find({ doctor: doctorDoc._id })
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
        const { status, time } = req.body;
        
        if (status && !['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const appointment = await Appoitment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Security Check
        const isAdmin = req.user.role === "admin";
        let isAssignedDoctor = false;

        if (req.user.role === "doctor") {
            const doctorProfile = await Doctor.findOne({ userId: req.user.id });
            if (doctorProfile && appointment.doctor.toString() === doctorProfile._id.toString()) {
                isAssignedDoctor = true;
            }
        }

        if (!isAdmin && !isAssignedDoctor) {
            return res.status(403).json({ message: "Access denied. You can only update your own appointments." });
        }

        // Update fields if provided
        if (status) appointment.status = status;
        
        if (time !== undefined && time !== appointment.time) {
            // Check for double booking if time is changing
            const checkStatus = status || appointment.status;
            if (checkStatus !== "rejected") {
                const conflict = await Appoitment.findOne({
                    _id: { $ne: id },
                    doctor: appointment.doctor,
                    date: appointment.date,
                    time: time,
                    status: { $in: ["pending", "approved"] }
                });

                if (conflict) {
                    return res.status(400).json({ message: "Time slot already booked" });
                }
            }
            appointment.time = time;
        } else if (status && status !== "rejected" && appointment.time) {
             // If status is becoming active but time stayed same, check for conflicts 
             // (e.g. if another appointment was made to this slot while this was rejected/pending)
             const conflict = await Appoitment.findOne({
                _id: { $ne: id },
                doctor: appointment.doctor,
                date: appointment.date,
                time: appointment.time,
                status: { $in: ["pending", "approved"] }
            });

            if (conflict) {
                return res.status(400).json({ message: "Time slot already booked" });
            }
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
        const doctorDoc = await Doctor.findOne({ userId: req.user.id });
        if (!doctorDoc) {
            return res.status(404).json({ message: "Doctor profile not found" });
        }
        const appointments = await Appoitment.find({ doctor: doctorDoc._id })
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