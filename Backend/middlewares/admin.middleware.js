import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const isAdmin = asyncHandler(async (req, _, next) => {
  const user = req.user;
  if (user.role !== "admin" && user.role !== "superadmin") {
    throw new ApiError(403, "Unauthorized request - Admin access required");
  }
  next();
});

export const verifyAdmin = isAdmin; // Alias for backward compatibility

export const verifyInstructor = asyncHandler(async (req, _, next) => {
  const user = req.user;
  if (
    user.role !== "admin" &&
    user.role !== "instructor" &&
    user.role !== "superadmin"
  ) {
    throw new ApiError(
      403,
      "Unauthorized request - Instructor access required"
    );
  }
  next();
});
