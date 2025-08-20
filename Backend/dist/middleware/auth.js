"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = exports.optionalAuthMiddleware = exports.superAdminMiddleware = exports.adminMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../utils/database");
const logger_1 = require("../utils/logger");
const authMiddleware = async (req, res, next) => {
    try {
        console.log('=== AUTH MIDDLEWARE ===');
        console.log('Headers:', req.headers.authorization);
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No valid auth header found');
            res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
            return;
        }
        const token = authHeader.substring(7);
        console.log('Token found:', token.substring(0, 20) + '...');
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            console.log('Token decoded, userId:', decoded.id);
            const user = await database_1.prisma.users.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    username: true,
                    role: true,
                    is_active: true,
                    is_email_verified: true,
                }
            });
            console.log('User found:', user ? user.email : 'Not found');
            if (!user) {
                console.log('User not found in database');
                res.status(401).json({
                    success: false,
                    message: 'Access denied. User not found.',
                });
                return;
            }
            if (!user.is_active) {
                res.status(401).json({
                    success: false,
                    message: 'Access denied. Account is deactivated.',
                });
                return;
            }
            const normalizedUser = {
                ...user,
                role: String(user.role).toUpperCase()
            };
            console.log('User role normalized:', normalizedUser.role);
            req.user = normalizedUser;
            next();
        }
        catch (jwtError) {
            logger_1.logger.error('JWT verification error:', jwtError);
            res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token.',
            });
            return;
        }
    }
    catch (error) {
        logger_1.logger.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
        return;
    }
};
exports.authMiddleware = authMiddleware;
const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Access denied. Authentication required.',
            });
            return;
        }
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.',
            });
            return;
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Admin middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
        return;
    }
};
exports.adminMiddleware = adminMiddleware;
const superAdminMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Access denied. Authentication required.',
            });
            return;
        }
        if (req.user.role !== 'SUPER_ADMIN') {
            res.status(403).json({
                success: false,
                message: 'Access denied. Super admin privileges required.',
            });
            return;
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Super admin middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
        return;
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
            const user = await database_1.prisma.users.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    username: true,
                    role: true,
                    is_active: true,
                    is_email_verified: true,
                }
            });
            if (user && user.is_active) {
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
exports.authenticateToken = exports.authMiddleware;
//# sourceMappingURL=auth.js.map