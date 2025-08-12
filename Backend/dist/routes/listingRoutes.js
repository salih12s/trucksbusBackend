"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const listingController_1 = require("../controllers/listingController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/listings', listingController_1.getListings);
router.get('/listings/:id', listingController_1.getListingById);
router.get('/categories', listingController_1.getCategories);
router.get('/vehicle-types', listingController_1.getVehicleTypes);
router.get('/brands', listingController_1.getBrands);
router.use(auth_1.authMiddleware);
router.post('/listings', listingController_1.createListing);
router.put('/listings/:id', listingController_1.updateListing);
router.delete('/listings/:id', listingController_1.deleteListing);
router.get('/my-listings', listingController_1.getUserListings);
exports.default = router;
//# sourceMappingURL=listingRoutes.js.map