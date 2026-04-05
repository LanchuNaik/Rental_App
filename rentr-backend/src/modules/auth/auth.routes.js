const express = require("express");
const router = express.Router();

const { signup } = require("./auth.controller");

// route
router.post("/signup", signup);

module.exports = router;