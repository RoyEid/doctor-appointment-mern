// import express, { request } from "express";
// import Departments from "../models/Departments.js";
// import auth from "../auth/Middleware.js";
// import multer from "multer";

// const router = express.Router();

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix);
//   },
// });

// const upload = multer({ storage });

// router.post("/addDepartments", auth("admin"), async (req, res) => {
//   // if (req.user.role !== "admin") {
//   //   return res.status(403).json({ message: "Not authorized" });
//   // }

//   const { name, description } = req.body;
//   const image = req.file ? req.file.filename : null;

//   if (!name) {
//     return res.status(400).json({ message: "Name is required" });
//   }

//   const department = await Departments.create({
//     name,
//     description,
//     image,
//   });

//   res.status(201).json(department);
// });


// // Get all departments
// router.get("/allDepartments", async (req, res) => {
//   try {
//     const departments = await Departments.find();
//     res.json(departments);
//   } catch (error) {
//     res.status(500).json({ mesage: "Error to fecth departments" });
//   }
// });

// router.get("/count", async (req, res) => {
//   try {
//     const count = await Departments.countDocuments();
//     res.json({ count });
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching doctors count" });
//   }
// });

// export default router;
import express from "express";
import Departments from "../models/Departments.js";
import auth from "../auth/Middleware.js";

const router = express.Router();


// ✅ Add Department (ADMIN ONLY)
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


// ✅ Get all departments
router.get("/allDepartments", async (req, res) => {
  try {
    const departments = await Departments.find();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching departments" });
  }
});


// ✅ Get departments count (for dashboard)
router.get("/count", async (req, res) => {
  try {
    const count = await Departments.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching departments count" });
  }
});

export default router;