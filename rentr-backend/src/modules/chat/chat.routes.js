const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/auth/middleware");
const { getMessages } = require("./chat.controller");

// GET /api/chat/:bookingId — full message history for a booking's chat
router.get("/:bookingId", authMiddleware, getMessages);

module.exports = router;
