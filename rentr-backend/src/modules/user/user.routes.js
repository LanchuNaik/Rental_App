/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 */

const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/auth/middleware");

router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Profile fetched successfully",
    user: req.user,
  });
});

module.exports = router;