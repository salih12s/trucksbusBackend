import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  getVehicleTypesByCategory,
  getBrands,
  getBrandsByVehicleType,
  getModelsByBrand,
  getVariantsByModel,
  getAllVehicleTypes
} from '../controllers/categoryController';

const router = Router();

// Ana kategorileri getir
router.get('/', getCategories);

// Tüm vehicle type'ları getir
router.get('/vehicle-types/all', getAllVehicleTypes);

// Belirli bir kategoriyi getir
router.get('/:id', getCategoryById);

// Kategoriye ait vehicle type'ları getir
router.get('/:categoryId/vehicle-types', getVehicleTypesByCategory);

// Tüm markaları getir
router.get('/brands/all', getBrands);

// Vehicle type'a ait markaları getir
router.get('/vehicle-types/:vehicleTypeId/brands', getBrandsByVehicleType);

// Markaya ait modelleri getir
router.get('/brands/:brandId/models', getModelsByBrand);

// Modele ait varyantları getir
router.get('/models/:modelId/variants', getVariantsByModel);

export default router;
