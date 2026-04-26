const Message = require("./chat.model");
const Booking = require("../booking/booking.model");

// Helper — returns true if the logged-in user is the renter or owner of this booking.
// Same auth rule used everywhere chat is touched (REST + sockets).
async function userCanAccessChat(bookingId, userId) {
  const booking = await Booking.findById(bookingId).populate("item");
  if (!booking) return { allowed: false, reason: "Booking not found", status: 404 };

  const isRenter = booking.user?.toString() === userId;
  const isOwner  = booking.item?.owner?.toString() === userId;

  if (!isRenter && !isOwner) {
    return { allowed: false, reason: "Not authorized for this chat", status: 403 };
  }
  return { allowed: true, booking };
}

// GET /api/chat/:bookingId — fetch full message history for a booking
const getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    const access = await userCanAccessChat(bookingId, userId);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.reason });
    }

    const messages = await Message.find({ booking: bookingId })
      .populate("sender", "name avatar")     // include sender's name + avatar for UI
      .sort({ createdAt: 1 });               // oldest first → newest at the bottom

    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getMessages, userCanAccessChat };
