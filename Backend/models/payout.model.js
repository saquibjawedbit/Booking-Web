import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const payoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    batchId: {
      type: String,
      index: true,
    },
    itemId: {
      type: String,
      index: true,
    },

    status: {
      type: String,
      enum: ["QUEUED", "SENT", "SUCCESS", "FAILED"],
      default: "QUEUED",
      index: true,
    },

    commissionRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 20,
      description: "The commission percentage applied to this payout",
    },

    rawResponse: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Add pagination plugin
payoutSchema.plugin(mongoosePaginate);

export const Payout = mongoose.model("Payout", payoutSchema);
