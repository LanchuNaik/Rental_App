// ============================================
// Socket.io client singleton
// ============================================
// One persistent connection per app session — every screen that needs
// real-time updates uses the same socket instance instead of creating
// its own. Saves battery, simplifies connection lifecycle.

import { io } from 'socket.io-client';
import { getToken } from './storage.service';

// Socket.io connects to the root URL (NOT /api), since it has its own path
const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '');

let socket = null;
let connectedWithToken = null; // remember which JWT the live socket was opened with

// Connect (or return the existing connection if it's still valid for the current user).
// If the user has switched accounts (different token), tear down the stale socket
// and open a new one — otherwise messages would be sent under the old user's identity.
export async function connectSocket() {
  const token = await getToken();

  if (socket?.connected && connectedWithToken === token) {
    return socket;
  }

  // Token changed (or no socket yet) — tear down and reopen
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  connectedWithToken = token;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
  });

  return socket;
}

// Tear down on logout / app close — frees the server's socket slot.
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  connectedWithToken = null;
}

// For convenience — returns the live instance (or null if not connected yet)
export function getSocket() {
  return socket;
}
