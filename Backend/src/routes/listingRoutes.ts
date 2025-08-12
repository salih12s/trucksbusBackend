import { Router } from 'express';
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getUserListings,
  getCategories,
  getVehicleTypes,
  getBrands
} from '../controllers/listingController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/listings', getListings);
router.get('/listings/:id', getListingById);
router.get('/categories', getCategories);
router.get('/vehicle-types', getVehicleTypes);
router.get('/brands', getBrands);

// Protected routes
router.use(authMiddleware);
router.post('/listings', createListing);
router.put('/listings/:id', updateListing);
router.delete('/listings/:id', deleteListing);
router.get('/my-listings', getUserListings);

export default router;
