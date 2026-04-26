/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get logged-in user's profile
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update logged-in user's profile
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mike
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               bio:
 *                 type: string
 *                 example: I rent camping gear
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/profile/avatar:
 *   put:
 *     summary: Upload profile avatar photo
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated
 *       400:
 *         description: No image provided
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a public user profile by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's MongoDB ID
 *     responses:
 *       200:
 *         description: Public profile fetched
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/auth/middleware");
const { getProfile, updateProfile, updateAvatar, deleteAvatar, getPublicProfile, updateRole } = require("./user.controller");
const { makeUploader } = require("../../config/cloudinary");

// Avatar uploads → Cloudinary folder "rentr/avatars"
const upload = makeUploader("avatars");

// --- Routes ---
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/profile/role", authMiddleware, updateRole);
router.put("/profile/avatar", authMiddleware, upload.single("avatar"), updateAvatar);
router.delete("/profile/avatar", authMiddleware, deleteAvatar);
router.get("/users/:id", getPublicProfile);  // public — no auth needed

module.exports = router;
