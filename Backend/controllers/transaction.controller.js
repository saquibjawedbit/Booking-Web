import axios from "axios";
import cron from "node-cron";
import { v4 as uuidv4 } from "uuid";
import { Booking } from "../models/booking.model.js";
import { EventBooking } from "../models/eventBooking.model.js";
import { Instructor } from "../models/instructor.model.js";
import { ItemBooking } from "../models/itemBooking.model.js";
import { Payout } from "../models/payout.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getAccessToken } from "../utils/paypal.js";

// Constants for payout processing
const DEFAULT_COMMISSION = 20; // Default commission percentage (20%)
const MIN_PAYOUT_AMOUNT = 10; // Minimum $10 for payout
const PAYOUT_CURRENCY = "USD";

/**
 * Process payouts for confirmed bookings
 * This function is called by the cron job
 */
export const processPayouts = asyncHandler(async () => {
  console.log("🔄 Starting payout processing...", new Date().toISOString());

  try {
    // Get all confirmed bookings that haven't been processed for payouts
    const confirmedBookings = await getConfirmedBookings();

    if (confirmedBookings.length === 0) {
      console.log("✅ No confirmed bookings found for payout processing");
      return;
    }

    console.log(
      `📊 Found ${confirmedBookings.length} confirmed bookings to process`
    );

    // Group bookings by service provider/instructor
    const groupedPayouts = await groupBookingsByProvider(confirmedBookings);

    // Process payouts for each provider
    for (const [providerId, bookings] of groupedPayouts.entries()) {
      await processProviderPayout(providerId, bookings);
    }

    console.log("✅ Payout processing completed successfully");
  } catch (error) {
    console.error("❌ Error processing payouts:", error);
    throw error;
  }
});

/**
 * Calculate payout percentage based on instructor commission rate
 * @param {string} instructorId - The ID of the instructor
 * @returns {number} - The payout percentage as a decimal (e.g., 0.8 for 80%)
 */
const calculatePayoutPercentage = async (instructorId) => {
  try {
    // Find the instructor to get their commission rate
    const instructor = await Instructor.findById(instructorId).select(
      "commission"
    );

    // If instructor is found and has a commission rate, use it
    if (instructor && instructor.commission !== undefined) {
      // Convert commission percentage to payout percentage
      // E.g., if commission is 20%, payout is 80%
      return (100 - instructor.commission) / 100;
    }

    // Fallback to default: 100 - DEFAULT_COMMISSION(20) = 80%
    return (100 - DEFAULT_COMMISSION) / 100;
  } catch (error) {
    console.error(`Error getting instructor commission rate: ${error.message}`);
    // Fallback to default: 80%
    return (100 - DEFAULT_COMMISSION) / 100;
  }
};

/**
 * Get all confirmed bookings that need payout processing
 */
