import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { UserAdventureExperience } from "../models/userAdventureExperience.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getUser = asyncHandler(async (req, res) => {
  let user;
  if (req.user.role === "instructor") {
    user = await User.findById(req.user._id)
      .populate("instructor")
      .select("-password -refreshToken");
  } else {
    user = req.user;
  }

  // Get overall level and adventure experiences
  const overallLevelData = await user.getOverallLevel();
  const adventureExperiences = await user.getAdventureExperiences();

  return res.status(200).json({
    ...user.toJSON(),
    levelData: overallLevelData,
    adventureExperiences: adventureExperiences,
  });
});

// GET /users?search=&role=&page=&limit=
export const getUsers = asyncHandler(async (req, res) => {
  const { search = "", role, page = 1, limit = 10 } = req.query;
  const query = {};
  if (role && role !== "all") {
    query.role = role;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select("_id name email role bookings createdAt");
  const total = await User.countDocuments(query);
  res.status(200).json({
    users,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
  });
});

export const getUserAdventure = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId)
    .populate("adventures") 
    .select("name email adventures");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { adventures: user.adventures },
      "User adventures fetched successfully"
    )
  );
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(new ApiResponse(200, "User deleted successfully", user));
});

export const updateUser = asyncHandler(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, {
    $set: req.body,
  });
  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

export const getUserAdventureExperiences = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const adventureExperiences = await UserAdventureExperience.find({
    user: userId,
  })
    .populate("adventure", "name description medias thumbnail exp")
    .sort({ experience: -1 });

  const overallLevelData = await UserAdventureExperience.calculateOverallLevel(
    userId
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        adventureExperiences,
        levelData: overallLevelData,
      },
      "Adventure experiences fetched successfully"
    )
  );
});
