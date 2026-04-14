const Review = require("./review.model");
const Booking = require("../booking/booking.model");

// POST /api/reviews — renter submits a review after a completed booking
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ success: false, message: "Booking ID and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    // Fetch the booking and make sure it exists
    const booking = await Booking.findById(bookingId).populate("item");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Only the renter of this booking can review it
    if (booking.user.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Only the renter can leave a review" });
    }

    // Booking must be completed before reviewing
    if (booking.status !== "completed") {
      return res.status(400).json({ success: false, message: "You can only review a completed booking" });
    }

    // Create the review — will fail with duplicate error if already reviewed (unique index on booking)
    const review = await Review.create({
      item: booking.item._id,
      booking: bookingId,
      reviewer: req.user.userId,
      rating,
      comment: comment || null,
    });

    // Populate reviewer name + avatar before returning
    await review.populate("reviewer", "name avatar");

    res.status(201).json({ success: true, message: "Review submitted", data: review });

  } catch (error) {
    // Handle duplicate review (unique index violation)
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "You have already reviewed this booking" });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/reviews/item/:itemId — fetch all reviews for an item
const getItemReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ item: req.params.itemId })
      .populate("reviewer", "name avatar")
      .sort({ createdAt: -1 });  // newest first

    // Calculate average rating
    const avgRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    res.json({
      success: true,
      count: reviews.length,
      avgRating: avgRating ? Number(avgRating) : null,
      data: reviews,
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { createReview, getItemReviews };
