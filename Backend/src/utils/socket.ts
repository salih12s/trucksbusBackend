import { Server } from "socket.io";

let io: Server;

export const initSocket = (socketServer: Server) => {
  io = socketServer;
  
  console.log('🔌 Socket.IO initialized with room management');
  
  io.on("connection", (socket: any) => {
    console.log(`🔌 Socket connected: ${socket.id}`);
    
    // Handle user joining their personal room
    socket.on("user:join", (data: { user_id: string }) => {
      const room = `user:${data.user_id}`;
      socket.join(room);
      console.log(`🏠 Socket ${socket.id} joined user room: ${room}`);
    });
    
    // Handle admin joining admin room
    socket.on("join", (data: { room: string }) => {
      console.log(`🏠 Socket ${socket.id} joining room: ${data.room}`);
      socket.join(data.room);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
  
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
