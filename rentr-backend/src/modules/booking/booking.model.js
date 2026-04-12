const mongoose = require("mongoose");

// Booking schema — one document per rental request
const bookingSchema = new mongoose.Schema(
  {
    // The item being rented
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",       // links to the Item model (for .populate("item"))
      required: true,
    },

    // The renter (person who made the booking)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",       // links to the User model
      required: true,
    },

    // Rental date range
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    // Lifecycle status
    // pending   → request created, waiting for owner
    // confirmed → owner accepted
    // active    → item picked up, rental in progress
    // completed → item returned, rental finished
    // cancelled → cancelled before pickup
    status: {
      type: String,
      enum: ["pending", "confirmed", "active", "completed", "cancelled"],
      default: "pending",
    },

    // Total amount charged (calculated at booking time)
    totalAmount: {
      type: Number,
      default: 0,
    },

    // Stripe PaymentIntent ID (set when payment is created)
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
