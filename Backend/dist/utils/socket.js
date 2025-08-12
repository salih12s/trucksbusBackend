"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = initializeSocket;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("./logger");
const database_1 = require("./database");
function initializeSocket(io) {
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await database_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    name: true,
                    avatar: true,
                    isActive: true,
                }
            });
            if (!user || !user.isActive) {
                return next(new Error('Authentication error: User not found or inactive'));
            }
            socket.userId = user.id;
            socket.user = user;
            next();
        }
        catch (error) {
            logger_1.logger.error('Socket authentication error:', error);
            next(new Error('Authentication error: Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        logger_1.logger.info(`User ${socket.user.name} connected (${socket.userId})`);
        socket.join(`user:${socket.userId}`);
        socket.on('join_conversation', (conversationId) => {
            socket.join(`conversation:${conversationId}`);
            logger_1.logger.info(`User ${socket.userId} joined conversation ${conversationId}`);
        });
        socket.on('leave_conversation', (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
            logger_1.logger.info(`User ${socket.userId} left conversation ${conversationId}`);
        });
        socket.on('send_message', async (data) => {
            try {
                const message = await database_1.prisma.message.create({
                    data: {
                        content: data.content,
                        senderId: socket.userId,
                        conversationId: data.conversationId,
                        listingId: data.listingId,
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            }
                        },
                        listing: {
                            select: {
                                id: true,
                                title: true,
                                price: true,
                                images: true,
                            }
                        }
                    }
                });
                io.to(`conversation:${data.conversationId}`).emit('new_message', {
                    ...message,
                    createdAt: message.createdAt.toISOString(),
                });
                logger_1.logger.info(`Message sent in conversation ${data.conversationId} by user ${socket.userId}`);
            }
            catch (error) {
                logger_1.logger.error('Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });
        socket.on('mark_message_read', async (messageId) => {
            try {
                await database_1.prisma.message.update({
                    where: { id: messageId },
                    data: { isRead: true }
                });
                socket.emit('message_read', { messageId });
                logger_1.logger.info(`Message ${messageId} marked as read by user ${socket.userId}`);
            }
            catch (error) {
                logger_1.logger.error('Error marking message as read:', error);
            }
        });
        socket.on('typing_start', (conversationId) => {
            socket.to(`conversation:${conversationId}`).emit('user_typing', {
                userId: socket.userId,
                userName: socket.user.name,
            });
        });
        socket.on('typing_stop', (conversationId) => {
            socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
                userId: socket.userId,
            });
        });
        socket.on('update_status', (status) => {
            socket.broadcast.emit('user_status_update', {
                userId: socket.userId,
                status,
            });
        });
        socket.on('disconnect', () => {
            logger_1.logger.info(`User ${socket.user.name} disconnected (${socket.userId})`);
            socket.broadcast.emit('user_status_update', {
                userId: socket.userId,
                status: 'offline',
            });
        });
        socket.on('listing_viewed', async (listingId) => {
            try {
                await database_1.prisma.listing.update({
                    where: { id: listingId },
                    data: {
                        views: {
                            increment: 1
                        }
                    }
                });
                const listing = await database_1.prisma.listing.findUnique({
                    where: { id: listingId },
                    select: { userId: true, title: true }
                });
                if (listing && listing.userId !== socket.userId) {
                    io.to(`user:${listing.userId}`).emit('listing_view_notification', {
                        listingId,
                        listingTitle: listing.title,
                        viewerId: socket.userId,
                        viewerName: socket.user.name,
                    });
                }
            }
            catch (error) {
                logger_1.logger.error('Error handling listing view:', error);
            }
        });
    });
    return io;
}
//# sourceMappingURL=socket.js.map