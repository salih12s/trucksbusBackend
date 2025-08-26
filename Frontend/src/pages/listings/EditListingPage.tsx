import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';

interface ListingData {
  id: string;
  title: string;
  description: string;
  price: number;
  year: number;
  km: number;
  category_id: string;
  vehicle_type_id: string;
  brand_id: string;
  model_id: string;
  variant_id: string;
  user_id: string;
  // İlişki tabloları
  categories?: { name: string; slug: string };
  vehicle_types?: { name: string; slug: string };
  brands?: { name: string; slug: string };
  models?: { name: string; slug: string };
  variants?: { name: string; slug: string };
}

const EditListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showErrorNotification } = useNotification();
  
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

        // Dinamik form route'una yönlendir
        const editRoute = buildEditRoute(listing);
        if (editRoute) {
          // İlan verisini localStorage'a kaydet (form'da kullanılmak üzere)
          localStorage.setItem(`edit_listing_${id}`, JSON.stringify(listing));
          navigate(editRoute);
        } else {
          setError('Bu ilan tipi için düzenleme sayfası henüz mevcut değil.');
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
      showErrorNotification(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const buildEditRoute = (listing: ListingData): string | null => {
    const categorySlug = listing.categories?.slug;
    const vehicleTypeSlug = listing.vehicle_types?.slug;
    const variantId = listing.variant_id;

    console.log('🔧 Building edit route:', {
      categorySlug,
      vehicleTypeSlug,
      variantId,
      listing
    });

    if (!categorySlug || !variantId) {
      return null;
    }

    // Ana araç tipleri için basit route'lar
    if (categorySlug === 'minibus' || categorySlug === 'midibus') {
      return `/create-ad/minibus/${variantId}?edit=${listing.id}`;
    }
    if (categorySlug === 'otobus') {
      return `/create-ad/otobus/${variantId}?edit=${listing.id}`;
    }
    if (categorySlug === 'kamyon' || categorySlug === 'kamyonet') {
      return `/create-ad/kamyon/${variantId}?edit=${listing.id}`;
    }
    if (categorySlug === 'cekici') {
      return `/create-ad/cekici/${variantId}?edit=${listing.id}`;
    }

    // Dorse için detaylı routing
    if (categorySlug === 'dorse') {
      const vehicleType = vehicleTypeSlug;
      
      // Damperli Dorse
      if (vehicleType === 'damperli') {
        const variantName = listing.variants?.name?.toLowerCase() || '';
        if (variantName.includes('kapakli') || variantName.includes('kapaklı')) {
          return `/create-ad/dorse/damperli/kapakli-tip/${variantId}?edit=${listing.id}`;
        }
        if (variantName.includes('hafriyat')) {
          return `/create-ad/dorse/damperli/hafriyat-tipi/${variantId}?edit=${listing.id}`;
        }
        if (variantName.includes('havuz') || variantName.includes('hardox')) {
          return `/create-ad/dorse/damperli/havuz-hardox-tipi/${variantId}?edit=${listing.id}`;
        }
        if (variantName.includes('kaya')) {
          return `/create-ad/dorse/damperli/kaya-tipi/${variantId}?edit=${listing.id}`;
        }
      }
      
      // Frigofirik Dorse
      if (vehicleType === 'frigofirik') {
        return `/create-ad/dorse/frigofirik/${variantId}?edit=${listing.id}`;
      }
      
      // Tenteli Dorse
      if (vehicleType === 'tenteli') {
        const variantName = listing.variants?.name?.toLowerCase() || '';
        if (variantName.includes('pilot')) {
          return `/create-ad/dorse/tenteli/pilot/${variantId}?edit=${listing.id}`;
        }
        if (variantName.includes('midilli') && variantName.includes('yari')) {
          return `/create-ad/dorse/tenteli/yari-midilli/${variantId}?edit=${listing.id}`;
        }
        if (variantName.includes('midilli')) {
          return `/create-ad/dorse/tenteli/midilli/${variantId}?edit=${listing.id}`;
        }
      }
      
      // Tanker
      if (vehicleType === 'tanker') {
        return `/create-ad/dorse/tanker/${variantId}?edit=${listing.id}`;
      }
      
      // Tekstil
      if (vehicleType === 'tekstil') {
        return `/create-ad/dorse/tekstil/${variantId}?edit=${listing.id}`;
      }
      
      // Silobas
      if (vehicleType === 'silobas') {
        return `/create-ad/dorse/silobas/${variantId}?edit=${listing.id}`;
      }
    }

    // Römork için routing
    if (categorySlug === 'romork') {
      const vehicleType = vehicleTypeSlug;
      
      if (vehicleType === 'tasima-romorklari') {
        const variantName = listing.variants?.name?.toLowerCase() || '';
        if (variantName.includes('boru')) {
          return `/create-ad/romork/tasima-romorklari-boru/${variantId}?edit=${listing.id}`;
        }
        if (variantName.includes('frigo')) {
          return `/create-ad/romork/tasima-romorklari-frigo/${variantId}?edit=${listing.id}`;
        }
        if (variantName.includes('hayvan')) {
          return `/create-ad/romork/tasima-romorklari-hayvan/${variantId}?edit=${listing.id}`;
        }
        // Diğer römork tipleri...
      }
    }

    // Karoser & Üst Yapı
    if (categorySlug === 'karoser' || categorySlug === 'ustyapi') {
      return `/create-ad/karoser/${variantId}?edit=${listing.id}`;
    }

    // Oto Kurtarıcı
    if (categorySlug === 'kurtarici' || categorySlug === 'tasiyici') {
      const variantName = listing.variants?.name?.toLowerCase() || '';
      if (variantName.includes('tekli')) {
        return `/create-ad/kurtarici/tekli-arac/${variantId}?edit=${listing.id}`;
      }
      if (variantName.includes('coklu') || variantName.includes('çoklu')) {
        return `/create-ad/kurtarici/coklu-arac/${variantId}?edit=${listing.id}`;
      }
    }

    return null;
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px">
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>İlan verileri yükleniyor...</Typography>
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
      <Typography variant="h6" color="text.secondary">
        Yönlendiriliyor...
      </Typography>
    </Container>
  );
};

export default EditListingPage;
