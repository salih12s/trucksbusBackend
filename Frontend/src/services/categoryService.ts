import axios from 'axios';

const API_BASE_URL = 'http://localhost:3005/api';

// API client with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('🌐 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  vehicle_types?: VehicleType[];
}

export interface VehicleType {
  id: string;
  name: string;
  category_id: string;
  image_url?: string;
  brands?: Brand[];
}

export interface Brand {
  id: string;
  name: string;
  vehicle_type_id: string;
  models?: Model[];
}

export interface Model {
  id: string;
  name: string;
  brand_id: string;
  variants?: Variant[];
}

export interface Variant {
  id: string;
  name: string;
  model_id: string;
}

// Category API methods
export const categoryService = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    try {
      console.log('📋 Fetching all categories...');
      const response = await apiClient.get('/categories');
      console.log('📋 Categories received:', response.data.length, 'items');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch categories:', error);
      throw error;
    }
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<Category> => {
    try {
      console.log('📋 Fetching category by ID:', id);
      const response = await apiClient.get(`/categories/${id}`);
      console.log('📋 Category received:', response.data.name);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch category:', error);
      throw error;
    }
  },

  // Get vehicle types by category
  getVehicleTypesByCategory: async (categoryId: string): Promise<VehicleType[]> => {
    try {
      console.log('🚗 Fetching vehicle types for category:', categoryId);
      const response = await apiClient.get(`/categories/${categoryId}/vehicle-types`);
      console.log('🚗 Vehicle types received:', response.data.length, 'items');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch vehicle types:', error);
      throw error;
    }
  },

  // Get all brands
  getAllBrands: async (): Promise<Brand[]> => {
    try {
      console.log('🏷️ Fetching all brands...');
      const response = await apiClient.get('/categories/brands/all');
      console.log('🏷️ Brands received:', response.data.length, 'items');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch brands:', error);
      throw error;
    }
  },

  // Get brands by vehicle type
  getBrandsByVehicleType: async (vehicleTypeId: string): Promise<Brand[]> => {
    try {
      console.log('🏷️ Fetching brands for vehicle type:', vehicleTypeId);
      const response = await apiClient.get(`/categories/vehicle-types/${vehicleTypeId}/brands`);
      console.log('🏷️ Brands received:', response.data.length, 'items');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch brands:', error);
      throw error;
    }
  },

  // Get models by brand
  getModelsByBrand: async (brandId: string): Promise<Model[]> => {
    try {
      console.log('🚙 Fetching models for brand:', brandId);
      const response = await apiClient.get(`/categories/brands/${brandId}/models`);
      console.log('🚙 Models received:', response.data.length, 'items');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch models:', error);
      throw error;
    }
  },

  // Get variants by model
  getVariantsByModel: async (modelId: string): Promise<Variant[]> => {
    try {
      console.log('⚙️ Fetching variants for model:', modelId);
      const response = await apiClient.get(`/categories/models/${modelId}/variants`);
      console.log('⚙️ Variants received:', response.data.length, 'items');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch variants:', error);
      throw error;
    }
  }
};

export default categoryService;
