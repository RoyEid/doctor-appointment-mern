import express, { Router } from "express";
import Appoitment from "../models/AppointmentSchema.js";
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

    const appointment = await Appoitment.create({
        user: req.user.id,
        doctor,
        date,
        time,
        reason,
        status: 'pending'
    });

    res.status(201).json(appointment);
});

router.get("/myAppointments", auth(), async (req, res) => {
    try {
        let appointments;
        if (req.user.role === "admin") {
            appointments = await Appoitment.find()
                .populate("doctor")
                .populate("user", "name email");
        } else {
            appointments = await Appoitment.find({ user: req.user.id })
                .populate("doctor");
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

// ✅ Update Appointment Status (ADMIN ONLY)
router.put("/:id/status", auth("admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const appointment = await Appoitment.findByIdAndUpdate(id, { status }, { new: true })
            .populate("doctor")
            .populate("user", "name email");
        
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        
        res.json(appointment);
    } catch (error) {
        console.error("Error updating appointment status:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;