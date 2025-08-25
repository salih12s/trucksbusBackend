import { Router } from 'express';
import multer from 'multer';
import {
  getListings,
  getListingById,
  getListingDetails,
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
import { normalizeMultipartAndCoerce } from '../middleware/normalizeMultipart';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public routes
router.get('/', getListings);  // GET /api/listings
router.get('/debug', debugListingData);  // GET /api/listings/debug - Debug endpoint
router.get('/debug-images', debugListingImages);  // GET /api/listings/debug-images - Debug images

// Protected routes - authentication required BEFORE ID routes
router.use(authMiddleware);
router.get('/my-listings', getUserListings);  // GET /api/listings/my-listings - MOVED BEFORE ID routes
router.get('/favorites', getFavorites);  // GET /api/listings/favorites
router.get('/user/:userId', getUserListings);  // GET /api/listings/user/:userId (same as my-listings but with explicit user id)
router.post('/:id/favorite', toggleFavorite);  // POST /api/listings/:id/favorite

// POST route for creating listings
router.post(
  '/',
  upload.fields([{ name: 'images', maxCount: 15 }]), // hem dosyayı hem metni parse eder
  normalizeMultipartAndCoerce,                        // normalize middleware
  createListing
);  // POST /api/listings - Now requires authentication

// ID-based routes must be AFTER specific routes to avoid conflicts
router.get('/:id/details', getListingDetails);  // GET /api/listings/:id/details - Enhanced listing detail view
router.get('/:id', getListingById);  // GET /api/listings/:id - Public listing detail view
router.put('/:id', updateListing);  // PUT /api/listings/:id
router.delete('/:id', deleteListing);  // DELETE /api/listings/:id

export default router;
