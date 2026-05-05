import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import User from "./routes/user.js";
import Departments from "./routes/Departments.js";
import Doctor from "./routes/doctor.js";
import Appointment from "./routes/appointment.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log("====================================");
console.log("SERVER VERSION WITH HEALTH ROUTE IS RUNNING");
console.log("CORS + HEALTH FIX VERSION 2026-05-06");
console.log("====================================");

connectDB();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    next();
});

app.use(express.json());

app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "MediCare backend is running",
    });
});

app.get("/health", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Backend health check passed",
        version: "cors-health-fix-2026-05-06",
        time: new Date().toISOString(),
    });
});

app.get("/debug-version-roy", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "This is Roy's updated backend server.js",
        version: "cors-health-fix-2026-05-06",
        time: new Date().toISOString(),
    });
});

app.get("/test-email-verification-route", (req, res) => {
    return res.status(200).json({
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

// Static uploads
app.use("/uploads", express.static("uploads"));

app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl,
    });
});

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});