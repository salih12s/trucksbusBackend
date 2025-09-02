import axios from 'axios';
import { Listing, CreateListingData, UpdateListingData } from '../types';
import { ApiResponse, StandardListingPayload, validateListingPayload} from './apiNormalizer';

// Use the same base URL as other services (Local development)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export interface ListingSearchParams {
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Helper function to get token from both storage types
const getStoredToken = () =>
  localStorage.getItem('token') || sessionStorage.getItem('token');

const listingApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

// Request interceptor to add auth token
listingApi.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🎟️ Token added to listing request:', config.url);
    } else {
      console.log('⚠️ No token found for listing request:', config.url);
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

export const listingService = {
  // Get all listings with pagination and filters
  getListings: async (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    userId?: string;
    status?: string;
  }) => {
    const response = await listingApi.get('/listings', { params });
    return response.data;
  },

  // Get single listing by ID with full details
  getListingById: async (id: string): Promise<Listing> => {
    const response = await listingApi.get(`/listings/${id}`);
    return response.data;
  },

  // Get user's own listings
  getMyListings: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await listingApi.get('/listings/my-listings', { params });
    return response.data;
  },

  // Create new listing with standardized payload
  createListing: async (data: CreateListingData): Promise<ApiResponse<any>> => {
    const response = await listingApi.post('/listings', data);
    return response.data;
  },

  // Create listing with standardized validation
  createStandardListing: async (payload: StandardListingPayload): Promise<ApiResponse<any>> => {
    // Validate payload first
    const validation = validateListingPayload(payload);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    const response = await listingApi.post('/listings', payload);
    return response.data;
  },

  // Update listing with standardized validation
  updateStandardListing: async (listingId: string, payload: StandardListingPayload): Promise<ApiResponse<any>> => {
    // Validate payload first
    const validation = validateListingPayload(payload);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    console.log('📤 Updating standard listing with ID:', listingId, 'payload:', payload);
    const response = await listingApi.put(`/listings/${listingId}`, payload);
    return response.data;
  },

  // Update listing
  updateListing: async (id: string, data: UpdateListingData): Promise<Listing> => {
    const response = await listingApi.put(`/listings/${id}`, data);
    return response.data;
  },

  // Delete listing
  deleteListing: async (id: string): Promise<void> => {
    await listingApi.delete(`/listings/${id}`);
  },

  // Upload listing images
  uploadListingImages: async (listingId: string, files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append(`images`, file);
    });

    const response = await listingApi.post(`/listings/${listingId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.imageUrls;
  },

  // Delete listing image
  deleteListingImage: async (listingId: string, imageUrl: string): Promise<void> => {
    await listingApi.delete(`/listings/${listingId}/images`, {
      data: { imageUrl },
    });
  },

  // Get listings by category
  getListingsByCategory: async (categoryId: string, params?: {
    page?: number;
    limit?: number;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    const response = await listingApi.get(`/listings/category/${categoryId}`, { params });
    return response.data;
  },

  // Search listings
  searchListings: async (query: string, params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    const response = await listingApi.get('/listings/search', { 
      params: { q: query, ...params } 
    });
    return response.data;
  },

  // Toggle favorite status
  toggleFavorite: async (listingId: string): Promise<{ isFavorite: boolean }> => {
    const response = await listingApi.post(`/listings/${listingId}/favorite`);
    return response.data;
  },

  // Get favorite status
  getFavoriteStatus: async (listingId: string): Promise<{ isFavorite: boolean }> => {
    const response = await listingApi.get(`/listings/${listingId}/favorite-status`);
    return response.data;
  },

  // Report listing
  reportListing: async (listingId: string, reason: string, description?: string) => {
    const response = await listingApi.post(`/listings/${listingId}/report`, {
      reason,
      description,
    });
    return response.data;
  },
};

export default listingService;
