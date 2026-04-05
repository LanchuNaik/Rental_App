const express = require("express"); // import express
const cors = require("cors"); // import cors to allow fe to send the request

const app = express(); // create express app

app.use(cors()); // allow fe to send the request
app.use(express.json()); // allow be to read json data from the request body

app.get("/", (req, res) => { // test route
  res.send("API running 🚀");
});

const authRoutes = require("./modules/auth/auth.routes");

app.use("/api/auth", authRoutes);

module.exports = app;   // export app to be used in server.js