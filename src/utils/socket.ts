import { Server } from "socket.io";

let io: Server;

export const initSocket = (socketServer: Server) => {
  io = socketServer;
  
  console.log('🔌 Socket.IO initialized for utility functions only');
  console.log('⚠️  Main socket handlers are in SocketService, not here');
  
  // SocketService handles all connection events
  // This is just for utility functions
  
  return io;
}

export const getIO = () => io;

export const emitToAdmins = (event: string, payload: any) => {
  if (!io) return;
  console.log(`📤 Emitting to admins: ${event}`, payload);
  io.to("role:admin").emit(event, payload);
};

export const emitToUser = (userId: string, event: string, payload: any) => {
  if (!io) return;
  console.log(`📤 Emitting to user ${userId}: ${event}`, payload);
  io.to(`user:${userId}`).emit(event, payload);
};
