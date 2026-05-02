import express from "express";
import Departments from "../models/Departments.js";
import auth from "../auth/Middleware.js";

const router = express.Router();


// Add Department (ADMIN ONLY)
router.post("/addDepartment", auth("admin"), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ 
        success: false, 
        message: "Name and description are required" 
      });
    }

    // Check for duplicates
    const existingDepartment = await Departments.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingDepartment) {
      return res.status(400).json({ 
        success: false, 
        message: "A department with this name already exists" 
      });
    }

    const department = await Departments.create({
      name,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Department added successfully",
      department
    });

  } catch (error) {
    console.error("Error adding department:", error);
    res.status(500).json({ success: false, message: "Server error" });
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