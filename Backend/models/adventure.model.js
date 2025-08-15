import mongoose from "mongoose";

const adventureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
      },
    ],
    medias: {
      type: [
        {
          type: String,
          required: true,
        },
      ],
      required: true,
      validate: {
        validator: function (v) {
          return v.length >= 1;
        },
        message: "At least one media item is required",
      },
    },
    thumbnail: {
      type: String,
    },
    previewVideo: {
      type: String,
    },
    exp: {
      type: Number,
    },
    instructor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    totalSessions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Adventure = mongoose.model("Adventure", adventureSchema);