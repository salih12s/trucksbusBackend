import { Router } from 'express';
import { getCities, getDistrictsByCity } from '../controllers/locationController';

const router = Router();

// Cities routes - Frontend filtreleme için
router.get('/cities', getCities);
router.get('/', getCities); // Kısa yol için

// Districts routes - Frontend filtreleme için  
router.get('/districts', getDistrictsByCity);
router.get('/cities/:cityId/districts', getDistrictsByCity);

export default router;
