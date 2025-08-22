"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const listingController_1 = require("../controllers/listingController");
const auth_1 = require("../middleware/auth");
const normalizeMultipart_1 = require("../middleware/normalizeMultipart");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.get('/', listingController_1.getListings);
router.get('/debug', listingController_1.debugListingData);
router.get('/debug-images', listingController_1.debugListingImages);
router.use(auth_1.authMiddleware);
router.post('/', upload.fields([{ name: 'images', maxCount: 15 }]), normalizeMultipart_1.normalizeMultipartAndCoerce, listingController_1.createListing);
router.get('/my-listings', listingController_1.getUserListings);
router.get('/favorites', listingController_1.getFavorites);
router.get('/user/:userId', listingController_1.getUserListings);
router.post('/:id/favorite', listingController_1.toggleFavorite);
router.put('/:id', listingController_1.updateListing);
router.delete('/:id', listingController_1.deleteListing);
router.get('/:id', listingController_1.getListingById);
exports.default = router;
//# sourceMappingURL=listingRoutes.js.map