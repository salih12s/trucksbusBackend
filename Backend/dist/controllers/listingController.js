"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrands = exports.getVehicleTypes = exports.getCategories = exports.getUserListings = exports.deleteListing = exports.updateListing = exports.createListing = exports.getListingById = exports.getListings = void 0;
const database_1 = require("../utils/database");
const logger_1 = require("../utils/logger");
const getListings = async (req, res) => {
    try {
        const { page = 1, limit = 12, category_id, vehicle_type_id, brand_id, model_id, city_id, min_price, max_price, min_year, max_year, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const where = {
            status: 'ACTIVE',
            is_active: true,
            is_approved: true,
        };
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
                    vehicle_types: true,
                    brands: true,
                    models: true,
                    cities: true,
                    districts: true,
                    listing_images: {
                        orderBy: { sort_order: 'asc' }
                    },
                    users: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
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
        logger_1.logger.error('Get listings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getListings = getListings;
const getListingById = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await database_1.prisma.listing.findUnique({
            where: { id },
            include: {
                categories: true,
                vehicle_types: true,
                brands: true,
                models: true,
                variants: true,
                cities: true,
                districts: true,
                listing_images: {
                    orderBy: { sort_order: 'asc' }
                },
                listing_properties: true,
                users: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        phone: true,
                        created_at: true
                    }
                }
            }
        });
        if (!listing) {
            res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
            return;
        }
        await database_1.prisma.listing.update({
            where: { id },
            data: { view_count: { increment: 1 } }
        });
        res.status(200).json({
            success: true,
            data: { listing }
        });
    }
    catch (error) {
        logger_1.logger.error('Get listing by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getListingById = getListingById;
const createListing = async (req, res) => {
    try {
        const { title, description, price, year, category_id, vehicle_type_id, brand_id, model_id, variant_id, city_id, district_id, seller_name, seller_phone, seller_email, color, engine_power, engine_volume, fuel_type, is_exchangeable, km, license_plate, transmission, vehicle_condition, images = [] } = req.body;
        const listing = await database_1.prisma.listing.create({
            data: {
                title,
                description,
                price: Number(price),
                year: Number(year),
                category_id,
                vehicle_type_id,
                brand_id,
                model_id,
                variant_id,
                city_id,
                district_id,
                seller_name,
                seller_phone,
                seller_email,
                color,
                engine_power,
                engine_volume,
                fuel_type,
                is_exchangeable: Boolean(is_exchangeable),
                km: km ? Number(km) : null,
                license_plate,
                transmission,
                vehicle_condition,
                user_id: req.user.id,
                status: 'PENDING',
                is_pending: true,
                updated_at: new Date(),
                listing_images: {
                    create: images.map((img, index) => ({
                        image_url: img.url,
                        sort_order: index
                    }))
                }
            },
            include: {
                categories: true,
                vehicle_types: true,
                brands: true,
                models: true,
                listing_images: true
            }
        });
        logger_1.logger.info(`Listing created: ${listing.id} by user: ${req.user.id}`);
        res.status(201).json({
            success: true,
            message: 'Listing created successfully',
            data: { listing }
        });
    }
    catch (error) {
        logger_1.logger.error('Create listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.createListing = createListing;
const updateListing = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const existingListing = await database_1.prisma.listing.findUnique({
            where: { id },
            select: { user_id: true, status: true }
        });
        if (!existingListing) {
            res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
            return;
        }
        if (existingListing.user_id !== req.user.id) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to update this listing'
            });
            return;
        }
        const listing = await database_1.prisma.listing.update({
            where: { id },
            data: {
                ...updateData,
                updated_at: new Date()
            },
            include: {
                categories: true,
                vehicle_types: true,
                brands: true,
                models: true,
                listing_images: true
            }
        });
        logger_1.logger.info(`Listing updated: ${listing.id} by user: ${req.user.id}`);
        res.status(200).json({
            success: true,
            message: 'Listing updated successfully',
            data: { listing }
        });
    }
    catch (error) {
        logger_1.logger.error('Update listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.updateListing = updateListing;
const deleteListing = async (req, res) => {
    try {
        const { id } = req.params;
        const existingListing = await database_1.prisma.listing.findUnique({
            where: { id },
            select: { user_id: true }
        });
        if (!existingListing) {
            res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
            return;
        }
        if (existingListing.user_id !== req.user.id) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to delete this listing'
            });
            return;
        }
        await database_1.prisma.listing.delete({
            where: { id }
        });
        logger_1.logger.info(`Listing deleted: ${id} by user: ${req.user.id}`);
        res.status(200).json({
            success: true,
            message: 'Listing deleted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Delete listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.deleteListing = deleteListing;
const getUserListings = async (req, res) => {
    try {
        const { page = 1, limit = 12, status } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const where = {
            user_id: req.user.id
        };
        if (status)
            where.status = status;
        const [listings, total] = await Promise.all([
            database_1.prisma.listing.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip: offset,
                take: Number(limit),
                include: {
                    categories: true,
                    vehicle_types: true,
                    brands: true,
                    models: true,
                    listing_images: {
                        orderBy: { sort_order: 'asc' },
                        take: 1
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
        logger_1.logger.error('Get user listings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getUserListings = getUserListings;
const getCategories = async (req, res) => {
    try {
        const categories = await database_1.prisma.category.findMany({
            select: {
                id: true,
                name: true,
                description: true
            },
            orderBy: { name: 'asc' }
        });
        res.status(200).json({
            success: true,
            data: { categories }
        });
    }
    catch (error) {
        logger_1.logger.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getCategories = getCategories;
const getVehicleTypes = async (req, res) => {
    try {
        const vehicleTypes = await database_1.prisma.vehicle_types.findMany({
            select: {
                id: true,
                name: true,
                image_url: true
            },
            orderBy: { name: 'asc' }
        });
        res.status(200).json({
            success: true,
            data: { vehicleTypes }
        });
    }
    catch (error) {
        logger_1.logger.error('Get vehicle types error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getVehicleTypes = getVehicleTypes;
const getBrands = async (req, res) => {
    try {
        const brands = await database_1.prisma.brands.findMany({
            select: {
                id: true,
                name: true,
                image_url: true
            },
            orderBy: { name: 'asc' }
        });
        res.status(200).json({
            success: true,
            data: { brands }
        });
    }
    catch (error) {
        logger_1.logger.error('Get brands error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getBrands = getBrands;
//# sourceMappingURL=listingController.js.map