const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const authMiddleware = require("../../middleware/auth/middleware");
const {
  createBooking,
  getMyBookings,
  getBookingById,
  getIncomingRequests,
  acceptBooking,
  cancelBooking,
  rejectBooking,
  uploadPickupPhotos,
  confirmReturn,
} = require("./booking.controller");

// --- Multer setup for booking photos (pickup + return) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/bookings/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `booking_${req.params.id}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Images only"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Booking]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *               - startDate
 *               - endDate
 *             properties:
 *               itemId:
 *                 type: string
 *                 example: 60d5ec49c1234567890abcde
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-04-15T00:00:00Z
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-04-20T00:00:00Z
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     item:
 *                       type: string
 *                     user:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                     endDate:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Invalid date range or item already booked
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 * /api/bookings/my:
 *   get:
 *     summary: Get all my bookings
 *     tags: [Booking]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user's bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       item:
 *                         type: object
 *                       user:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                       endDate:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [pending, confirmed, completed, cancelled]
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 * /api/bookings/{id}/accept:
 *   put:
 *     summary: Accept/confirm a booking
 *     tags: [Booking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Booking ID
 *         schema:
 *           type: string
 *           example: 60d5ec49c1234567890abcde
 *     responses:
 *       200:
 *         description: Booking confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     item:
 *                       type: string
 *                     user:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                     endDate:
 *                       type: string
 *                     status:
 *                       type: string
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */

// Specific named routes first — before /:id
router.post("/",          authMiddleware, createBooking);
router.get("/my",         authMiddleware, getMyBookings);
router.get("/incoming",   authMiddleware, getIncomingRequests);

// Single booking routes
router.get("/:id",                authMiddleware, getBookingById);
router.put("/:id/accept",         authMiddleware, acceptBooking);
router.put("/:id/cancel",         authMiddleware, cancelBooking);
router.put("/:id/reject",         authMiddleware, rejectBooking);
router.put("/:id/pickup",         authMiddleware, upload.array("photos", 5), uploadPickupPhotos);
router.put("/:id/return",         authMiddleware, upload.array("photos", 5), confirmReturn);

module.exports = router;