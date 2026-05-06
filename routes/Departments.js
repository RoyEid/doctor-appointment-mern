import express from "express";
import Departments from "../models/Departments.js";
import auth from "../auth/Middleware.js";

const router = express.Router();

const escapeRegExp = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const getAllDepartmentsHandler = async (req, res) => {
  try {
    const departments = await Departments.find().sort({ createdAt: -1 });
    return res.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching departments",
    });
  }
};

const createDepartmentHandler = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required",
      });
    }

    const cleanName = name.trim();
    const cleanDescription = description.trim();

    const existingDepartment = await Departments.findOne({
      name: {
        $regex: new RegExp(`^${escapeRegExp(cleanName)}$`, "i"),
      },
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: "A department with this name already exists",
      });
    }

    const department = await Departments.create({
      name: cleanName,
      description: cleanDescription,
    });

    return res.status(201).json({
      success: true,
      message: "Department added successfully",
      department,
    });
  } catch (error) {
    console.error("Error adding department:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Add Department
router.post("/", auth("admin"), createDepartmentHandler);
router.post("/addDepartment", auth("admin"), createDepartmentHandler);

// Get all departments
router.get("/", getAllDepartmentsHandler);
router.get("/allDepartments", getAllDepartmentsHandler);

// Get departments count
router.get("/count", async (req, res) => {
  try {
    const count = await Departments.countDocuments();

    return res.json({ count });
  } catch (error) {
    console.error("Error fetching departments count:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching departments count",
    });
  }
});

// Get one department by id
router.get("/:id", async (req, res) => {
  try {
    const department = await Departments.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.json(department);
  } catch (error) {
    console.error("Error fetching department:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Update Department
router.put("/:id", auth("admin"), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required",
      });
    }

    const cleanName = name.trim();
    const cleanDescription = description.trim();

    const existingDepartment = await Departments.findOne({
      _id: { $ne: req.params.id },
      name: {
        $regex: new RegExp(`^${escapeRegExp(cleanName)}$`, "i"),
      },
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: "A department with this name already exists",
      });
    }

    const updatedDepartment = await Departments.findByIdAndUpdate(
      req.params.id,
      {
        name: cleanName,
        description: cleanDescription,
      },
      { new: true }
    );

    if (!updatedDepartment) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.json({
      success: true,
      message: "Department updated successfully",
      department: updatedDepartment,
    });
  } catch (error) {
    console.error("Error updating department:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Delete Department
router.delete("/:id", auth("admin"), async (req, res) => {
  try {
    const deletedDepartment = await Departments.findByIdAndDelete(req.params.id);

    if (!deletedDepartment) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting department:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;