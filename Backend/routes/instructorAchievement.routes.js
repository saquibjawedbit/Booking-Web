import express from "express";
import { getInstructorBadge } from "../controllers/instructorAchievement.controller.js";

const router = express.Router();

router.get('/:id', getInstructorBadge);

export default router;
