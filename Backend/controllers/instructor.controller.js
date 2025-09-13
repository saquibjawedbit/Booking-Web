import { Instructor } from "../models/instructor.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllInstructors = asyncHandler(async (req, res) => {
  const { page, limit = 10 } = req.query;

  const instructors = await User.find({ role: "instructor" })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate({
      path: "instructor",
      populate: [
        {
          path: "adventure",
          select: "name",
        },
        {
          path: "location",
          select: "name",
        },
      ],
      select: "documentVerified certificate governmentId avgReview commission",
    })
    .select("email name phoneNumber profilePicture instructor");

  const total = await User.countDocuments({ role: "instructor" });
  const totalPages = Math.ceil(total / limit);

  res.status(200).json(
    new ApiResponse(200, "Instructors retrieved successfully", {
      instructors,
      total,
      totalPages,
    })
  );
});

export const getInstructorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const instructor = await User.find({ role: "instructor", instructor: id })
    .populate({
      path: "instructor",
      populate: [
        {
          path: "adventure",
          select: "name",
        },
        {
          path: "location",
          select: "name",
        },
      ],
      select: "documentVerified certificate governmentId avgReview commission",
    })
    .select("email name phoneNumber profilePicture instructor");

  res.status(200).json(
    new ApiResponse(200, "Instructor retrieved successfully", {
      instructor,
    })
  );
});

export const deleteInstructor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const instructor = await User.findById(id);
  if (!instructor) {
    throw new ApiError(404, "Instructor not found");
  }

  await User.findByIdAndDelete(id);

  res.status(200).json(new ApiResponse(200, "Instructor deleted successfully"));
});

export const changeDocumentStatusById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Find the user who is the instructor
  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (status !== "verified" && status !== "rejected") {
    throw new ApiError(400, "Invalid status");
  }

  // If we're verifying the instructor and they don't have an instructor record yet, create one
  if (status === "verified" && !user.instructor) {
    // Create a new instructor entry
    const newInstructor = await Instructor.create({
      documentVerified: "verified",
      // Any other default fields needed
    });

    // Link the new instructor to the user
    user.instructor = newInstructor._id;
    await user.save();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Instructor verified and profile created successfully"
        )
      );
  }
  // If they already have an instructor record or we're rejecting, update the existing record
  else if (user.instructor) {
    // Update existing instructor document
    const instructorDoc = await Instructor.findById(user.instructor);
    if (instructorDoc) {
      instructorDoc.documentVerified = status;
      await instructorDoc.save();
    } else {
      // If for some reason the instructor document doesn't exist but the reference does
      const newInstructor = await Instructor.create({
        documentVerified: status,
        // Any other default fields needed
      });
      user.instructor = newInstructor._id;
      await user.save();
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, "Instructor document status updated successfully")
      );
  }
  // Edge case: rejecting someone who doesn't have an instructor record yet
  else {
    // Create a rejected instructor record
    const newInstructor = await Instructor.create({
      documentVerified: "rejected",
      // Any other default fields needed
    });

    user.instructor = newInstructor._id;
    await user.save();

    res.status(200).json(new ApiResponse(200, "Instructor documents rejected"));
  }
});

export const updateInstructorCommission = asyncHandler(async (req, res) => {
  const { instructorId } = req.params;
  const { commission } = req.body;

  // Validate the commission value
  if (commission === undefined || commission === null) {
    throw new ApiError(400, "Commission value is required");
  }

  // Convert to number and validate
  const commissionValue = Number(commission);
  if (isNaN(commissionValue)) {
    throw new ApiError(400, "Commission must be a valid number");
  }

  // Validate commission range
  if (commissionValue < 0 || commissionValue > 100) {
    throw new ApiError(400, "Commission must be between 0 and 100");
  }

  // Find instructor
  const instructor = await Instructor.findById(instructorId);
  if (!instructor) {
    throw new ApiError(404, "Instructor not found");
  }

  // Update commission
  instructor.commission = commissionValue;
  await instructor.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { commission: instructor.commission },
        "Instructor commission updated successfully"
      )
    );
});
