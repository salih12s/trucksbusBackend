import express from 'express';
import { StoreController } from '../controllers/storeController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Tüm store route'ları auth gerektirir
router.use(authMiddleware);

// Store istatistikleri
router.get('/stats', StoreController.getStats);

// İlanları getir
router.get('/listings', StoreController.getListings);

// Son mesajlar
router.get('/messages', StoreController.getMessages);

// Profil tamamlama durumu
router.get('/profile-completion', StoreController.getProfileCompletion);

export default router;
