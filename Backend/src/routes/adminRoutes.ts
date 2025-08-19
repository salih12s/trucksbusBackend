import { Router } from 'express';
import {
  getListings,
  getPendingListings,
  approveListing,
  rejectListing,
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser
} from '../controllers/adminController';
import { ReportsController } from '../controllers/reportsController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Authentication and admin authorization required
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/dashboard/stats', getDashboardStats);
router.get('/listings', getListings);
router.get('/listings/pending', getPendingListings);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/listings/:id/approve', approveListing);
router.put('/listings/:id/reject', rejectListing);

// Reports routes
router.get('/reports', ReportsController.adminGetReports);
router.get('/reports/:id', ReportsController.adminGetReportDetail);
router.patch('/reports/:id/status', ReportsController.adminUpdateReportStatus);

export default router;
