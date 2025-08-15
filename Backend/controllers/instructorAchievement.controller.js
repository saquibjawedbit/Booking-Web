import { Instructor } from "../models/instructor.model.js";
import { Booking } from "../models/booking.model.js";
import { User } from "../models/user.model.js"; // import User model
import mongoose from "mongoose";

export const getInstructorBadge = async (req, res) => {
  console.log('⚡ hit getInstructorBadge, id =', req.params.id);

  try {
    const rawId = req.params.id;
    const instructorId =
      typeof rawId === "object" && rawId !== null
        ? rawId.id || rawId._id || Object.values(rawId)[0]
        : rawId;

    if (!mongoose.Types.ObjectId.isValid(instructorId)) {
      return res.status(400).json({ message: "Invalid instructor ID" });
    }

    const instructor = await Instructor.findById(instructorId);

    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    // ✅ Fetch User document linked to this instructor
    const user = await User.findOne({ instructor: instructorId });

    const completedBookings = await Booking.countDocuments({
      _id: { $in: instructor.sessions },
      status: "completed",
    });

    const baseDate =
      instructor.createdAt ||
      instructor.updatedAt ||
      user?.createdAt ||
      user?.updatedAt;

    console.log("📅 Base Date used for monthsActive:", baseDate);

    if (!baseDate) {
      return res.status(400).json({ message: "No date found for instructor" });
    }

    const monthsActive =
      (Date.now() - new Date(baseDate).getTime()) /
      (1000 * 60 * 60 * 24 * 30);

    let badge = "No Badge Yet";
    if (completedBookings >= 250 && monthsActive >= 24) {
      badge = "Full Send Legend Badge";
    } else if (completedBookings >= 150 && monthsActive >= 12) {
      badge = "Elite Instructor Badge";
    } else if (completedBookings >= 50 && monthsActive >= 6) {
      badge = "Trusted Pro Badge";
    } else if (completedBookings >= 10 && monthsActive >= 3) {
      badge = "Rising Star Badge";
    } else if (completedBookings >= 5) {
      badge = "Starter Badge";
    }

    res.json({
      badge,
      completedBookings,
      monthsActive: Math.floor(monthsActive),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
