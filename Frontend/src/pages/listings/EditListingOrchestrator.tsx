import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, CircularProgress, Alert, Box } from '@mui/material';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface ListingData {
  id: string;
  category_id: string;
  vehicle_type_id: string;
  brand_id: string;
  model_id: string;
  variant_id: string;
  user_id: string;
  // Kategori bilgileri
  categories: {
    name: string;
    slug: string;
  };
  vehicle_types: {
    name: string;
    slug: string;
  };
  brands: {
    name: string;
    slug: string;
  };
  models: {
    name: string;
    slug: string;
  };
  variants: {
    name: string;
    slug: string;
  };
}

/**
 * Edit Listing Orchestrator
 * İlanın tipine göre doğru form sayfasına yönlendirir
 */
const EditListingOrchestrator: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    if (id) {
      fetchListingAndRedirect();
    }
  }, [id, user]);

  const fetchListingAndRedirect = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/listings/${id}`);
      
      if (response.data.success) {
        const listing: ListingData = response.data.data;
        
        // Kullanıcının kendi ilanı mı kontrol et
        if (listing.user_id !== user?.id) {
          setError('Bu ilanı düzenleme yetkiniz yok.');
          return;
        }

        // Form URL'sini oluştur
        const formUrl = buildFormUrl(listing);
        
        if (formUrl) {
          // Edit parametresi ile form sayfasına yönlendir
          navigate(`${formUrl}?edit=${id}`);
        } else {
          setError('Bu ilan tipi için düzenleme henüz desteklenmiyor.');
        }
      } else {
        throw new Error(response.data.message || 'İlan bulunamadı');
      }
    } catch (error: any) {
      console.error('Error fetching listing:', error);
      const errorMessage = error.response?.status === 404 
        ? 'İlan bulunamadı' 
        : 'İlan yüklenirken hata oluştu';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * İlan tipine göre form URL'sini oluşturur
   */
  const buildFormUrl = (listing: ListingData): string | null => {
    const categorySlug = listing.categories.slug;
    const vehicleTypeSlug = listing.vehicle_types?.slug;
    const variantSlug = listing.variants?.slug;
    const variantId = listing.variant_id;

    // Ana kategori formları
    switch (categorySlug) {
      case 'minibus':
        return `/create-ad/minibus/${variantId}`;
      
      case 'kamyon':
        return `/create-ad/kamyon/${variantId}`;
      
      case 'otobus':
        return `/create-ad/otobus/${variantId}`;
      
      case 'cekici':
        return `/create-ad/cekici/${variantId}`;
      
      case 'dorse':
        // Dorse alt kategorileri
        return buildDorseFormUrl(vehicleTypeSlug, variantSlug, variantId);
      
      case 'romork':
        // Römork alt kategorileri  
        return buildRomorkFormUrl(vehicleTypeSlug, variantSlug, variantId);
      
      case 'karoser':
        // Karoser alt kategorileri
        return buildKaroserFormUrl(vehicleTypeSlug, variantSlug, variantId);
      
      case 'kurtarici':
        // Kurtarıcı alt kategorileri
        return buildKurtariciFormUrl(vehicleTypeSlug, variantSlug, variantId);
      
      default:
        return null;
    }
  };

  const buildDorseFormUrl = (vehicleTypeSlug: string, variantSlug: string, variantId: string): string | null => {
    // Dorse form URL'leri
    const dorseRoutes: Record<string, Record<string, string>> = {
      'damperli': {
        'kapakli-tip': `/create-ad/dorse/damperli/kapakli-tip/${variantId}`,
        'hafriyat-tipi': `/create-ad/dorse/damperli/hafriyat-tipi/${variantId}`,
        'havuz-hardox-tipi': `/create-ad/dorse/damperli/havuz-hardox-tipi/${variantId}`,
        'kaya-tipi': `/create-ad/dorse/damperli/kaya-tipi/${variantId}`,
      },
      'frigofirik': {
        'default': `/create-ad/dorse/frigofirik/${variantId}`,
      },
      'lowbed': {
        'havuzlu': `/create-ad/dorse/lowbed/havuzlu/${variantId}`,
        'ondekirmalı': `/create-ad/dorse/lowbed/ondekirmalı/${variantId}`,
      },
      'kuruyuk': {
        'kapakli': `/create-ad/dorse/kuruyuk/kapakli/${variantId}`,
        'kapakli-kaya-tipi': `/create-ad/dorse/kuruyuk/kapakli-kaya-tipi/${variantId}`,
        'kapaksiz-platform': `/create-ad/dorse/kuruyuk/kapaksiz-platform/${variantId}`,
      },
      'tenteli': {
        'pilot': `/create-ad/dorse/tenteli/pilot/${variantId}`,
        'midilli': `/create-ad/dorse/tenteli/midilli/${variantId}`,
        'yari-midilli': `/create-ad/dorse/tenteli/yari-midilli/${variantId}`,
      },
      'tanker': {
        'default': `/create-ad/dorse/tanker/${variantId}`,
      },
      'tekstil': {
        'default': `/create-ad/dorse/tekstil/${variantId}`,
      },
      'silobas': {
        'default': `/create-ad/dorse/silobas/${variantId}`,
      },
      'damper-sasi': {
        'default': `/create-ad/dorse/damper-sasi/${variantId}`,
      },
    };

    const typeRoutes = dorseRoutes[vehicleTypeSlug];
    if (!typeRoutes) return null;

    return typeRoutes[variantSlug] || typeRoutes['default'] || null;
  };

  const buildRomorkFormUrl = (vehicleTypeSlug: string, variantSlug: string, variantId: string): string | null => {
    // Römork form URL'leri (gerektiğinde eklenecek)
    return null;
  };

  const buildKaroserFormUrl = (vehicleTypeSlug: string, variantSlug: string, variantId: string): string | null => {
    // Karoser form URL'leri (gerektiğinde eklenecek)
    return null;
  };

  const buildKurtariciFormUrl = (vehicleTypeSlug: string, variantSlug: string, variantId: string): string | null => {
    // Kurtarıcı form URL'leri (gerektiğinde eklenecek)
    return null;
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    </Container>
  );
};

export default EditListingOrchestrator;
