// Location service for cities and districts
export interface City {
  id: string;
  name: string;
  plate_code: string;
  created_at?: string;
  updated_at?: string;
}

export interface District {
  id: string;
  name: string;
  city_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface LocationApiResponse {
  success: boolean;
  data: City[] | District[];
  count: number;
}

class LocationService {
  private baseURL = import.meta.env.VITE_API_BASE_URL || 'https://trucksbusbackend-production-0e23.up.railway.app/api';

  async getCities(): Promise<City[]> {
    try {
      console.log('🏙️ LocationService: Şehirler getiriliyor...');
      const response = await fetch(`${this.baseURL}/locations/cities`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: City[] = await response.json();
      console.log('🏙️ LocationService: API yanıtı:', data.length, 'şehir');
      
      if (Array.isArray(data)) {
        return data;
      }
      
      console.warn('⚠️ LocationService: Beklenmeyen API yanıtı formatı');
      return [];
    } catch (error) {
      console.error('❌ LocationService: Şehirler getirilemedi:', error);
      throw error;
    }
  }

  async getDistrictsByCity(cityId: string): Promise<District[]> {
    try {
      console.log('🏘️ LocationService: İlçeler getiriliyor, cityId:', cityId);
      const response = await fetch(`${this.baseURL}/locations/cities/${cityId}/districts`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: District[] = await response.json();
      console.log('🏘️ LocationService: API yanıtı:', data.length, 'ilçe');
      
      if (Array.isArray(data)) {
        return data;
      }
      
      console.warn('⚠️ LocationService: Beklenmeyen API yanıtı formatı');
      return [];
    } catch (error) {
      console.error('❌ LocationService: İlçeler getirilemedi:', error);
      throw error;
    }
  }
}

export const locationService = new LocationService();