const getConfirmedBookings = async () => {
  const bookings = [];

  // Get confirmed event bookings with completed payment
  const eventBookings = await EventBooking.find({
    status: "confirmed",
    paymentStatus: "completed",
    paymentCompletedAt: { $exists: true },
    // Only process bookings older than 24 hours to ensure payment is settled
    paymentCompletedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  })
    .populate("user", "name email")
    .populate("event", "title instructor")
    .populate(
      "adventureInstructors.instructor",
      "name email paypalPayerId paypalEmail"
    )
    .lean();

  // Get confirmed item bookings
  const itemBookings = await ItemBooking.find({
    status: "confirmed",
    paymentStatus: "completed",
    paymentCompletedAt: { $exists: true },
    paymentCompletedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  })
    .populate("user", "name email")
    .populate("items.item", "name")
    .lean();

  // Note: Items don't have owners in this system, so we skip item payout processing
  // This can be added later if needed

  // Get confirmed session bookings (if SessionBooking model exists)
  try {
    // Check if there's a sessionBooking model by trying to import it dynamically
    const sessionBookingModule = await import(
      "../models/sessionBooking.model.js"
    ).catch(() => null);
    if (sessionBookingModule?.SessionBooking) {
      const sessionBookings = await sessionBookingModule.SessionBooking.find({
        status: "confirmed",
        paymentStatus: "completed",
        paymentCompletedAt: { $exists: true },
        paymentCompletedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      })
        .populate("user", "name email")
        .populate("session", "title instructor")
        .populate("session.instructor", "name email paypalPayerId paypalEmail")
        .lean();

      bookings.push(
        ...sessionBookings.map((booking) => ({
          ...booking,
          type: "session",
          providerId: booking.session?.instructor?._id,
          providerInfo: booking.session?.instructor,
        }))
      );
    } else {
      console.log(
        "SessionBooking model not found, checking regular Booking model for sessions..."
      );

      // Check if regular Booking model has session-related bookings
      const sessionBookings = await Booking.find({
        status: "confirmed",
        session: { $exists: true },
        // Regular booking model might not have paymentStatus
        bookingDate: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      })
        .populate("user", "name email")
        .populate("session", "title instructor")
        .lean();

      // Try to populate instructor details if session has instructor
      const populatedBookings = await Promise.all(
        sessionBookings.map(async (booking) => {
          if (booking.session?.instructor) {
            const instructor = await User.findById(booking.session.instructor)
              .select("name email paypalPayerId paypalEmail")
              .lean();
            return {
              ...booking,
              type: "session",
              providerId: instructor?._id,
              providerInfo: instructor,
            };
          }
          return null;
        })
      );

      bookings.push(...populatedBookings.filter(Boolean));
    }
  } catch (error) {
    console.log("Error processing session bookings:", error.message);
  }

  // Get confirmed hotel bookings (if HotelBooking model exists)
  try {
    const hotelBookingModule = await import(
      "../models/hotelBooking.model.js"
    ).catch(() => null);
    if (hotelBookingModule?.HotelBooking) {
      const hotelBookings = await hotelBookingModule.HotelBooking.find({
        status: "confirmed",
        paymentStatus: "completed",
        paymentCompletedAt: { $exists: true },
        paymentCompletedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      })
        .populate("user", "name email")
        .populate("hotel", "name owner")
        .populate("hotel.owner", "name email paypalPayerId paypalEmail")
        .lean();

      bookings.push(
        ...hotelBookings.map((booking) => ({
          ...booking,
          type: "hotel",
          providerId: booking.hotel?.owner?._id,
          providerInfo: booking.hotel?.owner,
        }))
      );
    } else {
      console.log(
        "HotelBooking model not found, skipping hotel payout processing..."
      );
    }
  } catch (error) {
    console.log("Error processing hotel bookings:", error.message);
  }

  // Add event bookings
  eventBookings.forEach((booking) => {
    // For event bookings, we need to pay each instructor separately
    booking.adventureInstructors?.forEach((adventure) => {
      if (adventure.instructor) {
        bookings.push({
          ...booking,
          type: "event",
          providerId: adventure.instructor._id,
          providerInfo: adventure.instructor,
          adventureId: adventure.adventure,
          // Calculate proportional amount if multiple instructors
          proportionalAmount:
            booking.amount / (booking.adventureInstructors?.length || 1),
        });
      }
    });
  });

  // Add hotel bookings
  hotelBookings.forEach((booking) => {
    if (booking.hotel?.owner) {
      bookings.push({
        ...booking,
        type: "hotel",
        providerId: booking.hotel.owner._id,
        providerInfo: booking.hotel.owner,
      });
    }
  });

  // Note: Item bookings are skipped since items don't have owners in this system
  // This can be added later if the Item model is updated to include an owner field

  // Filter out bookings that already have payouts processed
  const processedPayouts = await Payout.find({
    status: { $in: ["QUEUED", "SENT", "SUCCESS"] },
  }).distinct("itemId");

  return bookings.filter((booking) => {
    const bookingId = booking._id.toString();
    return !processedPayouts.includes(bookingId);
  });
};

/**
 * Group bookings by service provider for batch processing
 */
