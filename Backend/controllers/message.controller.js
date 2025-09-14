import mongoose from "mongoose";
import { Message } from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Get chat history with a specific user
 */
const getChatHistory = asyncHandler(async (req, res) => {
  const { with: otherUserId } = req.query;
  const currentUserId = req.user._id;

  if (!otherUserId) {
    throw new ApiError(400, "Other user ID is required");
  }

  // Find all messages between these two users
  const messages = await Message.find({
    $or: [
      { from: currentUserId, to: otherUserId },
      { from: otherUserId, to: currentUserId },
    ],
  }).sort({ timestamp: 1 });

  // Mark all messages from the other user as read
  await Message.updateMany(
    { from: otherUserId, to: currentUserId, isRead: false },
    { isRead: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Chat history fetched successfully"));
});

/**
 * Get all chats for the current user
 */
const getAllChats = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  // Aggregate to get the latest message from each conversation
  const chats = await Message.aggregate([
    {
      $match: {
        $or: [
          {
            from: mongoose.Types.ObjectId.createFromHexString(
              currentUserId.toString()
            ),
          },
          {
            to: mongoose.Types.ObjectId.createFromHexString(
              currentUserId.toString()
            ),
          },
        ],
      },
    },
    {
      $sort: { timestamp: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [
            {
              $eq: [
                "$from",
                mongoose.Types.ObjectId.createFromHexString(
                  currentUserId.toString()
                ),
              ],
            },
            "$to",
            "$from",
          ],
        },
        latestMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $eq: [
                      "$to",
                      mongoose.Types.ObjectId.createFromHexString(
                        currentUserId.toString()
                      ),
                    ],
                  },
                  { $eq: ["$isRead", false] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        _id: 1,
        latestMessage: 1,
        unreadCount: 1,
        "user?.name": 1,
        "user.avatar": 1,
        "user.email": 1,
      },
    },
    {
      $sort: { "latestMessage.timestamp": -1 },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, chats, "All chats fetched successfully"));
});

/**
 * Mark a message as read
 */
const markMessageAsRead = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const currentUserId = req.user._id;

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  // Only the recipient can mark a message as read
  if (message.to.toString() !== currentUserId.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to mark this message as read"
    );
  }

  message.isRead = true;
  await message.save();

  return res
    .status(200)
    .json(new ApiResponse(200, message, "Message marked as read"));
});

export { getAllChats, getChatHistory, markMessageAsRead };
