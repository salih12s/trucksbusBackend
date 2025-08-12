"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = exports.superAdminMiddleware = exports.adminMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../utils/database");
const logger_1 = require("../utils/logger");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await database_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    name: true,
                    role: true,
                    isActive: true,
                    isVerified: true,
                }
            });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Access denied. User not found.',
                });
            }
            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Access denied. Account is deactivated.',
                });
            }
            req.user = user;
            next();
        }
        catch (jwtError) {
            logger_1.logger.error('JWT verification error:', jwtError);
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token.',
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.authMiddleware = authMiddleware;
const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Authentication required.',
            });
        }
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.',
            });
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Admin middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.adminMiddleware = adminMiddleware;
const superAdminMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Authentication required.',
            });
        }
        if (req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Super admin privileges required.',
            });
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Super admin middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
exports.superAdminMiddleware = superAdminMiddleware;
const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await database_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    name: true,
                    role: true,
                    isActive: true,
                    isVerified: true,
                }
            });
            if (user && user.isActive) {
                req.user = user;
            }
        }
        catch (jwtError) {
            logger_1.logger.warn('Optional auth - invalid token:', jwtError);
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Optional auth middleware error:', error);
        next();
    }
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
//# sourceMappingURL=auth.js.map