const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  price: Number,
  category: {
    type: String,
    default: null,   // e.g. "Camping", "Electronics", "Vehicles"
  },
  images: {
    type: [String],  // array of file paths e.g. ["uploads/items/abc.jpg", "uploads/items/xyz.jpg"]
    default: [],
  },
  // Location stored as GeoJSON point — required for geo/nearby search
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      default: [0, 0],
    },
    address: {
      type: String,   // human readable e.g. "Sydney, NSW"
      default: null,
    },
  },
  availableFrom: { type: Date, default: null },
  availableTo:   { type: Date, default: null },

  // Array of user IDs who saved/favourited this item
  savedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

// Create a 2dsphere index on location — required for MongoDB geo queries
itemSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Item", itemSchema);