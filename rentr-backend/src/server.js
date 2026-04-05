require("dotenv").config(); // load environment variables from .env file

const app = require("./app"); // import express app
const connectDB = require("./config/db"); // import db connection function

const PORT = process.env.PORT || 5000; // get port from env or use default 5000

// connect DB
connectDB();

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});