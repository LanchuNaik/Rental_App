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
const multer = require("multer");
const path = require("path");

const authMiddleware = require("../../middleware/auth/middleware");
const { getProfile, updateProfile, updateAvatar, deleteAvatar, getPublicProfile, updateRole } = require("./user.controller");

// --- Multer setup for avatar uploads ---
// diskStorage tells multer WHERE to save files and WHAT to name them
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars/");   // save files in this folder
  },
  filename: (req, file, cb) => {
    // filename = userId + timestamp + original extension  e.g. "abc123_1713000000000.jpg"
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.userId}_${Date.now()}${ext}`);
  },
});

// fileFilter only allows image files
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);   // accept file
  } else {
    cb(new Error("Only jpg, png, and webp images are allowed"), false);  // reject file
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB max
});

// --- Routes ---
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/profile/role", authMiddleware, updateRole);
router.put("/profile/avatar", authMiddleware, upload.single("avatar"), updateAvatar);
router.delete("/profile/avatar", authMiddleware, deleteAvatar);
router.get("/users/:id", getPublicProfile);  // public — no auth needed

module.exports = router;
