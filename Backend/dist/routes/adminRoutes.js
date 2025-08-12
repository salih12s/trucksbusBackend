"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.use(auth_1.adminMiddleware);
router.get('/dashboard/stats', adminController_1.getDashboardStats);
router.get('/listings', adminController_1.getAdminListings);
router.put('/listings/:id/approve', adminController_1.approveListing);
router.put('/listings/:id/reject', adminController_1.rejectListing);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map