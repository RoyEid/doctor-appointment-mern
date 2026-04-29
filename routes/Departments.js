import express from "express";
import Departments from "../models/Departments.js";
import auth from "../auth/Middleware.js";

const router = express.Router();


// Add Department (ADMIN ONLY)
router.post("/addDepartment", auth("admin"), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const department = await Departments.create({
      name,
      description,
    });

    res.status(201).json(department);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


//  Get all departments
router.get("/allDepartments", async (req, res) => {
  try {
    const departments = await Departments.find();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching departments" });
  }
});


//  Get departments count (for dashboard)
router.get("/count", async (req, res) => {
  try {
    const count = await Departments.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching departments count" });
  }
});


// Delete Department (ADMIN ONLY)
router.delete("/:id", auth("admin"), async (req, res) => {
  try {
    const deletedDepartment = await Departments.findByIdAndDelete(req.params.id);
    if (!deletedDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;