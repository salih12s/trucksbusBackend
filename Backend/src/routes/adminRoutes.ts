import { Router } from 'express';
import {
  getAdminListings,
  approveListing,
  rejectListing,
  getDashboardStats
} from '../controllers/adminController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/dashboard/stats', getDashboardStats);
router.get('/listings', getAdminListings);
router.put('/listings/:id/approve', approveListing);
router.put('/listings/:id/reject', rejectListing);

export default router;
