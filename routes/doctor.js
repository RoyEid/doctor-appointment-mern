import express from "express";
import Doctor from "../models/DoctorSchema.js";
import multer from "multer";
import path from "path";
import auth from "../auth/Middleware.js";
import User from "../models/UserSchema.js";
import bcrypt from "bcryptjs";
import { getDoctorProfileForUser } from "../utils/doctorAccess.js";

import { storage } from "../config/cloudinary.js";

const router = express.Router();

const upload = multer({ storage });

// Doctor self profile update
router.put("/update-profile", auth("doctor"), upload.single("image"), async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const doctor = await getDoctorProfileForUser(req.user.id);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor profile not found" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User account not found" });
        }

        if (name) {
            user.name = name;
            doctor.name = name;
        }

        if (email) {
            const normalizedEmail = email.trim().toLowerCase();
            const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
            if (existingUser) {
                return res.status(400).json({ message: "A user with this email already exists" });
            }
            user.email = normalizedEmail;
        }

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        if (req.file) {
            doctor.image = req.file.path;
        }

        await user.save();
        await doctor.save();

        return res.json({
            message: "Doctor profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            doctor: {
                id: doctor._id,
                image: doctor.image
            }
        });
    } catch (error) {
        console.error("Error updating doctor profile:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// Admin: create doctor (alias) -> /admin/create-doctor
router.post("/admin/create-doctor", auth("admin"), upload.single("image"), async (req, res) => {
    return createDoctorHandler(req, res);
});

// Legacy admin: /addDoctors (compat)
router.post("/addDoctors", auth("admin"), upload.single("image"), async (req, res) => {
    return createDoctorHandler(req, res);
});

async function createDoctorHandler(req, res) {
    try {
        const { name, specialty, description, experienceYears, email, password } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();

        if (!name || !specialty || !normalizedEmail || !password) {
            return res.status(400).json({ message: "name, email, password and specialty are required" });
        }

        const userExist = await User.findOne({ email: normalizedEmail });
        if (userExist) {
            return res.status(400).json({ message: "A user with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: "doctor"
        });

        const newDoctor = new Doctor({
            name,
            specialty,
            description,
            experienceYears,
            image: req.file ? req.file.path : null,
            userId: newUser._id
        });

        const savedDoctor = await newDoctor.save();
        res.status(201).json({
            message: "Doctor account created successfully",
            data: {
                doctor: {
                    id: savedDoctor._id,
                    name: savedDoctor.name,
                    specialty: savedDoctor.specialty,
                    image: savedDoctor.image
                },
                user: {
                    id: newUser._id,
                    email: newUser.email,
                    role: newUser.role
                },
                credentials: {
                    email: newUser.email,
                    password
                }
            }
        });
    } catch (error) {
        console.error("Error adding doctor:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
}

// Public list
router.get("/allDoctors", async (req, res) => {
    const doctors = await Doctor.find();
    res.json(doctors);
});

// Admin list (alias) -> /admin/doctors
router.get("/admin/doctors", auth("admin"), async (req, res) => {
    const doctors = await Doctor.find();
    res.json(doctors);
});

router.get("/count", async (req, res) => {
    try {
        const count = await Doctor.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: "Error fetching doctors count" });
    }
});

router.get("/doctors/byspecialty/:specialty", async (req, res) => {
    try {
        const { specialty } = req.params;
        const doctors = await Doctor.find({
            specialty: { $regex: new RegExp(specialty, "i") }
        })
        res.json(doctors);
    } catch (error) {
        console.error("error", error)
        res.status(500).json({ message: error.message })
    }
})

router.get("/:id", async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
});

// Delete Doctor (ADMIN ONLY) legacy
router.delete("/:id", auth("admin"), async (req, res) => {
    try {
        const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);
        if (!deletedDoctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        res.json({ message: "Doctor deleted successfully" });
    } catch (error) {
        console.error("Error deleting doctor:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Admin alias delete -> /admin/doctors/:id
router.delete("/admin/doctors/:id", auth("admin"), async (req, res) => {
    try {
        const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);
        if (!deletedDoctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        res.json({ message: "Doctor deleted successfully" });
    } catch (error) {
        console.error("Error deleting doctor:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update Doctor (ADMIN ONLY)
router.put("/:id", auth("admin"), upload.single("image"), async (req, res) => {
    try {
        const { name, specialty, experienceYears, description } = req.body;
        const updateData = { name, specialty, experienceYears, description };

        if (req.file) {
            updateData.image = req.file.path;
        }

        const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!updatedDoctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.json(updatedDoctor);
    } catch (error) {
        console.error("Error updating doctor:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update Availability (DOCTOR ONLY)
router.put("/availability", auth("doctor"), async (req, res) => {
    try {
        const { availableSlots } = req.body;
        
        if (!Array.isArray(availableSlots)) {
            return res.status(400).json({ message: "availableSlots must be an array" });
        }

        const doctor = await getDoctorProfileForUser(req.user.id);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor profile not found" });
        }

        doctor.availableSlots = availableSlots;
        const updatedDoctor = await doctor.save();
        
        res.json(updatedDoctor);
    } catch (error) {
        console.error("Error updating availability:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;