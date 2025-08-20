"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavorites = exports.toggleFavorite = exports.getUserListings = exports.debugListingImages = exports.deleteListing = exports.updateListing = exports.getListingById = exports.debugListingData = exports.getListings = exports.createListing = void 0;
const database_1 = require("../utils/database");
const logger_1 = require("../utils/logger");
const createListing = async (req, res) => {
    try {
        console.log('🔄 Creating listing with data:', req.body);
        const { title, description, price, year, mileage, fuel_type, transmission_type, engine_size, category_id, vehicle_type_id, brand_id, model_id, variant_id, city_id, district_id, images, contact_phone, contact_email, seller_name, seller_phone, seller_email } = req.body;
        if (!title || !description || !price || !category_id || !vehicle_type_id || !brand_id) {
            res.status(400).json({
                success: false,
                message: 'Gerekli alanlar eksik: title, description, price, category_id, vehicle_type_id, brand_id'
            });
            return;
        }
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required to create listing'
            });
            return;
        }
        console.log('✅ Creating listing for authenticated user:', userId);
        const user = await database_1.prisma.users.findUnique({
            where: { id: userId },
            select: { first_name: true, last_name: true, phone: true, email: true }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const listing = await database_1.prisma.listings.create({
            data: {
                id: `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                title,
                description,
                price: Number(price),
                year: year ? Number(year) : 2000,
                km: mileage ? Number(mileage) : null,
                fuel_type,
                transmission: transmission_type,
                engine_volume: engine_size,
                seller_name: seller_name || `${user.first_name} ${user.last_name}`,
                seller_phone: seller_phone || contact_phone || user.phone || '',
                seller_email: seller_email || contact_email || user.email || '',
                category_id: category_id,
                vehicle_type_id: vehicle_type_id,
                user_id: userId,
                brand_id: brand_id || null,
                model_id: model_id || null,
                variant_id: variant_id || null,
                city_id: city_id || null,
                district_id: district_id || null,
                images: images || [],
                status: "PENDING",
                is_active: true,
                is_approved: false,
                is_pending: true,
                created_at: new Date(),
                updated_at: new Date()
            },
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
                        email: true
                    }
                }
            }
        });
        console.log('✅ Created listing:', listing);
        logger_1.logger.info(`New listing created: ${listing.id} by user: ${userId}`);
        res.status(201).json({
            success: true,
            message: 'İlan başarıyla oluşturuldu ve onay için gönderildi',
            data: listing
        });
    }
    catch (error) {
        console.error('💥 CREATE LISTING ERROR:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        logger_1.logger.error('Error in createListing:', error);
        res.status(500).json({
            success: false,
            message: 'İlan oluşturulurken bir hata oluştu',
            error: error.message || 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
exports.createListing = createListing;
const getListings = async (req, res) => {
    try {
        console.log('🔍 getListings called with query params:', req.query);
        const { page = 1, limit = 10, category_id, vehicle_type_id, brand_id, model_id, city_id, district_id, min_price, max_price, min_year, max_year, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            is_active: true,
            is_approved: true
        };
        console.log('🔍 Initial where clause:', where);
        if (category_id)
            where.category_id = category_id;
        if (vehicle_type_id)
            where.vehicle_type_id = vehicle_type_id;
        if (brand_id)
            where.brand_id = brand_id;
        if (model_id)
            where.model_id = model_id;
        if (city_id)
            where.city_id = city_id;
        if (district_id)
            where.district_id = district_id;
        if (min_price || max_price) {
            where.price = {};
            if (min_price)
                where.price.gte = Number(min_price);
            if (max_price)
                where.price.lte = Number(max_price);
        }
        if (min_year || max_year) {
            where.year = {};
            if (min_year)
                where.year.gte = Number(min_year);
            if (max_year)
                where.year.lte = Number(max_year);
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        const [listings, total] = await Promise.all([
            database_1.prisma.listings.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    price: true,
                    year: true,
                    km: true,
                    seller_name: true,
                    seller_phone: true,
                    seller_email: true,
                    created_at: true,
                    updated_at: true,
                    status: true,
                    is_active: true,
                    is_approved: true,
                    view_count: true,
                    images: true,
                    color: true,
                    fuel_type: true,
                    transmission: true,
                    engine_power: true,
                    engine_volume: true,
                    vehicle_condition: true,
                    is_exchangeable: true,
                    license_plate: true,
                    user_id: true,
                    categories: {
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
                    variants: {
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
                    listing_images: {
                        select: {
                            id: true,
                            url: true,
                            alt: true,
                            sort_order: true
                        }
                    },
                    users: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            phone: true
                        }
                    }
                },
                skip,
                take: Number(limit),
                orderBy: { created_at: 'desc' }
            }),
            database_1.prisma.listings.count({ where })
        ]);
        const responseData = {
            listings,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        };
        console.log('📋 About to send response - seller data check:');
        if (responseData.listings[0]) {
            console.log('  - seller_name:', responseData.listings[0].seller_name);
            console.log('  - seller_phone:', responseData.listings[0].seller_phone);
            console.log('  - users:', responseData.listings[0].users);
            console.log('  - categories:', responseData.listings[0].categories);
            console.log('🔍 FULL LISTING OBJECT:', JSON.stringify(responseData.listings[0], null, 2));
        }
        res.json(responseData);
    }
    catch (error) {
        logger_1.logger.error('Error fetching listings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getListings = getListings;
const debugListingData = async (req, res) => {
    try {
        const listings = await database_1.prisma.listings.findMany({
            where: {
                is_active: true,
                is_approved: true
            },
            select: {
                id: true,
                title: true,
                seller_name: true,
                seller_phone: true,
                seller_email: true,
                is_approved: true,
                is_active: true,
                created_at: true,
                users: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        phone: true
                    }
                }
            },
            take: 5
        });
        console.log('🔍 DEBUG: Active approved listings seller data:');
        listings.forEach((listing, index) => {
            console.log(`Listing ${index + 1}:`, {
                id: listing.id,
                title: listing.title,
                seller_name: listing.seller_name,
                seller_phone: listing.seller_phone,
                seller_email: listing.seller_email,
                user_data: listing.users ? {
                    name: `${listing.users.first_name} ${listing.users.last_name}`,
                    phone: listing.users.phone
                } : null,
                is_approved: listing.is_approved,
                created_at: listing.created_at
            });
        });
        res.json({
            success: true,
            listings: listings,
            message: 'Debug data retrieved'
        });
    }
    catch (error) {
        console.error('Debug endpoint error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.debugListingData = debugListingData;
const getListingById = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await database_1.prisma.listings.findUnique({
            where: { id },
            select: {
                id: true,
                user_id: true,
                title: true,
                description: true,
                price: true,
                year: true,
                km: true,
                seller_name: true,
                seller_phone: true,
                seller_email: true,
                created_at: true,
                updated_at: true,
                view_count: true,
                status: true,
                categories: {
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
                variants: {
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
                        phone: true
                    }
                },
                listing_images: {
                    select: {
                        id: true,
                        url: true,
                        alt: true,
                        sort_order: true
                    }
                }
            }
        });
        if (!listing) {
            res.status(404).json({ error: 'Listing not found' });
            return;
        }
        await database_1.prisma.listings.update({
            where: { id },
            data: { view_count: { increment: 1 } }
        });
        res.json(listing);
    }
    catch (error) {
        logger_1.logger.error('Error fetching listing:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getListingById = getListingById;
const updateListing = async (req, res) => {
    try {
        res.status(501).json({ error: 'Update listing endpoint not implemented yet' });
    }
    catch (error) {
        logger_1.logger.error('Error in updateListing:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateListing = updateListing;
const deleteListing = async (req, res) => {
    try {
        const listingId = req.params.id;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }
        if (!listingId) {
            res.status(400).json({
                success: false,
                message: 'Geçersiz ilan ID'
            });
            return;
        }
        const listing = await database_1.prisma.listings.findFirst({
            where: {
                id: listingId,
                user_id: userId
            }
        });
        if (!listing) {
            res.status(404).json({
                success: false,
                message: 'İlan bulunamadı veya size ait değil'
            });
            return;
        }
        await database_1.prisma.listing_images.deleteMany({
            where: {
                listing_id: listingId
            }
        });
        await database_1.prisma.listings.delete({
            where: {
                id: listingId
            }
        });
        res.json({
            success: true,
            message: 'İlan başarıyla silindi'
        });
    }
    catch (error) {
        logger_1.logger.error('Error in deleteListing:', error);
        res.status(500).json({
            success: false,
            message: 'İlan silinirken hata oluştu',
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};
exports.deleteListing = deleteListing;
const debugListingImages = async (req, res) => {
    try {
        const allImages = await database_1.prisma.listing_images.findMany({
            include: {
                listings: {
                    select: {
                        id: true,
                        title: true,
                        user_id: true
                    }
                }
            }
        });
        const allListings = await database_1.prisma.listings.findMany({
            select: {
                id: true,
                title: true,
                user_id: true,
                listing_images: {
                    select: {
                        id: true,
                        url: true,
                        sort_order: true
                    }
                }
            }
        });
        res.json({
            total_images: allImages.length,
            total_listings: allListings.length,
            images: allImages,
            listings_with_images: allListings
        });
    }
    catch (error) {
        logger_1.logger.error('Error in debugListingImages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.debugListingImages = debugListingImages;
const getUserListings = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const totalCount = await database_1.prisma.listings.count({
            where: {
                user_id: userId
            }
        });
        const listings = await database_1.prisma.listings.findMany({
            where: {
                user_id: userId
            },
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
                year: true,
                km: true,
                seller_phone: true,
                created_at: true,
                user_id: true,
                view_count: true,
                status: true,
                is_approved: true,
                images: true,
                listing_images: {
                    select: {
                        url: true,
                        sort_order: true
                    },
                    orderBy: {
                        sort_order: 'asc'
                    }
                },
                categories: {
                    select: {
                        name: true
                    }
                },
                vehicle_types: {
                    select: {
                        name: true
                    }
                },
                brands: {
                    select: {
                        name: true
                    }
                },
                models: {
                    select: {
                        name: true
                    }
                },
                cities: {
                    select: {
                        name: true
                    }
                },
                districts: {
                    select: {
                        name: true
                    }
                },
                users: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        phone: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            },
            skip,
            take: limit
        });
        console.log('🖼️ getUserListings - Raw listings from DB:', listings.length);
        if (listings.length > 0) {
            console.log('🖼️ First listing images field:', listings[0].images);
            console.log('🖼️ First listing_images relation:', listings[0].listing_images);
            console.log('🖼️ First listing raw:', JSON.stringify(listings[0], null, 2));
        }
        const transformedListings = listings.map(listing => ({
            id: listing.id.toString(),
            title: listing.title,
            description: listing.description,
            price: listing.price,
            year: listing.year,
            kilometers: listing.km || 0,
            km: listing.km || 0,
            seller_phone: listing.seller_phone,
            status: listing.status,
            is_approved: listing.is_approved,
            city_name: listing.cities?.name || '',
            district_name: listing.districts?.name || '',
            images: listing.images || listing.listing_images.map(img => img.url),
            listing_images: listing.listing_images.map(img => ({
                url: img.url,
                sort_order: img.sort_order
            })),
            created_at: listing.created_at.toISOString(),
            user_id: listing.user_id.toString(),
            view_count: listing.view_count || 0,
            categories: { name: listing.categories?.name || '' },
            vehicle_types: { name: listing.vehicle_types?.name || '' },
            brands: { name: listing.brands?.name || '' },
            models: { name: listing.models?.name || '' },
            cities: { name: listing.cities?.name || '' },
            districts: { name: listing.districts?.name || '' },
            users: listing.users ? {
                id: listing.users.id.toString(),
                first_name: listing.users.first_name,
                last_name: listing.users.last_name,
                phone: listing.users.phone
            } : null,
            category: { name: listing.categories?.name || '' },
            brand: { name: listing.brands?.name || '' },
            model: { name: listing.models?.name || '' },
            user: listing.users ? {
                first_name: listing.users.first_name,
                last_name: listing.users.last_name,
                phone: listing.users.phone
            } : { first_name: '', last_name: '', phone: '' }
        }));
        const totalPages = Math.ceil(totalCount / limit);
        res.json({
            success: true,
            data: {
                listings: transformedListings,
                pagination: {
                    page,
                    limit,
                    total: totalCount,
                    pages: totalPages
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error in getUserListings:', error);
        res.status(500).json({
            success: false,
            message: 'İlanlar yüklenirken hata oluştu',
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};
exports.getUserListings = getUserListings;
const toggleFavorite = async (req, res) => {
    try {
        res.status(501).json({ error: 'Toggle favorite endpoint not implemented yet' });
    }
    catch (error) {
        logger_1.logger.error('Error in toggleFavorite:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.toggleFavorite = toggleFavorite;
const getFavorites = async (req, res) => {
    try {
        res.status(501).json({ error: 'Get favorites endpoint not implemented yet' });
    }
    catch (error) {
        logger_1.logger.error('Error in getFavorites:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getFavorites = getFavorites;
//# sourceMappingURL=listingController.js.map