import { Router } from 'express';
import { getCities, getDistrictsByCity } from '../controllers/locationController';

const router = Router();

// Cities routes
router.get('/cities', getCities);
router.get('/cities/:cityId/districts', getDistrictsByCity);

export default router;