const groupBookingsByProvider = async (bookings) => {
  const grouped = new Map();

  // Process each booking
  for (const booking of bookings) {
    const providerId = booking.providerId?.toString();
    if (!providerId || !booking.providerInfo) continue;

    if (!grouped.has(providerId)) {
      grouped.set(providerId, {
        provider: booking.providerInfo,
        bookings: [],
        totalAmount: 0,
      });
    }

    const providerData = grouped.get(providerId);
    providerData.bookings.push(booking);

    // Calculate payout amount using instructor-specific commission rate
    const bookingAmount =
      booking.proportionalAmount || booking.itemAmount || booking.amount || 0;

    // Get payout percentage based on instructor's commission rate
    const payoutPercentage = await calculatePayoutPercentage(providerId);
    const payoutAmount = bookingAmount * payoutPercentage;

    providerData.totalAmount += payoutAmount;
  }

  return grouped;
};

/**
 * Process payout for a specific provider
 * Uses variable commission rates set at the instructor level
 */
const processProviderPayout = async (providerId, providerData) => {
  const { provider, bookings, totalAmount } = providerData;

  // Check if provider has PayPal account linked
  if (!provider.paypalPayerId || !provider.paypalEmail) {
    console.log(
      `⚠️ Provider ${provider?.name} (${providerId}) doesn't have PayPal linked, skipping payout`
    );
    return;
  }

  // Check minimum payout amount
  if (totalAmount < MIN_PAYOUT_AMOUNT) {
    console.log(
      `⚠️ Provider ${provider?.name} total amount $${totalAmount.toFixed(
        2
      )} is below minimum $${MIN_PAYOUT_AMOUNT}, skipping`
    );
    return;
  }

  try {
    // Get instructor's commission rate for record-keeping
    const instructor = await Instructor.findById(providerId).select(
      "commission"
    );
    const commissionRate = instructor?.commission || DEFAULT_COMMISSION;

    // Create payout record
    const payout = new Payout({
      user: providerId,
      amount: totalAmount,
      currency: PAYOUT_CURRENCY,
      note: `Payout for ${bookings.length} confirmed bookings (${commissionRate}% commission)`,
      batchId: uuidv4(),
      itemId: bookings.map((b) => b._id.toString()).join(","),
      status: "QUEUED",
      commissionRate: commissionRate, // Store the commission rate used for this payout
    });

    await payout.save();

    // Process PayPal payout
    const paypalResult = await sendPayPalPayout(
      provider,
      totalAmount,
      payout.batchId
    );

    if (paypalResult.success) {
      payout.status = "SENT";
      payout.rawResponse = paypalResult.response;
      await payout.save();

      console.log(
        `✅ Payout sent to ${provider?.name}: $${totalAmount.toFixed(2)}`
      );
    } else {
      payout.status = "FAILED";
      payout.rawResponse = paypalResult.error;
      await payout.save();

      console.error(
        `❌ Payout failed for ${provider?.name}:`,
        paypalResult.error
      );
    }
  } catch (error) {
    console.error(
      `❌ Error processing payout for provider ${provider?.name}:`,
      error
    );
  }
};

/**
 * Send payout via PayPal
 */
