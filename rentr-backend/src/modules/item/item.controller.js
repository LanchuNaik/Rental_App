const Item = require("./item.model");

const createItem = async (req, res) => {
  try {
    const { title, description, price, category, latitude, longitude, address, availableFrom, availableTo } = req.body;

    // Input validation
    if (!title || !description || !price) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and price are required",
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    // req.files is an array of uploaded images (set by multer)
    const images = req.files ? req.files.map((f) => f.path) : [];

    const item = await Item.create({
      title,
      description,
      price,
      category: category || null,
      images,
      location: {
        type: "Point",
        coordinates: [Number(longitude) || 0, Number(latitude) || 0],
        address: address || null,
      },
      owner: req.user.userId,
      availableFrom: availableFrom || null,
      availableTo:   availableTo   || null,
    });

    res.status(201).json({
      success: true,
      message: "Item created successfully",
      data: item,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getItems = async (req, res) => {
  try {
    const { minPrice, maxPrice, search, sort } = req.query;

    let filter = {};

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      }
    }

    let setOption = {};
    if (sort) {
      setOption[sort.replace("-", "")] = sort.startsWith("-") ? -1 : 1;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    // Get total count of items matching filter
    const total = await Item.countDocuments(filter);

    const items = await Item.find(filter)
      .sort(setOption)
      .skip(skip)
      .limit(limit)
      .populate("owner", "name email avatar");

    res.json({
      success: true,
      total,
      page,
      limit,
      count: items.length,
      data: items,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("owner", "name email avatar");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Check owner authorization
    if (item.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { title, description, price, category, availableFrom, availableTo, address, latitude, longitude } = req.body;

    const updateData = {};
    if (title       !== undefined) updateData.title       = title;
    if (description !== undefined) updateData.description = description;
    if (price       !== undefined) updateData.price       = Number(price);
    if (category    !== undefined) updateData.category    = category;
    if (availableFrom !== undefined) updateData.availableFrom = availableFrom || null;
    if (availableTo   !== undefined) updateData.availableTo   = availableTo   || null;
    if (address || latitude || longitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [Number(longitude) || 0, Number(latitude) || 0],
        address: address || null,
      };
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: "Item updated successfully",
      data: updatedItem,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (item.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Item deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({
      owner: req.user.userId,
    });
    res.json({
      success: true,
      count: items.length,
      data: items,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET /api/items/:id/availability
// Returns dates that are already booked for this item
const getAvailability = async (req, res) => {
  try {
    const Booking = require("../booking/booking.model");

    // Find all active/confirmed/pending bookings for this item
    const bookings = await Booking.find({
      item: req.params.id,
      status: { $in: ["pending", "confirmed", "active"] },
    }).select("startDate endDate status");

    // Return the booked date ranges — frontend uses these to block out dates on the calendar
    res.json({ success: true, data: bookings });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/items/:id/save — save/favourite an item
const saveItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Check if already saved
    const alreadySaved = item.savedBy.includes(req.user.userId);
    if (alreadySaved) {
      return res.status(400).json({ success: false, message: "Item already saved" });
    }

    item.savedBy.push(req.user.userId);
    await item.save();

    res.json({ success: true, message: "Item saved" });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/items/:id/save — unsave/unfavourite an item
const unsaveItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Remove user's ID from the savedBy array
    item.savedBy = item.savedBy.filter(
      (userId) => userId.toString() !== req.user.userId
    );
    await item.save();

    res.json({ success: true, message: "Item removed from saved" });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/items/saved — get all items saved by the logged-in user
const getSavedItems = async (req, res) => {
  try {
    const items = await Item.find({ savedBy: req.user.userId })
      .populate("owner", "name avatar");

    res.json({ success: true, count: items.length, data: items });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/items/nearby?lat=xx&lng=xx&radius=10
// Returns items within a radius (in km) of a given location
const getNearbyItems = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: "lat and lng are required" });
    }

    const radiusInMeters = Number(radius) * 1000; // convert km to meters

    const items = await Item.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],  // MongoDB uses [longitude, latitude]
          },
          $maxDistance: radiusInMeters,
        },
      },
    }).populate("owner", "name avatar");

    res.json({ success: true, count: items.length, data: items });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getMyItems,
  getAvailability,
  saveItem,
  unsaveItem,
  getSavedItems,
  getNearbyItems,
};