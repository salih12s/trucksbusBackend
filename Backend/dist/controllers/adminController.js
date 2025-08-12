"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.rejectListing = exports.approveListing = exports.getAdminListings = void 0;
const database_1 = require("../utils/database");
const logger_1 = require("../utils/logger");
const getAdminListings = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const where = {};
        if (status)
            where.status = status;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [listings, total] = await Promise.all([
            database_1.prisma.listing.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip: offset,
                take: Number(limit),
                include: {
                    categories: true,
                    users: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            }),
            database_1.prisma.listing.count({ where })
        ]);
        const totalPages = Math.ceil(total / Number(limit));
        res.status(200).json({
            success: true,
            data: {
                listings,
                pagination: {
                    current_page: Number(page),
                    total_pages: totalPages,
                    total_items: total,
                    items_per_page: Number(limit)
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get admin listings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getAdminListings = getAdminListings;
const approveListing = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await database_1.prisma.listing.update({
            where: { id },
            data: {
                status: 'ACTIVE',
                is_approved: true,
                is_pending: false,
                approved_by: req.user.id,
                approved_at: new Date(),
                updated_at: new Date()
            }
        });
        logger_1.logger.info(`Listing approved: ${listing.id} by admin: ${req.user.id}`);
        res.status(200).json({
            success: true,
            message: 'Listing approved successfully',
            data: { listing }
        });
    }
    catch (error) {
        logger_1.logger.error('Approve listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.approveListing = approveListing;
const rejectListing = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const listing = await database_1.prisma.listing.update({
            where: { id },
            data: {
                status: 'REJECTED',
                is_approved: false,
                is_pending: false,
                reject_reason: reason,
                rejected_at: new Date(),
                updated_at: new Date()
            }
        });
        logger_1.logger.info(`Listing rejected: ${listing.id} by admin: ${req.user.id}`);
        res.status(200).json({
            success: true,
            message: 'Listing rejected successfully',
            data: { listing }
        });
    }
    catch (error) {
        logger_1.logger.error('Reject listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.rejectListing = rejectListing;
const getDashboardStats = async (req, res) => {
    try {
        const [totalListings, pendingListings, activeListings, totalUsers] = await Promise.all([
            database_1.prisma.listing.count(),
            database_1.prisma.listing.count({ where: { status: 'PENDING' } }),
            database_1.prisma.listing.count({ where: { status: 'ACTIVE' } }),
            database_1.prisma.user.count()
        ]);
        res.status(200).json({
            success: true,
            data: {
                totalListings,
                pendingListings,
                activeListings,
                totalUsers
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=adminController.js.map