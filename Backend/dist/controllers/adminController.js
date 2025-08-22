"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getListingDetail = exports.updateUser = exports.getRecentActivities = exports.hardDeleteListing = exports.deleteUser = exports.toggleUserStatus = exports.deleteListing = exports.rejectListing = exports.approveListing = exports.getReports = exports.getUsers = exports.getPendingListings = exports.getListings = exports.getDashboardStats = void 0;
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
const serializeBigInt = (obj) => {
    return JSON.parse(JSON.stringify(obj, (key, value) => typeof value === 'bigint' ? Number(value) : value));
};
const getDashboardStats = async (req, res) => {
    try {
        logger_1.logger.info('Dashboard stats requested');
        const [totalUsers, totalListings, activeListings, pendingListings, totalMessages, totalCategories, listingsByStatus, topCategories, topCities, recentUsers, recentListings, userStats] = await Promise.all([
            prisma_1.prisma.users.count(),
            prisma_1.prisma.listings.count(),
            prisma_1.prisma.listings.count({
                where: {
                    is_active: true,
                    is_approved: true
                }
            }),
            prisma_1.prisma.listings.count({
                where: {
                    is_pending: true,
                    is_approved: false
                }
            }),
            prisma_1.prisma.messages.count(),
            prisma_1.prisma.categories.count(),
            prisma_1.prisma.listings.groupBy({
                by: ['status'],
                _count: {
                    id: true
                }
            }),
            Promise.resolve([]),
            Promise.resolve([]),
            prisma_1.prisma.users.findMany({
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    created_at: true,
                    phone: true
                },
                orderBy: {
                    created_at: 'desc'
                },
                take: 10,
                where: {
                    created_at: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                }
            }),
            prisma_1.prisma.listings.findMany({
                select: {
                    id: true,
                    title: true,
                    price: true,
                    created_at: true,
                    user_id: true,
                    category_id: true,
                    city_id: true
                },
                orderBy: {
                    created_at: 'desc'
                },
                take: 10
            }),
            Promise.all([
                prisma_1.prisma.users.count({
                    where: {
                        created_at: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                        }
                    }
                }),
                prisma_1.prisma.users.count({
                    where: {
                        created_at: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        }
                    }
                }),
                prisma_1.prisma.users.count({
                    where: {
                        created_at: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        }
                    }
                })
            ]).then(([today, week, month]) => ({
                today_users: today,
                week_users: week,
                month_users: month
            }))
        ]);
        const categoryIds = topCategories
            .map((cat) => cat.category_id)
            .filter(Boolean);
        const categories = categoryIds.length > 0 ? await prisma_1.prisma.categories.findMany({
            where: {
                id: {
                    in: categoryIds
                }
            },
            select: {
                id: true,
                name: true
            }
        }) : [];
        const cityIds = topCities
            .map((city) => city.city_id)
            .filter((id) => id !== null);
        const cities = cityIds.length > 0 ? await prisma_1.prisma.cities.findMany({
            where: {
                id: {
                    in: cityIds
                }
            },
            select: {
                id: true,
                name: true
            }
        }) : [];
        logger_1.logger.info('Dashboard stats retrieved successfully');
        const enrichedCategories = topCategories.map((cat) => {
            const category = categories.find(c => c.id === cat.category_id);
            return {
                id: cat.category_id,
                name: category?.name || 'Unknown',
                count: Number(cat._count.id)
            };
        });
        const enrichedCities = topCities.map((city) => {
            const cityInfo = cities.find(c => c.id === city.city_id);
            return {
                id: city.city_id,
                name: cityInfo?.name || 'Unknown',
                count: Number(city._count.id)
            };
        });
        res.json({
            success: true,
            data: {
                pendingCount: Number(pendingListings),
                activeCount: Number(activeListings),
                usersCount: Number(totalUsers),
                reportsOpenCount: 0,
                todayCreated: Array.isArray(userStats) ? Number(userStats[0]?.today_users || 0) : 0,
                weekCreated: Array.isArray(userStats) ? Number(userStats[0]?.week_users || 0) : 0,
                monthCreated: Array.isArray(userStats) ? Number(userStats[0]?.month_users || 0) : 0,
                totalListings: Number(totalListings),
                totalMessages: Number(totalMessages)
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Dashboard istatistikleri alınırken hata oluştu',
            error: error.message
        });
    }
};
exports.getDashboardStats = getDashboardStats;
const getListings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || parseInt(req.query.pageSize) || 10;
        const sort = req.query.sort || 'created_at';
        const order = req.query.order || 'desc';
        const search = req.query.search;
        const status = req.query.status;
        const skip = (page - 1) * limit;
        let where = {};
        if (search) {
            where.OR = [
                {
                    title: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    description: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            ];
        }
        if (status) {
            if (status === 'PENDING') {
                where.is_pending = true;
                where.is_approved = false;
            }
            else if (status === 'ACTIVE') {
                where.is_pending = false;
                where.is_approved = true;
                where.is_active = true;
            }
            else if (status === 'INACTIVE') {
                where.is_active = false;
            }
            else {
                where.status = status;
            }
        }
        const [listings, totalCount] = await Promise.all([
            prisma_1.prisma.listings.findMany({
                where,
                include: {
                    categories: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    brands: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    models: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    cities: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    districts: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    users: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                            phone: true
                        }
                    },
                    listing_images: {
                        select: {
                            id: true,
                            url: true,
                            sort_order: true
                        },
                        orderBy: {
                            sort_order: 'asc'
                        }
                    }
                },
                orderBy: {
                    [sort]: order
                },
                skip,
                take: limit
            }),
            prisma_1.prisma.listings.count({ where })
        ]);
        const totalPages = Math.ceil(totalCount / limit);
        res.json({
            success: true,
            data: {
                listings: serializeBigInt(listings),
                pagination: {
                    page,
                    limit,
                    totalCount: Number(totalCount),
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting listings:', error);
        res.status(500).json({
            success: false,
            message: 'İlanlar alınırken hata oluştu',
            error: error.message
        });
    }
};
exports.getListings = getListings;
const getPendingListings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const sort = req.query.sort || 'created_at';
        const order = req.query.order || 'desc';
        const skip = (page - 1) * pageSize;
        const where = {
            is_pending: true,
            is_approved: false
        };
        const [listings, totalCount] = await Promise.all([
            prisma_1.prisma.listings.findMany({
                where,
                include: {
                    categories: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    cities: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    districts: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    users: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                            phone: true
                        }
                    },
                    listing_images: {
                        select: {
                            id: true,
                            url: true,
                            sort_order: true
                        },
                        orderBy: {
                            sort_order: 'asc'
                        }
                    }
                },
                orderBy: {
                    [sort]: order
                },
                skip,
                take: pageSize
            }),
            prisma_1.prisma.listings.count({ where })
        ]);
        res.json({
            success: true,
            data: {
                listings: serializeBigInt(listings),
                pagination: {
                    page,
                    pageSize,
                    totalCount: Number(totalCount),
                    totalPages: Math.ceil(totalCount / pageSize)
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting pending listings:', error);
        res.status(500).json({
            success: false,
            message: 'Bekleyen ilanlar alınırken hata oluştu',
            error: error.message
        });
    }
};
exports.getPendingListings = getPendingListings;
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const sort = req.query.sort || 'created_at';
        const order = req.query.order || 'desc';
        const skip = (page - 1) * limit;
        let where = {};
        if (search) {
            where.OR = [
                {
                    first_name: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    email: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            ];
        }
        const [users, totalCount] = await Promise.all([
            prisma_1.prisma.users.findMany({
                where,
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
                orderBy: {
                    [sort]: order
                },
                skip,
                take: limit
            }),
            prisma_1.prisma.users.count({ where })
        ]);
        const totalPages = Math.ceil(totalCount / limit);
        res.json({
            success: true,
            data: {
                users: serializeBigInt(users),
                pagination: {
                    page,
                    limit,
                    totalCount: Number(totalCount),
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting users:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcılar alınırken hata oluştu',
            error: error.message
        });
    }
};
exports.getUsers = getUsers;
const getReports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const [reports, totalCount] = await Promise.all([
            prisma_1.prisma.reports.findMany({
                orderBy: {
                    created_at: 'desc'
                },
                skip,
                take: limit
            }),
            prisma_1.prisma.reports.count()
        ]);
        const totalPages = Math.ceil(totalCount / limit);
        res.json({
            success: true,
            data: {
                reports: serializeBigInt(reports),
                pagination: {
                    page,
                    limit,
                    totalCount: Number(totalCount),
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting reports:', error);
        res.status(500).json({
            success: false,
            message: 'Şikayetler alınırken hata oluştu',
            error: error.message
        });
    }
};
exports.getReports = getReports;
const approveListing = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await prisma_1.prisma.listings.update({
            where: { id },
            data: {
                is_approved: true,
                is_pending: false,
                is_active: true,
                approved_at: new Date(),
                status: 'ACTIVE'
            }
        });
        logger_1.logger.info(`Listing ${id} approved`);
        res.json({
            success: true,
            message: 'İlan onaylandı',
            data: serializeBigInt(listing)
        });
    }
    catch (error) {
        logger_1.logger.error('Error approving listing:', error);
        res.status(500).json({
            success: false,
            message: 'İlan onaylanırken hata oluştu',
            error: error.message
        });
    }
};
exports.approveListing = approveListing;
const rejectListing = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const listing = await prisma_1.prisma.listings.update({
            where: { id },
            data: {
                is_approved: false,
                is_pending: false,
                is_active: false,
                rejected_at: new Date(),
                reject_reason: reason,
                status: 'REJECTED'
            }
        });
        logger_1.logger.info(`Listing ${id} rejected`);
        res.json({
            success: true,
            message: 'İlan reddedildi',
            data: serializeBigInt(listing)
        });
    }
    catch (error) {
        logger_1.logger.error('Error rejecting listing:', error);
        res.status(500).json({
            success: false,
            message: 'İlan reddedilirken hata oluştu',
            error: error.message
        });
    }
};
exports.rejectListing = rejectListing;
const deleteListing = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.listings.delete({
            where: { id }
        });
        logger_1.logger.info(`Listing ${id} deleted`);
        res.json({
            success: true,
            message: 'İlan silindi'
        });
    }
    catch (error) {
        logger_1.logger.error('Error deleting listing:', error);
        res.status(500).json({
            success: false,
            message: 'İlan silinirken hata oluştu',
            error: error.message
        });
    }
};
exports.deleteListing = deleteListing;
const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = await prisma_1.prisma.users.findUnique({
            where: { id },
            select: { is_active: true }
        });
        if (!currentUser) {
            res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
            return;
        }
        const user = await prisma_1.prisma.users.update({
            where: { id },
            data: {
                is_active: !currentUser.is_active
            }
        });
        logger_1.logger.info(`User ${id} status toggled to ${user.is_active}`);
        res.json({
            success: true,
            message: `Kullanıcı ${user.is_active ? 'aktif edildi' : 'deaktif edildi'}`,
            data: serializeBigInt(user)
        });
    }
    catch (error) {
        logger_1.logger.error('Error toggling user status:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı durumu güncellenirken hata oluştu',
            error: error.message
        });
    }
};
exports.toggleUserStatus = toggleUserStatus;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.users.delete({
            where: { id }
        });
        logger_1.logger.info(`User ${id} deleted`);
        res.json({
            success: true,
            message: 'Kullanıcı silindi'
        });
    }
    catch (error) {
        logger_1.logger.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı silinirken hata oluştu',
            error: error.message
        });
    }
};
exports.deleteUser = deleteUser;
exports.hardDeleteListing = exports.deleteListing;
const getRecentActivities = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const [recentUsers, recentListings] = await Promise.all([
            prisma_1.prisma.users.findMany({
                where: {
                    created_at: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                },
                orderBy: { created_at: 'desc' },
                take: Math.floor(limit / 2),
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    created_at: true
                }
            }),
            prisma_1.prisma.listings.findMany({
                where: {
                    created_at: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                },
                orderBy: { created_at: 'desc' },
                take: Math.floor(limit / 2),
                include: {
                    users: {
                        select: {
                            first_name: true,
                            last_name: true
                        }
                    }
                }
            })
        ]);
        const activities = [
            ...recentUsers.map(user => ({
                id: user.id,
                type: 'user',
                title: 'Yeni kullanıcı kaydı',
                description: `${user.first_name} ${user.last_name} platforma katıldı`,
                user: `${user.first_name} ${user.last_name}`,
                email: user.email,
                time: user.created_at.toISOString(),
                status: 'active'
            })),
            ...recentListings.map(listing => ({
                id: listing.id,
                type: 'listing',
                title: 'Yeni ilan',
                description: listing.title,
                user: listing.users ? `${listing.users.first_name} ${listing.users.last_name}` : 'Bilinmeyen',
                time: listing.created_at.toISOString(),
                status: listing.is_approved ? 'approved' : 'pending',
                price: listing.price
            }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, limit);
        res.json({
            success: true,
            data: activities
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting recent activities:', error);
        res.status(500).json({
            success: false,
            message: 'Son aktiviteler alınırken hata oluştu',
            error: error.message
        });
    }
};
exports.getRecentActivities = getRecentActivities;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, phone, role, is_active } = req.body;
        const user = await prisma_1.prisma.users.update({
            where: { id },
            data: {
                first_name,
                last_name,
                email,
                phone,
                role,
                is_active,
                updated_at: new Date()
            }
        });
        logger_1.logger.info(`User ${id} updated`);
        res.json({
            success: true,
            message: 'Kullanıcı güncellendi',
            data: serializeBigInt(user)
        });
    }
    catch (error) {
        logger_1.logger.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı güncellenirken hata oluştu',
            error: error.message
        });
    }
};
exports.updateUser = updateUser;
const getListingDetail = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                message: 'İlan ID gerekli'
            });
            return;
        }
        const listing = await prisma_1.prisma.listings.findUnique({
            where: { id },
            include: {
                categories: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                brands: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                models: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                cities: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                districts: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                users: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        phone: true,
                        created_at: true
                    }
                },
                listing_images: {
                    select: {
                        id: true,
                        url: true,
                        sort_order: true
                    },
                    orderBy: {
                        sort_order: 'asc'
                    }
                },
                listing_properties: {
                    select: {
                        id: true,
                        key: true,
                        value: true
                    }
                },
                variants: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                vehicle_types: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        if (!listing) {
            res.status(404).json({
                success: false,
                message: 'İlan bulunamadı'
            });
            return;
        }
        console.log('🔍 RAW listing from DB:', {
            id: listing.id,
            title: listing.title,
            features: listing.features,
            featuresType: typeof listing.features
        });
        console.log('� RAW DB Images:', listing.listing_images?.length || 0);
        console.log('� RAW DB Properties:', listing.listing_properties?.length || 0);
        console.log('🎯 RAW DB Features:', listing.features);
        const transformedListing = {
            ...listing,
            listing_images: (() => {
                if (listing.listing_images && listing.listing_images.length > 0) {
                    console.log('🖼️ Using images from listing_images table');
                    return listing.listing_images.map((img) => ({
                        id: img.id,
                        url: img.url,
                        image_url: img.url,
                        sort_order: img.sort_order,
                        order: img.sort_order
                    }));
                }
                if (listing.images && Array.isArray(listing.images)) {
                    console.log('🖼️ Using images from listings.images field');
                    return listing.images
                        .filter((img) => typeof img === 'string')
                        .map((img, index) => ({
                        id: `inline_${index}`,
                        url: img,
                        image_url: img,
                        sort_order: index,
                        order: index
                    }));
                }
                console.log('🖼️ No images found');
                return [];
            })(),
            listing_properties: listing.listing_properties?.map((prop) => {
                console.log('� Processing property:', { key: prop.key, value: prop.value });
                return {
                    id: prop.id,
                    property_name: prop.key,
                    property_value: prop.value
                };
            }) || [],
            features: listing.features ? (typeof listing.features === 'string'
                ? (() => {
                    try {
                        const parsed = JSON.parse(listing.features);
                        console.log('✅ Successfully parsed features:', parsed);
                        return parsed;
                    }
                    catch (error) {
                        console.error('❌ Failed to parse features:', error);
                        return {};
                    }
                })()
                : listing.features) : {}
        };
        console.log('� TRANSFORMED Images:', transformedListing.listing_images?.length || 0);
        console.log('� TRANSFORMED Properties:', transformedListing.listing_properties?.length || 0);
        console.log('� TRANSFORMED Features:', transformedListing.features);
        logger_1.logger.info(`Listing detail ${id} retrieved by admin`);
        res.json({
            success: true,
            data: serializeBigInt(transformedListing)
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting listing detail:', error);
        res.status(500).json({
            success: false,
            message: 'İlan detayı alınırken hata oluştu',
            error: error.message
        });
    }
};
exports.getListingDetail = getListingDetail;
//# sourceMappingURL=adminController.js.map