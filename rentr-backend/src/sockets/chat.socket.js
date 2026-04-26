// ============================================
// Socket.io chat handler
// ============================================
// Real-time messaging on top of Socket.io.
//
// Architecture:
//   1. Mobile app connects to the server with a JWT in handshake.auth.token
//   2. We verify the JWT once at connection. If invalid → disconnect.
//   3. Client emits "joinRoom" with a bookingId → we verify they're allowed
//      → they join a Socket.io room named "booking:<id>".
//   4. Client emits "sendMessage" → we save to MongoDB → broadcast the
//      saved message to everyone in that room (renter + owner).
//
// Why "rooms": each booking gets its own room. Messages are only delivered
// to sockets that joined that specific room — no cross-talk between chats.

const jwt = require("jsonwebtoken");
const Message = require("../modules/chat/chat.model");
const { userCanAccessChat } = require("../modules/chat/chat.controller");

function registerChatSocket(io) {
  // ── Connection-time auth ─────────────────────────────────────
  // Runs ONCE when a client tries to connect. We verify the JWT
  // (sent via socket.handshake.auth.token from the client). If valid,
  // we attach the decoded user to socket.user for use in event handlers.
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token provided"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { userId: ... }
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  // ── Per-connection event handlers ────────────────────────────
  io.on("connection", (socket) => {
    console.log(`[chat] connected: user=${socket.user?.userId} socket=${socket.id}`);

    // Client wants to enter a chat for a specific booking
    socket.on("joinRoom", async ({ bookingId }, ack) => {
      try {
        const access = await userCanAccessChat(bookingId, socket.user.userId);
        if (!access.allowed) {
          return ack?.({ ok: false, error: access.reason });
        }
        const room = `booking:${bookingId}`;
        socket.join(room);
        ack?.({ ok: true, room });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    // Client leaves a chat (e.g., navigates away)
    socket.on("leaveRoom", ({ bookingId }) => {
      socket.leave(`booking:${bookingId}`);
    });

    // Client sends a message
    socket.on("sendMessage", async ({ bookingId, text }, ack) => {
      try {
        if (!text?.trim()) return ack?.({ ok: false, error: "Empty message" });

        const access = await userCanAccessChat(bookingId, socket.user.userId);
        if (!access.allowed) {
          return ack?.({ ok: false, error: access.reason });
        }

        // Save to DB
        const saved = await Message.create({
          booking: bookingId,
          sender:  socket.user.userId,
          text:    text.trim(),
        });

        // Populate sender info before broadcasting (so UI gets name + avatar)
        const populated = await saved.populate("sender", "name avatar");

        // Broadcast to everyone in this booking's room — including the sender,
        // so their UI uses the saved version (with _id, createdAt, etc.)
        io.to(`booking:${bookingId}`).emit("newMessage", populated);

        ack?.({ ok: true, message: populated });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on("disconnect", () => {
      console.log(`[chat] disconnected: user=${socket.user?.userId} socket=${socket.id}`);
    });
  });
}

module.exports = registerChatSocket;
