"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToUser = exports.emitToAdmins = exports.getIO = exports.initSocket = void 0;
let io;
const initSocket = (socketServer) => {
    io = socketServer;
    console.log('🔌 Socket.IO initialized with room management');
    io.on("connection", (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);
        socket.on("user:join", (data) => {
            const room = `user:${data.user_id}`;
            socket.join(room);
            console.log(`🏠 Socket ${socket.id} joined user room: ${room}`);
        });
        socket.on("join", (data) => {
            console.log(`🏠 Socket ${socket.id} joining room: ${data.room}`);
            socket.join(data.room);
        });
        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => io;
exports.getIO = getIO;
const emitToAdmins = (event, payload) => {
    if (!io)
        return;
    console.log(`📤 Emitting to admins: ${event}`, payload);
    io.to("role:admin").emit(event, payload);
};
exports.emitToAdmins = emitToAdmins;
const emitToUser = (userId, event, payload) => {
    if (!io)
        return;
    console.log(`📤 Emitting to user ${userId}: ${event}`, payload);
    io.to(`user:${userId}`).emit(event, payload);
};
exports.emitToUser = emitToUser;
//# sourceMappingURL=socket.js.map