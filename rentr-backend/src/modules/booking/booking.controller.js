const Booking = require("./booking.model");
const Item = require("../item/item.model");

const createBooking = async (req, res) => {
  try {
    const { itemId, startDate, endDate } = req.body;

    // Input validation
    if (!itemId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Item ID, start date, and end date are required",
      });
    }

    // 🔥 validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date range - end date must be after start date",
      });
    }

    // 🔥 check if already booked
    const existing = await Booking.findOne({
      item: itemId,
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
        },
      ],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Item already booked for these dates",
      });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    const days = Math.round((new Date(endDate) - new Date(startDate)) / 86400000);
    const totalAmount = item.price * days;

    const booking = await Booking.create({
      item: itemId,
      user: req.user.userId,
      startDate,
      endDate,
      totalAmount,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user.userId,
    }).populate("item");

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = "confirmed";
    await booking.save();

    res.json({
      success: true,
      message: "Booking confirmed successfully",
      data: booking,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET /api/bookings/:id — get a single booking's full details
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: "item", populate: { path: "owner", select: "name avatar" } })
      .populate("user", "name avatar");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Only the renter or the item owner can view this booking
    const isRenter = booking.user._id.toString() === req.user.userId;
    const item = await Item.findById(booking.item._id);
    const isOwner = item.owner.toString() === req.user.userId;

    if (!isRenter && !isOwner) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    res.json({ success: true, data: booking });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/bookings/incoming — owner sees all booking requests for their items
const getIncomingRequests = async (req, res) => {
  try {
    // Step 1: find all items owned by this user
    const myItems = await Item.find({ owner: req.user.userId }).select("_id");
    const myItemIds = myItems.map((i) => i._id);

    // Step 2: find all bookings for those items
    const bookings = await Booking.find({ item: { $in: myItemIds } })
      .populate("item", "title images price")
      .populate("user", "name avatar");

    res.json({ success: true, count: bookings.length, data: bookings });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/bookings/:id/cancel — renter cancels their booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Only the renter can cancel
    if (booking.user.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Can only cancel if still pending or confirmed — not active/completed
    if (!["pending", "confirmed"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking that is ${booking.status}`,
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ success: true, message: "Booking cancelled", data: booking });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/bookings/:id/reject — owner rejects a booking request
const rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id).populate("item");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Only the item owner can reject
    if (booking.item.owner.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Can only reject a pending booking
    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a booking that is ${booking.status}`,
      });
    }

    booking.status = "cancelled";
    booking.rejectedReason = reason || null;
    await booking.save();

    res.json({ success: true, message: "Booking rejected", data: booking });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/bookings/:id/pickup — upload pickup photos + mark booking as active
const uploadPickupPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "At least one photo is required" });
    }

    const booking = await Booking.findById(req.params.id).populate("item");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Either the item owner or the renter can upload pickup photos
    const isOwner  = booking.item.owner.toString() === req.user.userId;
    const isRenter = booking.user.toString()       === req.user.userId;
    if (!isOwner && !isRenter) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Booking must be confirmed before pickup",
      });
    }

    booking.pickupPhotos = req.files.map((f) => f.path);
    booking.status = "active";  // item has been handed over — rental is now in progress
    await booking.save();

    res.json({ success: true, message: "Pickup photos uploaded, booking is now active", data: booking });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/bookings/:id/return — upload return photos + mark booking as completed
const confirmReturn = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "At least one photo is required" });
    }

    const booking = await Booking.findById(req.params.id).populate("item");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Either the item owner or the renter can confirm the return
    const isOwner  = booking.item.owner.toString() === req.user.userId;
    const isRenter = booking.user.toString()       === req.user.userId;
    if (!isOwner && !isRenter) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (booking.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Booking must be active before confirming return",
      });
    }

    booking.returnPhotos = req.files.map((f) => f.path);
    booking.status = "completed";  // rental is fully done
    await booking.save();

    res.json({ success: true, message: "Return confirmed, booking completed", data: booking });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  getIncomingRequests,
  acceptBooking,
  cancelBooking,
  rejectBooking,
  uploadPickupPhotos,
  confirmReturn,
};