"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingListings = exports.getDashboardStats = exports.rejectListing = exports.approveListing = exports.getListings = exports.deleteUser = exports.updateUser = exports.getUser = exports.getUsers = void 0;
const logger_1 = require("../utils/logger");
const database_1 = require("../utils/database");
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (search) {
            where.OR = [
                { first_name: { contains: search, mode: 'insensitive' } },
                { last_name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }
        const users = await database_1.prisma.users.findMany({
            where,
            skip,
            take: Number(limit),
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                is_active: true,
                created_at: true,
                _count: {
                    select: {
                        listings: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        const total = await database_1.prisma.users.count({ where });
        res.json({
            success: true,
            data: users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error in getUsers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUsers = getUsers;
const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await database_1.prisma.users.findUnique({
            where: { id },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                is_active: true,
                created_at: true,
                listings: {
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        is_approved: true,
                        is_active: true,
                        created_at: true
                    },
                    orderBy: { created_at: 'desc' }
                }
            }
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        logger_1.logger.error('Error in getUser:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUser = getUser;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, phone, is_active } = req.body;
        const user = await database_1.prisma.users.update({
            where: { id },
            data: {
                first_name,
                last_name,
                email,
                phone,
                is_active,
                updated_at: new Date()
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                is_active: true
            }
        });
        res.json({ success: true, data: user, message: 'Kullanıcı başarıyla güncellendi' });
    }
    catch (error) {
        logger_1.logger.error('Error in updateUser:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await database_1.prisma.users.delete({
            where: { id }
        });
        res.json({ success: true, message: 'Kullanıcı başarıyla silindi' });
    }
    catch (error) {
        logger_1.logger.error('Error in deleteUser:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteUser = deleteUser;
const getListings = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'pending', search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (status === 'pending') {
            where.is_approved = false;
            where.is_active = true;
        }
        else if (status === 'approved') {
            where.is_approved = true;
            where.is_active = true;
        }
        else if (status === 'rejected') {
            where.is_active = false;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        const listings = await database_1.prisma.listings.findMany({
            where,
            skip,
            take: Number(limit),
            include: {
                categories: true,
                vehicle_types: true,
                brands: true,
                models: true,
                variants: true,
                cities: true,
                districts: true,
                users: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        phone: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        const total = await database_1.prisma.listings.count({ where });
        res.json({
            success: true,
            data: {
                listings,
                pagination: {
                    current_page: Number(page),
                    total_pages: Math.ceil(total / Number(limit)),
                    total_items: total,
                    items_per_page: Number(limit)
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error in getListings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getListings = getListings;
const approveListing = async (req, res) => {
    try {
        const { id } = req.params;
        const currentListing = await database_1.prisma.listings.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                seller_name: true,
                seller_phone: true,
                seller_email: true,
                is_approved: true,
                is_active: true
            }
        });
        console.log('📋 Before approval - Current listing data:', currentListing);
        const listing = await database_1.prisma.listings.update({
            where: { id },
            data: {
                is_approved: true,
                is_active: true,
                updated_at: new Date()
            },
            select: {
                id: true,
                title: true,
                seller_name: true,
                seller_phone: true,
                seller_email: true,
                is_approved: true,
                is_active: true,
                users: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true
                    }
                }
            }
        });
        console.log('📋 After approval - Updated listing data:', listing);
        logger_1.logger.info(`Listing approved: ${id}`);
        res.json({
            success: true,
            data: listing,
            message: 'İlan başarıyla onaylandı'
        });
    }
    catch (error) {
        logger_1.logger.error('Error in approveListing:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.approveListing = approveListing;
const rejectListing = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const listing = await database_1.prisma.listings.update({
            where: { id },
            data: {
                is_approved: false,
                is_active: false,
                reject_reason: reason || 'İlan reddedildi',
                updated_at: new Date()
            },
            include: {
                users: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true
                    }
                }
            }
        });
        logger_1.logger.info(`Listing rejected: ${id}, reason: ${reason || 'No reason provided'}`);
        res.json({
            success: true,
            data: listing,
            message: 'İlan başarıyla reddedildi'
        });
    }
    catch (error) {
        logger_1.logger.error('Error in rejectListing:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.rejectListing = rejectListing;
const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalListings, pendingListings, approvedListings, rejectedListings, todayListings] = await Promise.all([
            database_1.prisma.users.count(),
            database_1.prisma.listings.count(),
            database_1.prisma.listings.count({ where: { is_approved: false, is_active: true } }),
            database_1.prisma.listings.count({ where: { is_approved: true, is_active: true } }),
            database_1.prisma.listings.count({ where: { is_active: false } }),
            database_1.prisma.listings.count({
                where: {
                    created_at: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            })
        ]);
        const stats = {
            totalUsers,
            totalListings,
            pendingListings,
            approvedListings,
            rejectedListings,
            todayListings
        };
        res.json({ success: true, data: stats });
    }
    catch (error) {
        logger_1.logger.error('Error in getDashboardStats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getDashboardStats = getDashboardStats;
const getPendingListings = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const listings = await database_1.prisma.listings.findMany({
            where: {
                is_approved: false,
                is_active: true
            },
            include: {
                categories: {
                    select: { name: true }
                },
                vehicle_types: {
                    select: { name: true }
                },
                brands: {
                    select: { name: true }
                },
                models: {
                    select: { name: true }
                },
                variants: {
                    select: { name: true }
                },
                cities: {
                    select: { name: true }
                },
                districts: {
                    select: { name: true }
                },
                users: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        phone: true
                    }
                }
            },
            skip,
            take: Number(limit),
            orderBy: { created_at: 'desc' }
        });
        const total = await database_1.prisma.listings.count({
            where: {
                is_approved: false,
                is_active: true
            }
        });
        res.json({
            success: true,
            data: {
                listings,
                pagination: {
                    current_page: Number(page),
                    total_pages: Math.ceil(total / Number(limit)),
                    total_items: total,
                    items_per_page: Number(limit)
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error in getPendingListings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getPendingListings = getPendingListings;
//# sourceMappingURL=adminController.js.map