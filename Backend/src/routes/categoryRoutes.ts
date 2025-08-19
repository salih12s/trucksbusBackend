import { Router } from 'express';
import {
  getCategories,
  getVehicleTypes,
  getBrands,
  getModels,
  getVariants
} from '../controllers/categoryController';

const router = Router();

// Ana kategorileri getir
router.get('/', getCategories);

// Kategori ID'ye göre vehicle type'ları getir
router.get('/:categoryId/vehicle-types', getVehicleTypes);

// Tüm vehicle type'ları getir
router.get('/vehicle-types', getVehicleTypes);

// Tüm markaları getir
router.get('/brands/all', getBrands);

// Query parametreli markalar (Frontend'in beklediği format)
router.get('/brands', getBrands);

// Vehicle type ID'ye göre markaları getir
router.get('/vehicle-types/:vehicleTypeId/brands', getBrands);

// Query parametreli modeller (Frontend'in beklediği format)
router.get('/models', getModels);

// Brand ID'ye göre modelleri getir
router.get('/brands/:brandId/models', getModels);

// Query parametreli variants (Frontend'in beklediği format)
router.get('/variants', getVariants);

// Model ID'ye göre varyantları getir
router.get('/models/:modelId/variants', getVariants);

export default router;
