const Booking = require("./booking.model");

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

    const booking = await Booking.create({
      item: itemId,
      user: req.user.userId,
      startDate,
      endDate,
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

module.exports = {
  createBooking,
  getMyBookings,
  acceptBooking,
};