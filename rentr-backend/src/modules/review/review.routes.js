/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Submit a review for a completed booking
 *     tags: [Review]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - rating
 *             properties:
 *               bookingId:
 *                 type: string
 *                 example: 60d5ec49c1234567890abcde
 *               rating:
 *                 type: number
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: Great item, would rent again!
 *     responses:
 *       201:
 *         description: Review submitted
 *       400:
 *         description: Already reviewed or booking not completed
 *       403:
 *         description: Only the renter can review
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/reviews/item/{itemId}:
 *   get:
 *     summary: Get all reviews for an item
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: The item's MongoDB ID
 *     responses:
 *       200:
 *         description: Reviews fetched with average rating
 *       500:
 *         description: Server error
 */

const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/auth/middleware");
const { createReview, getItemReviews } = require("./review.controller");

router.post("/",                  authMiddleware, createReview);    // protected
router.get("/item/:itemId",       getItemReviews);                  // public

module.exports = router;
