const Item = require("./item.model");

const createItem = async (req, res) => {
  try {
    const { title, description, price } = req.body;

    const item = await Item.create({
      title,
      description,
      price,
      owner: req.user.userId, // from JWT
    });

    res.status(201).json({
      message: "Item created successfully",
      item,
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

const getItems = async (req, res) => {
  try {
    const items = await Item.find().populate("owner", "email");

    res.json(items);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("owner", "email");

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Optional: check owner
    if (item.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: "Item updated successfully",
      updatedItem,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item){
      return res.status(404).json({message: "Item not found"});
    }

    if(item.owner.toString()!== req.user.userId){
      return res.status(404).json({
        message :"Unauthorized"
      })
    }

    await Item.findByIdAndDelete(req.params.id);
     
    res.json({
      message: "Item deleted successfully",
    });

  }catch(error){
    res.status(500).json({error: error.message});
  }
}


const getMyItems = async (req, res) => {
  try{
    const items = await Item.find({
      owner: req.user.userId,
    });
    res.json(items);

  }catch(error){
    res.status(500).json({error: error.message});
  }
};

module.exports = { createItem, getItems, getItemById , updateItem, deleteItem, getMyItems};