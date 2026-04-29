import express from "express";
import Doctor from "../models/DoctorSchema.js";
import multer from "multer";
import path from "path";
import auth from "../auth/Middleware.js";

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname); // Get file extension
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
});

const upload = multer({ storage });

router.post("/addDoctors", auth("admin"), upload.single("image"), async (req, res) => {
    try {
        console.log("=== ADD DOCTOR DEBUG ===");
        console.log("req.body:", req.body);
        console.log("req.file:", req.file);
        console.log("======================");

        const { name, specialty, description, experienceYears } = req.body;

        if (!name || !specialty || !description || !experienceYears) {
            console.log("Validation failed - Missing fields:", {
                name: !!name,
                specialty: !!specialty,
                description: !!description,
                experienceYears: !!experienceYears,
            });
            return res.status(400).json({ error: "All fields are required" });
        }

        const newDoctor = new Doctor({
            name,
            specialty,
            description,
            experienceYears,
            image: req.file ? req.file.filename : null,
        });

        const savedDoctor = await newDoctor.save();
        res.status(201).json(savedDoctor);
    } catch (error) {
        res.status(500).json({ message: error.message || "Server error" });
    }
});

router.get("/allDoctors", async (req, res) => {
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
        console.log('Searching for specialty', specialty)
        const doctors = await Doctor.find({
            specialty: { $regex: new RegExp(specialty, "i") }
        })
        console.log('Found doctors', doctors.length);
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

// ✅ Delete Doctor (ADMIN ONLY)
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

// ✅ Update Doctor (ADMIN ONLY)
router.put("/:id", auth("admin"), upload.single("image"), async (req, res) => {
    try {
        const { name, specialty, experienceYears, description } = req.body;
        const updateData = { name, specialty, experienceYears, description };
        
        if (req.file) {
            updateData.image = req.file.filename;
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

export default router;