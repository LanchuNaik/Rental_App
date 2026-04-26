const mongoose = require("mongoose");

// One document per chat message. Chat is scoped to a booking — only
// the renter and owner of that booking can read/write its messages.
const messageSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,             // we always query by booking, so index it
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }         // createdAt + updatedAt added automatically
);

module.exports = mongoose.model("Message", messageSchema);
