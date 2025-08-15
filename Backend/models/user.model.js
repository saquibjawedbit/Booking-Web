import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    profilePicture: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      index: true,
      Number: true,
    },
    name: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
    },
    refreshToken: { type: String },
    role: {
      type: String,
      enum: ["user", "admin", "instructor", "hotel", "superadmin"],
      default: "user",
    },
    // Legacy level field - now calculated from UserAdventureExperience
    level: {
      type: Number,
      default: 0,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    adventures: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Adventure",
  },
],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequests: [],
  },
  {
    timestamps: true,
  }
);

// This hook is called just before data is saved
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// Method to get overall level from adventure experiences
userSchema.methods.getOverallLevel = async function () {
  const { UserAdventureExperience } = await import(
    "./userAdventureExperience.model.js"
  );
  return await UserAdventureExperience.calculateOverallLevel(this._id);
};

// Method to get adventure-specific experiences
userSchema.methods.getAdventureExperiences = async function () {
  const { UserAdventureExperience } = await import(
    "./userAdventureExperience.model.js"
  );
  return await UserAdventureExperience.find({ user: this._id })
    .populate("adventure", "name description medias thumbnail ")
    .sort({ experience: -1 });
};

export const User = mongoose.model("User", userSchema);
