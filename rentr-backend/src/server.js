require("dotenv").config(); // load env vars (no-op on Render — uses dashboard env)

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const registerChatSocket = require("./sockets/chat.socket");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Express alone can't host WebSockets. We wrap it in a raw Node HTTP server
// so both the REST API (Express) and Socket.io can share the same port.
const httpServer = http.createServer(app);

// Attach Socket.io. `cors` here matches the express CORS — open for now;
// tighten to your real frontend origin before going to production.
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Wire chat events
registerChatSocket(io);

// Listen on the HTTP server (NOT app.listen) so both Express + Socket.io serve.
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io ready`);
});
