/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create a new item listing (with optional images)
 *     tags: [Item]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: Camping Tent
 *               description:
 *                 type: string
 *                 example: 4-person tent, great for weekends
 *               price:
 *                 type: number
 *                 example: 50
 *               category:
 *                 type: string
 *                 example: Camping
 *               latitude:
 *                 type: number
 *                 example: -33.8688
 *               longitude:
 *                 type: number
 *                 example: 151.2093
 *               address:
 *                 type: string
 *                 example: Sydney, NSW
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Item created successfully
 *       401:
 *         description: Unauthorized
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

const authMiddleware = require("../../middleware/auth/middleware");
const {
  createItem, getItems, getItemById, updateItem, deleteItem, getMyItems,
  getAvailability, saveItem, unsaveItem, getSavedItems, getNearbyItems,
} = require("./item.controller");
const { makeUploader } = require("../../config/cloudinary");

// Item images → Cloudinary folder "rentr/items"
const upload = makeUploader("items");

/**
 * @swagger
 * /api/items/saved:
 *   get:
 *     summary: Get all items saved by the logged-in user
 *     tags: [Item]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Saved items fetched
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *
 * /api/items/nearby:
 *   get:
 *     summary: Get items near a location
 *     tags: [Item]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         example: -33.8688
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         example: 151.2093
 *       - in: query
 *         name: radius
 *         required: false
 *         schema:
 *           type: number
 *         description: Radius in km (default 10)
 *         example: 10
 *     responses:
 *       200:
 *         description: Nearby items fetched
 *       400:
 *         description: lat and lng are required
 *       500:
 *         description: Server error
 *
 * /api/items/{id}/availability:
 *   get:
 *     summary: Get booked date ranges for an item (for calendar blocking)
 *     tags: [Item]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Availability data fetched
 *       500:
 *         description: Server error
 *
 * /api/items/{id}/save:
 *   post:
 *     summary: Save an item to favourites
 *     tags: [Item]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item saved
 *       400:
 *         description: Already saved
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Remove an item from favourites
 *     tags: [Item]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from saved
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */

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