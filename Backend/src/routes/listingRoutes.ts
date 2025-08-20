import { Router } from 'express';
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getUserListings,
  toggleFavorite,
  getFavorites,
  debugListingData,
  debugListingImages
} from '../controllers/listingController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getListings);  // GET /api/listings
router.get('/debug', debugListingData);  // GET /api/listings/debug - Debug endpoint
router.get('/debug-images', debugListingImages);  // GET /api/listings/debug-images - Debug images

// Protected routes - authentication required
router.use(authMiddleware);
router.post('/', createListing);  // POST /api/listings - Now requires authentication
router.get('/my-listings', getUserListings);  // GET /api/listings/my-listings
router.get('/favorites', getFavorites);  // GET /api/listings/favorites
router.get('/user/:userId', getUserListings);  // GET /api/listings/user/:userId (same as my-listings but with explicit user id)
router.post('/:id/favorite', toggleFavorite);  // POST /api/listings/:id/favorite
router.put('/:id', updateListing);  // PUT /api/listings/:id
router.delete('/:id', deleteListing);  // DELETE /api/listings/:id

// ID-based routes must be LAST to avoid conflicts with named routes
router.get('/:id', getListingById);  // GET /api/listings/:id - Public listing detail view

export default router;
