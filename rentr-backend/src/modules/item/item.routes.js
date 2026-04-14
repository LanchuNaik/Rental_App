/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create a new item
 *     tags: [Item]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: Apartment in Downtown
 *               description:
 *                 type: string
 *                 example: Beautiful 2-bedroom apartment with parking
 *               price:
 *                 type: number
 *                 example: 1500
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 item:
 *                   type: object
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all items
 *     tags: [Item]
 *     parameters:
 *       - in: query
 *         name: minPrice
 *         required: false
 *         description: Minimum price filter
 *         schema:
 *           type: number
 *           example: 500
 *       - in: query
 *         name: maxPrice
 *         required: false
 *         description: Maximum price filter
 *         schema:
 *           type: number
 *           example: 2000
 *       - in: query
 *         name: search
 *         required: false
 *         description: Search items by title (case-insensitive)
 *         schema:
 *           type: string
 *           example: apartment
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number for pagination (default is 1)
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of items per page (default is 5)
 *         schema:
 *           type: integer
 *           example: 5
 *       - in: query
 *         name: sort
 *         required: false
 *         description: Sort field (prefix with - for descending, e.g., -price for descending price)
 *         schema:
 *           type: string
 *           example: price
 *     responses:
 *       200:
 *         description: Successfully retrieved all items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   owner:
 *                     type: object
 *       500:
 *         description: Server error
 * /api/items/my:
 *   get:
 *     summary: Get my items
 *     tags: [Item]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user's items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   owner:
 *                     type: object
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 * /api/items/{id}:
 *   get:
 *     summary: Get item by ID
 *     tags: [Item]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Item ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 owner:
 *                   type: object
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update an item
 *     tags: [Item]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Item ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Apartment
 *               description:
 *                 type: string
 *                 example: Updated description
 *               price:
 *                 type: number
 *                 example: 2000
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 updatedItem:
 *                   type: object
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Not the item owner
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete an item
 *     tags: [Item]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Item ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Not the item owner
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const authMiddleware = require("../../middleware/auth/middleware");
const {
  createItem, getItems, getItemById, updateItem, deleteItem, getMyItems,
  getAvailability, saveItem, unsaveItem, getSavedItems, getNearbyItems,
} = require("./item.controller");

// --- Multer setup for item images ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/items/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `item_${req.user.userId}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Images only"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB per file
});

// --- Routes ---

// IMPORTANT: specific routes (/my, /saved, /nearby) must come BEFORE /:id
// otherwise Express thinks "my", "saved", "nearby" are item IDs

router.get("/saved",  authMiddleware, getSavedItems);   // GET saved items
router.get("/nearby", getNearbyItems);                  // GET nearby items (public)
router.get("/my",     authMiddleware, getMyItems);      // GET my listings

router.post("/", authMiddleware, upload.array("images", 5), createItem);  // up to 5 images
router.get("/",  getItems);

router.get("/:id",              getItemById);
router.put("/:id",  authMiddleware, updateItem);
router.delete("/:id", authMiddleware, deleteItem);

router.get("/:id/availability",       getAvailability);          // public
router.post("/:id/save",   authMiddleware, saveItem);             // save item
router.delete("/:id/save", authMiddleware, unsaveItem);           // unsave item

module.exports = router;