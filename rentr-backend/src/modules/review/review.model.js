const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  // The item being reviewed
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },

  // The booking this review is tied to — ensures only real renters can review
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },

  // The user who wrote the review (the renter)
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Star rating 1 to 5
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  // Written comment
  comment: {
    type: String,
    default: null,
  },

}, { timestamps: true });

// One booking can only produce one review — prevents duplicate reviews
reviewSchema.index({ booking: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