const sendPayPalPayout = async (provider, amount, batchId) => {
  try {
    const accessToken = await getAccessToken();

    const payoutData = {
      sender_batch_header: {
        sender_batch_id: batchId,
        email_subject: "Payment from Adventure Booking Platform",
        email_message: "You have received a payment for your services!",
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: amount.toFixed(2),
            currency: PAYOUT_CURRENCY,
          },
          receiver: provider.paypalEmail,
          note: `Payment for adventure booking services`,
          sender_item_id: `item_${Date.now()}`,
        },
      ],
    };

    const response = await axios.post(
      `${process.env.PAYPAL_API_BASE}/v1/payments/payouts`,
      payoutData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "PayPal-Partner-Attribution-Id":
            process.env.PAYPAL_PARTNER_ATTRIBUTION_ID,
        },
      }
    );

    return {
      success: true,
      response: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Initialize cron job for payout processing
 */
export const initPayoutCronJob = () => {
  console.log("🚀 Initializing payout cron job...");

  // Run every day at 2 AM UTC
  cron.schedule(
    "0 2 * * *",
    async () => {
      console.log(
        "🕐 Cron job triggered: Starting daily payout processing at",
        new Date().toISOString()
      );
      try {
        await processPayouts();
      } catch (error) {
        console.error("❌ Cron job error:", error);
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    }
  );

  // Optional: Run every hour for more frequent processing (commented out by default)
  // cron.schedule('0 * * * *', async () => {
  //   console.log('🕐 Hourly payout check triggered');
  //   try {
  //     await processPayouts();
  //   } catch (error) {
  //     console.error('❌ Hourly payout error:', error);
  //   }
  // });

  console.log("✅ Payout cron job initialized - will run daily at 2 AM UTC");
  console.log(
    "📝 Manual payout can be triggered via: POST /api/transactions/payout/trigger (Admin only)"
  );
};

/**
 * Manual payout processing endpoint (for admin use)
 */
export const triggerManualPayout = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user?.role !== "admin" && req.user?.role !== "superadmin") {
    throw new ApiError(403, "Access denied. Admin privileges required.");
  }

  try {
    await processPayouts();

    res
      .status(200)
      .json(
        new ApiResponse(200, null, "Payout processing completed successfully")
      );
  } catch (error) {
    throw new ApiError(500, `Payout processing failed: ${error.message}`);
  }
});

/**
 * Get payout history
 */
export const getPayoutHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, userId } = req.query;

  // Build filter
  const filter = {};
  if (status) filter.status = status;
  if (userId) filter.user = userId;

  // If not admin, only show user's own payouts
  if (req.user?.role !== "admin" && req.user?.role !== "superadmin") {
    filter.user = req.user.id;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: [{ path: "user", select: "name email" }],
  };

  const payouts = await Payout.paginate(filter, options);

  res
    .status(200)
    .json(
      new ApiResponse(200, payouts, "Payout history retrieved successfully")
    );
});

/**
 * Get payout statistics
 */
export const getPayoutStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Build date filter
  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  const stats = await Payout.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const summary = {
    total: 0,
    totalAmount: 0,
    byStatus: {},
  };

  stats.forEach((stat) => {
    summary.total += stat.count;
    summary.totalAmount += stat.totalAmount;
    summary.byStatus[stat._id] = {
      count: stat.count,
      amount: stat.totalAmount,
    };
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, summary, "Payout statistics retrieved successfully")
    );
});

/**
 * Test endpoint to check cron job status and system health
 */
export const getSystemStatus = asyncHandler(async (req, res) => {
  const cronStatus = {
    isRunning: true, // Cron is initialized when server starts
    nextRunTime: "Daily at 2 AM UTC",
    lastPayoutCheck: new Date().toISOString(),
  };

  // Get recent payout activity
  const recentPayouts = await Payout.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "name email")
    .lean();

  // Count pending bookings that might need payout
  const pendingBookingsCounts = await Promise.all([
    EventBooking.countDocuments({
      status: "confirmed",
      paymentStatus: "completed",
      paymentCompletedAt: {
        $exists: true,
        $lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    }),
    ItemBooking.countDocuments({
      status: "confirmed",
      paymentStatus: "completed",
      paymentCompletedAt: {
        $exists: true,
        $lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    }),
    // Count regular bookings for sessions
    Booking.countDocuments({
      status: "confirmed",
      session: { $exists: true },
      bookingDate: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }),
  ]);

  const systemHealth = {
    cronJob: cronStatus,
    recentPayouts: recentPayouts,
    pendingEventBookings: pendingBookingsCounts[0],
    pendingItemBookings: pendingBookingsCounts[1],
    pendingSessionBookings: pendingBookingsCounts[2],
    totalPendingBookings: pendingBookingsCounts.reduce(
      (sum, count) => sum + count,
      0
    ),
  };

  res
    .status(200)
    .json(
      new ApiResponse(200, systemHealth, "System status retrieved successfully")
    );
});
