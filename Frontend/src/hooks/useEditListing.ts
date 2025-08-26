import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

/**
 * İlan düzenleme için ortak hook
 * URL'de ?edit=listingId parametresi varsa, o ilanın verilerini yükler
 */
export const useEditListing = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  const [editData, setEditData] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && editId) {
      fetchEditData();
    }
  }, [isEditMode, editId]);

  const fetchEditData = async () => {
    try {
      setEditLoading(true);
      setEditError(null);

      const response = await api.get(`/listings/${editId}`);
      
      if (response.data.success) {
        const listingData = response.data.data;
        setEditData(listingData);
        console.log('📝 Edit mode - Loaded listing data:', listingData);
      } else {
        throw new Error(response.data.message || 'İlan bulunamadı');
      }
    } catch (error: any) {
      console.error('Error fetching edit data:', error);
      setEditError(error.response?.data?.message || 'İlan yüklenirken hata oluştu');
    } finally {
      setEditLoading(false);
    }
  };

  /**
   * Form verilerini edit datasıyla doldurur
   */
  const fillFormWithEditData = (setFormData: (data: any) => void) => {
    if (!editData) return;

    console.log('🔄 Filling form with edit data:', editData);

    // Temel alanları doldur
    const baseFormData = {
      // Temel bilgiler
      title: editData.title || '',
      description: editData.description || '',
      price: editData.price || 0,
      year: editData.year || new Date().getFullYear(),
      km: editData.km || 0,
      
      // Lokasyon
      city_id: editData.city_id || '',
      district_id: editData.district_id || '',
      
      // Kategori bilgileri
      category_id: editData.category_id || '',
      vehicle_type_id: editData.vehicle_type_id || '',
      brand_id: editData.brand_id || '',
      model_id: editData.model_id || '',
      variant_id: editData.variant_id || '',
      
      // Araç detayları
      color: editData.color || '',
      fuel_type: editData.fuel_type || '',
      transmission: editData.transmission || '',
      engine_power: editData.engine_power || '',
      engine_volume: editData.engine_volume || '',
      vehicle_condition: editData.vehicle_condition || '',
      is_exchangeable: editData.is_exchangeable || false,
      
      // Özel özellikler (JSON'dan parse et)
      custom_fields: editData.custom_fields ? JSON.parse(editData.custom_fields) : {},
      
      // Resimler
      existing_images: editData.listing_images || [],
    };

    setFormData(baseFormData);
  };

  return {
    isEditMode,
    editId,
    editData,
    editLoading,
    editError,
    fillFormWithEditData
  };
};
