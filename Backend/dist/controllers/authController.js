"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.resetPassword = exports.forgotPassword = exports.refreshToken = exports.getMe = exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../utils/database");
const logger_1 = require("../utils/logger");
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, username, phone } = req.body;
        const existingUser = await database_1.prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email ? 'Email already registered' : 'Username already taken',
            });
        }
        const salt = await bcryptjs_1.default.genSalt(12);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const user = await database_1.prisma.user.create({
            data: {
                email,
                username,
                first_name: firstName,
                last_name: lastName,
                password: hashedPassword,
                phone,
                updated_at: new Date(),
            },
            select: {
                id: true,
                email: true,
                username: true,
                first_name: true,
                last_name: true,
                phone: true,
                role: true,
                is_email_verified: true,
                created_at: true,
            }
        });
        const token = generateToken(user.id);
        logger_1.logger.info(`User registered: ${user.email}`);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user,
                token,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await database_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated',
            });
        }
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const token = generateToken(user.id);
        const { password: _, ...userWithoutPassword } = user;
        logger_1.logger.info(`User logged in: ${user.email}`);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: userWithoutPassword,
                token,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        logger_1.logger.info(`User logged out: ${req.user?.email}`);
        res.status(200).json({
            success: true,
            message: 'Logout successful',
        });
    }
    catch (error) {
        logger_1.logger.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.logout = logout;
const getMe = async (req, res) => {
    try {
        const user = await database_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                name: true,
                phone: true,
                avatar: true,
                role: true,
                isVerified: true,
                bio: true,
                company: true,
                location: true,
                createdAt: true,
                lastLoginAt: true,
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        res.status(200).json({
            success: true,
            data: { user },
        });
    }
    catch (error) {
        logger_1.logger.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.getMe = getMe;
const refreshToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token is required',
            });
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await database_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, isActive: true }
            });
            if (!user || !user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token',
                });
            }
            const newToken = generateToken(user.id);
            res.status(200).json({
                success: true,
                data: { token: newToken },
            });
        }
        catch (jwtError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.refreshToken = refreshToken;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await database_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If the email exists, a reset link has been sent',
            });
        }
        const resetToken = generateToken(user.id);
        logger_1.logger.info(`Password reset requested for: ${email}`);
        res.status(200).json({
            success: true,
            message: 'If the email exists, a reset link has been sent',
            ...(process.env.NODE_ENV === 'development' && { resetToken }),
        });
    }
    catch (error) {
        logger_1.logger.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const salt = await bcryptjs_1.default.genSalt(12);
            const hashedPassword = await bcryptjs_1.default.hash(password, salt);
            await database_1.prisma.user.update({
                where: { id: decoded.userId },
                data: { password: hashedPassword },
            });
            logger_1.logger.info(`Password reset successful for user: ${decoded.userId}`);
            res.status(200).json({
                success: true,
                message: 'Password reset successful',
            });
        }
        catch (jwtError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.resetPassword = resetPassword;
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            await database_1.prisma.user.update({
                where: { id: decoded.userId },
                data: {
                    isVerified: true,
                    emailVerifiedAt: new Date(),
                },
            });
            logger_1.logger.info(`Email verified for user: ${decoded.userId}`);
            res.status(200).json({
                success: true,
                message: 'Email verified successfully',
            });
        }
        catch (jwtError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token',
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Verify email error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.verifyEmail = verifyEmail;
//# sourceMappingURL=authController.js.map