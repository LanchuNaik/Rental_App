const express = require("express");
const router = express.Router();

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
const { makeUploader } = require("../../config/cloudinary");

// Booking pickup/return photos → Cloudinary folder "rentr/bookings"
const upload = makeUploader("bookings");

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

/**
 * @swagger
 * /api/bookings/incoming:
 *   get:
 *     summary: Get all incoming booking requests for owner's items
 *     tags: [Booking]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Incoming requests fetched
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *
 * /api/bookings/{id}:
 *   get:
 *     summary: Get a single booking by ID
 *     tags: [Booking]
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
 *         description: Booking fetched
 *       403:
 *         description: Unauthorized - not renter or owner
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 *
 * /api/bookings/{id}/cancel:
 *   put:
 *     summary: Renter cancels a booking
 *     tags: [Booking]
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
 *         description: Booking cancelled
 *       400:
 *         description: Cannot cancel at current status
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 *
 * /api/bookings/{id}/reject:
 *   put:
 *     summary: Owner rejects a booking request
 *     tags: [Booking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Item unavailable on those dates
 *     responses:
 *       200:
 *         description: Booking rejected
 *       400:
 *         description: Can only reject pending bookings
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 *
 * /api/bookings/{id}/pickup:
 *   put:
 *     summary: Owner uploads pickup photos and marks booking as active
 *     tags: [Booking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Pickup photos uploaded, booking now active
 *       400:
 *         description: No photos or booking not confirmed
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *
 * /api/bookings/{id}/return:
 *   put:
 *     summary: Owner uploads return photos and marks booking as completed
 *     tags: [Booking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Return confirmed, booking completed
 *       400:
 *         description: No photos or booking not active
 *       403:
 *         description: Unauthorized
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