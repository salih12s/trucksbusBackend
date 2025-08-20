"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.resetPassword = exports.forgotPassword = exports.refreshToken = exports.getMe = exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ulid_1 = require("ulid");
const database_1 = require("../utils/database");
const logger_1 = require("../utils/logger");
const register = async (req, res) => {
    try {
        const { email, password, first_name, last_name, phone, city, district } = req.body;
        const existingUser = await database_1.prisma.users.findUnique({
            where: { email }
        });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: 'Bu e-posta adresi ile zaten kayıtlı bir kullanıcı bulunmaktadır.'
            });
            return;
        }
        const saltRounds = 10;
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        const user = await database_1.prisma.users.create({
            data: {
                id: (0, ulid_1.ulid)(),
                email,
                password: hashedPassword,
                first_name,
                last_name,
                phone,
                city,
                district,
                role: 'USER',
                is_active: true,
                is_email_verified: false,
                updated_at: new Date()
            }
        });
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        res.status(201).json({
            success: true,
            message: 'Kayıt başarıyla tamamlandı.',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    avatar: user.avatar,
                    role: user.role
                },
                token
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error in register:', error);
        res.status(500).json({
            success: false,
            message: 'Kayıt işlemi sırasında bir hata oluştu.'
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'E-posta ve şifre alanları zorunludur.'
            });
            return;
        }
        const user = await database_1.prisma.users.findUnique({
            where: { email }
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Geçersiz e-posta veya şifre.'
            });
            return;
        }
        if (!user.is_active) {
            res.status(403).json({
                success: false,
                message: 'Hesabınız devre dışı bırakılmıştır.'
            });
            return;
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password || '');
        if (!isValidPassword) {
            res.status(401).json({
                success: false,
                message: 'Geçersiz e-posta veya şifre.'
            });
            return;
        }
        await database_1.prisma.users.update({
            where: { id: user.id },
            data: {
                last_login: new Date(),
                login_attempts: 0,
                updated_at: new Date()
            }
        });
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name
        }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        res.status(200).json({
            success: true,
            message: 'Giriş başarılı.',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    username: user.username,
                    phone: user.phone,
                    avatar: user.avatar,
                    city: user.city,
                    district: user.district,
                    role: user.role,
                    is_email_verified: user.is_email_verified
                },
                token
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error in login:', error);
        res.status(500).json({
            success: false,
            message: 'Giriş işlemi sırasında bir hata oluştu.'
        });
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Çıkış başarılı.'
        });
    }
    catch (error) {
        logger_1.logger.error('Error in logout:', error);
        res.status(500).json({
            success: false,
            message: 'Çıkış işlemi sırasında bir hata oluştu.'
        });
    }
};
exports.logout = logout;
const getMe = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Yetkisiz erişim.'
            });
            return;
        }
        const user = await database_1.prisma.users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                username: true,
                phone: true,
                avatar: true,
                city: true,
                district: true,
                role: true,
                is_active: true,
                is_email_verified: true,
                created_at: true
            }
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı.'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: { user }
        });
    }
    catch (error) {
        logger_1.logger.error('Error in getMe:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı bilgileri alınırken bir hata oluştu.'
        });
    }
};
exports.getMe = getMe;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: 'Refresh token gereklidir.'
            });
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET || 'your-secret-key');
            const user = await database_1.prisma.users.findUnique({
                where: { id: decoded.id }
            });
            if (!user || !user.is_active) {
                res.status(401).json({
                    success: false,
                    message: 'Geçersiz token.'
                });
                return;
            }
            const newToken = jsonwebtoken_1.default.sign({
                id: user.id,
                email: user.email,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name
            }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
            res.status(200).json({
                success: true,
                data: { token: newToken }
            });
        }
        catch (jwtError) {
            res.status(401).json({
                success: false,
                message: 'Geçersiz veya süresi dolmuş token.'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Error in refreshToken:', error);
        res.status(500).json({
            success: false,
            message: 'Token yenileme sırasında bir hata oluştu.'
        });
    }
};
exports.refreshToken = refreshToken;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                message: 'E-posta adresi gereklidir.'
            });
            return;
        }
        const user = await database_1.prisma.users.findUnique({
            where: { email }
        });
        if (!user) {
            res.status(200).json({
                success: true,
                message: 'Eğer bu e-posta adresi sistemde kayıtlı ise, şifre sıfırlama bağlantısı gönderilecektir.'
            });
            return;
        }
        const resetToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, type: 'password_reset' }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
        await database_1.prisma.users.update({
            where: { id: user.id },
            data: {
                reset_password_token: resetToken,
                reset_password_expires: new Date(Date.now() + 3600000),
                updated_at: new Date()
            }
        });
        logger_1.logger.info(`Password reset requested for ${email}, token: ${resetToken}`);
        res.status(200).json({
            success: true,
            message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
            ...(process.env.NODE_ENV === 'development' && { resetToken })
        });
    }
    catch (error) {
        logger_1.logger.error('Error in forgotPassword:', error);
        res.status(500).json({
            success: false,
            message: 'Şifre sıfırlama işlemi sırasında bir hata oluştu.'
        });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'Token ve yeni şifre gereklidir.'
            });
            return;
        }
        if (newPassword.length < 6) {
            res.status(400).json({
                success: false,
                message: 'Şifre en az 6 karakter olmalıdır.'
            });
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            if (decoded.type !== 'password_reset') {
                res.status(400).json({
                    success: false,
                    message: 'Geçersiz token türü.'
                });
                return;
            }
            const user = await database_1.prisma.users.findFirst({
                where: {
                    id: decoded.id,
                    reset_password_token: token,
                    reset_password_expires: {
                        gt: new Date()
                    }
                }
            });
            if (!user) {
                res.status(400).json({
                    success: false,
                    message: 'Geçersiz veya süresi dolmuş token.'
                });
                return;
            }
            const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
            await database_1.prisma.users.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    reset_password_token: null,
                    reset_password_expires: null,
                    updated_at: new Date()
                }
            });
            res.status(200).json({
                success: true,
                message: 'Şifreniz başarıyla sıfırlandı.'
            });
        }
        catch (jwtError) {
            res.status(400).json({
                success: false,
                message: 'Geçersiz veya süresi dolmuş token.'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Error in resetPassword:', error);
        res.status(500).json({
            success: false,
            message: 'Şifre sıfırlama işlemi sırasında bir hata oluştu.'
        });
    }
};
exports.resetPassword = resetPassword;
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            res.status(400).json({
                success: false,
                message: 'Doğrulama token\'ı gereklidir.'
            });
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            if (decoded.type !== 'email_verification') {
                res.status(400).json({
                    success: false,
                    message: 'Geçersiz token türü.'
                });
                return;
            }
            const user = await database_1.prisma.users.findFirst({
                where: {
                    id: decoded.id,
                    email_verification_token: token,
                    email_verification_expires: {
                        gt: new Date()
                    }
                }
            });
            if (!user) {
                res.status(400).json({
                    success: false,
                    message: 'Geçersiz veya süresi dolmuş doğrulama token\'ı.'
                });
                return;
            }
            await database_1.prisma.users.update({
                where: { id: user.id },
                data: {
                    is_email_verified: true,
                    email_verification_token: null,
                    email_verification_expires: null,
                    updated_at: new Date()
                }
            });
            res.status(200).json({
                success: true,
                message: 'E-posta adresiniz başarıyla doğrulandı.'
            });
        }
        catch (jwtError) {
            res.status(400).json({
                success: false,
                message: 'Geçersiz veya süresi dolmuş doğrulama token\'ı.'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Error in verifyEmail:', error);
        res.status(500).json({
            success: false,
            message: 'E-posta doğrulama işlemi sırasında bir hata oluştu.'
        });
    }
};
exports.verifyEmail = verifyEmail;
//# sourceMappingURL=authController.js.map