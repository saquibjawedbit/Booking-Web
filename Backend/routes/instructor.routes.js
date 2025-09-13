import express from "express";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  changeDocumentStatusById,
  deleteInstructor,
  getAllInstructors,
  getInstructorById,
  updateInstructorCommission,
} from "../controllers/instructor.controller.js";

const router = express.Router();

// Middleware to verify JWT token
router.use(verifyJWT);

// Route to get all instructors
router.get("/", getAllInstructors);
router.get("/:id", getInstructorById);
router.delete("/:id", deleteInstructor);
router.put("/:id", changeDocumentStatusById);
// Route to update instructor commission (admin only)
router.patch("/:instructorId/commission", isAdmin, updateInstructorCommission);

export default router;
