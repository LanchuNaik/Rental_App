const express = require("express"); // import express
const cors = require("cors"); // import cors to allow fe to send the request
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express(); // create express app

app.use(cors()); // allow fe to send the request
app.use(express.json()); // allow be to read json data from the request body
app.use("/uploads", express.static("uploads")); // serve uploaded files (avatars etc.)

app.get("/", (req, res) => { // test route
  res.send("API running 🚀");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const authRoutes = require("./modules/auth/auth.routes");
app.use("/api/auth", authRoutes);

const userRoutes = require("./modules/user/user.routes");
app.use("/api", userRoutes);

const itemRoutes = require("./modules/item/item.routes");
app.use("/api/items", itemRoutes);

const bookingRoutes = require("./modules/booking/booking.routes");
app.use("/api/bookings", bookingRoutes);

module.exports = app; // export app to be used in server.js