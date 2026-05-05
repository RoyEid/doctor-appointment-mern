import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import User from "./routes/user.js";
import Departments from "./routes/Departments.js";
import Doctor from "./routes/doctor.js";
import Appointment from "./routes/appointment.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

connectDB();

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://doctor-appointment-mern-nu.vercel.app",
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin like Postman, server-to-server, etc.
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked this origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "MediCare backend is running",
    });
});

app.get("/test-email-verification-route", (req, res) => {
    res.json({
        success: true,
        message: "Email verification backend route is live",
    });
});

// User/Auth routes
app.use("/user", User);
app.use("/auth", User);
app.use("/api/user", User);
app.use("/api/auth", User);

// Doctor routes
app.use("/doctors", Doctor);
app.use("/api/doctors", Doctor);

// Appointment routes
app.use("/appointments", Appointment);
app.use("/api/appointments", Appointment);

// Department routes
app.use("/departments", Departments);
app.use("/api/departments", Departments);

// Uploads
app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});