const Item = require("./item.model");

const createItem = async (req, res) => {
  try {
    const { title, description, price } = req.body;

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

    const item = await Item.create({
      title,
      description,
      price,
      owner: req.user.userId, // from JWT
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
      .populate("owner", "email");

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
    const item = await Item.findById(req.params.id).populate("owner", "email");

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

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
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

module.exports = { createItem, getItems, getItemById, updateItem, deleteItem, getMyItems };