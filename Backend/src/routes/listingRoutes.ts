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

// ID-based routes must be BEFORE auth middleware to avoid conflicts with named routes
router.get('/:id/details', getListingDetails);  // GET /api/listings/:id/details - Enhanced listing details for SmartTemplate (PUBLIC)
router.get('/:id', getListingById);  // GET /api/listings/:id - Public listing detail view

// Protected routes - authentication required
router.post(
  '/',
  authMiddleware,
  upload.fields([{ name: 'images', maxCount: 15 }]), // hem dosyayı hem metni parse eder
  normalizeMultipartAndCoerce,                        // normalize middleware
  createListing
);  // POST /api/listings - Now requires authentication
router.get('/my-listings', authMiddleware, getUserListings);  // GET /api/listings/my-listings
router.get('/favorites', authMiddleware, getFavorites);  // GET /api/listings/favorites
router.get('/user/:userId', authMiddleware, getUserListings);  // GET /api/listings/user/:userId (same as my-listings but with explicit user id)
router.post('/:id/favorite', authMiddleware, toggleFavorite);  // POST /api/listings/:id/favorite
router.put('/:id', authMiddleware, updateListing);  // PUT /api/listings/:id
router.delete('/:id', authMiddleware, deleteListing);  // DELETE /api/listings/:id

export default router;
