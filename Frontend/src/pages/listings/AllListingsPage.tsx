import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import TruckCenterCard from '../../components/cards/TruckCenterCard';
import ReportModal from '../../components/ReportModal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';

interface Listing {
  id: string;
  title: string;
  price: number;
  year: number;
  km?: number;
  kilometers: number;
  city_name: string;
  district_name: string;
  description: string;
  images: string[];
  created_at: string;
  seller_phone?: string;
  // Backend'den gelen relation'lar
  categories?: {
    name: string;
  };
  vehicle_types?: {
    name: string;
  };
  brands?: {
    name: string;
  };
  models?: {
    name: string;
  };
  cities?: {
    name: string;
  };
  districts?: {
    name: string;
  };
  users?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
  listing_images?: Array<{
    url: string;
    alt?: string;
    sort_order: number;
  }>;
  // Eski formatla uyumluluk için
  category: {
    name: string;
  };
  brand: {
    name: string;
  };
  model: {
    name: string;
  };
  user: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  views?: number;
  isFavorite?: boolean;
}

interface ListingsResponse {
  listings: Listing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const AllListingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showErrorNotification } = useNotification();
  const navigate = useNavigate();
  const [rawListings, setRawListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 12;

  // Report modal state
  const [reportModal, setReportModal] = useState<{
    open: boolean;
    listingId?: string;
    listingTitle?: string;
  }>({ open: false });

  // Memoized transform function
  const transformListing = useCallback((listing: any) => {
    // Data validation - prevent undefined/null listings
    if (!listing || typeof listing !== 'object') {
      console.error('❌ Invalid listing object:', listing);
      return null;
    }
    
    if (!listing.id) {
      console.error('❌ Listing missing ID:', listing);
      return null;
    }
    
    console.log('🔍 Transforming listing:', listing.id, 'created_at:', listing.created_at);
    const getValidDate = (dateValue: any) => {
      if (!dateValue) return new Date();
      
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Invalid date value:', dateValue, 'using current date');
        return new Date();
      }
      return date;
    };
    
    // Resim kaynaklarını birleştir
    const images = [];
    
    // listing_images tablosundan resimleri al
    if (listing.listing_images && Array.isArray(listing.listing_images)) {
      images.push(...listing.listing_images.map((img: any) => img.url));
    }
    
    // JSON images alanından resimleri al
    if (listing.images) {
      let jsonImages = [];
      try {
        // Eğer string ise parse et
        jsonImages = typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images;
        if (Array.isArray(jsonImages)) {
          images.push(...jsonImages);
        }
      } catch (error) {
        console.warn('JSON images parse error:', error);
      }
    }
    
    const validDate = getValidDate(listing.created_at);
    
    // Seller bilgilerini belirle - listings tablosundaki seller_name/phone kullan
    const sellerName = listing.seller_name || 'İlan Sahibi';
    const sellerPhone = listing.seller_phone || 'Telefon Belirtilmemiş';
    
    return {
      id: listing.id,
      title: listing.title,
      price: listing.price,
      category: listing.categories?.name || listing.vehicle_types?.name || 'Kategori Belirtilmemiş',
      brand: listing.brands?.name || 'Marka',
      model: `${listing.brands?.name || ' Marka'} ${listing.models?.name || 'Model'}`,
      year: listing.year,
      km: listing.km || 0,
      kilometers: listing.km || 0,
      city: listing.cities?.name || 'Şehir',
      district: listing.districts?.name || 'İlçe',
      location: `${listing.cities?.name || 'Şehir'}, ${listing.districts?.name || 'İlçe'}`,
      description: listing.description,
      image: images.length > 0 ? images[0] : '', // İlk resmi ana resim olarak kullan
      images: images.filter((img, index, arr) => arr.indexOf(img) === index), // Duplicate'ları kaldır
      publishDate: validDate.toLocaleDateString('tr-TR'),
      user_id: listing.user_id || listing.users?.id, // Önce direkt user_id, sonra users ilişkisinden id
      seller: {
        name: sellerName,
        phone: sellerPhone,
      },
      owner: {
        name: sellerName,
        phone: sellerPhone,
      },
      details: {
        year: listing.year,
        km: listing.km || 0,
        location: `${listing.cities?.name || 'Şehir'}, ${listing.districts?.name || 'İlçe'}`,
        description: listing.description,
      },
      views: listing.views || 0,
      isFavorite: listing.isFavorite || false,
      status: 'APPROVED' as const,
      createdAt: validDate.toISOString(),
      updatedAt: validDate.toISOString(),
    };
  }, []);

  // Memoized transformed listings
  const listings = useMemo(() => {
    console.log('🔄 Memoizing listings transformation...');
    console.log('🔄 Raw listings count:', rawListings.length);
    
    if (!rawListings.length) return [];
    
    return rawListings.map((listing, index) => {
      console.log(`🔄 Processing listing ${index + 1}/${rawListings.length}:`, listing.id);
      const transformed = transformListing(listing);
      if (!transformed) {
        console.warn('⚠️ Skipping invalid listing:', listing.id);
        return null;
      }
      return transformed;
    }).filter(Boolean); // Remove null values
  }, [rawListings]);

  const loadListings = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading listings from API...');
      const response = await api.get<ListingsResponse>('/listings', {
        params: {
          page: currentPage,
          limit: itemsPerPage
        }
      });
      
      if (response.data.listings && Array.isArray(response.data.listings)) {
        
        // Deep clone to prevent reference issues
        const listingsClone = JSON.parse(JSON.stringify(response.data.listings));
        setRawListings(listingsClone);
        setTotalPages(response.data.pagination.pages);
        console.log('✅ Raw listings set:', listingsClone.length);
      } else {
        console.warn('⚠️ No listings data or invalid format');
        setRawListings([]);
      }
    } catch (error) {
      console.error('İlanlar yüklenemedi:', error);
      setError('İlanlar yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [currentPage]);

  const handleFavoriteClick = (id: string) => {
    console.log('Favorileme:', id);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/listings/${id}`);
  };

  const handleSendMessage = (listingId: string) => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    
    // Kendi ilanına mesaj göndermeyi engelle
    const listing = listings.find(l => l && l.id === listingId);
    if (listing && listing.user_id === user.id) {
      alert('Kendi ilanınıza mesaj gönderemezsiniz!');
      return;
    }
    
    navigate(`/real-time-messages?listing=${listingId}`);
  };

  const handleReport = (id: string) => {
    // Giriş kontrolü
    if (!user) {
      navigate('/auth/login');
      return;
    }
    // Kendi ilanını şikayet etme kontrolü
    const listing = listings.find(l => l && l.id === id);
    if (listing && listing.user_id && user && listing.user_id === user.id) {
      showErrorNotification('Kendi ilanınızı şikayet edemezsiniz.');
      return;
    }
    setReportModal({
      open: true,
      listingId: id,
      listingTitle: listing?.title || 'İlan'
    });
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  console.log('Component state:', { loading, error, listingsCount: listings.length });

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2, px: { xs: 2, md: 3 } }}> {/* ✅ grid ile aynı padding */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>İlanlar yükleniyor...</Typography>
        </Box>
      ) : (
        <>
          <Typography variant="h6" sx={{ mb: 2, px: 0 }}> {/* ✅ extra padding kaldır */}
            Toplam {listings.length} ilan bulundu
          </Typography>
          
          {/* İlan Kartları - Yatay Grid */}
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(2, 1fr)',
                xl: 'repeat(3, 1fr)'
              },
              gap: { xs: 2, md: 3 }, // ✅ nefes
              alignItems: "stretch", // ✅ yükseklikleri eşitle
              mb: 4
            }}
          >
            {listings.filter(listing => listing !== null).map(listing => (
              <TruckCenterCard
                key={listing!.id}
                listing={listing!}
                isOwn={!!user && listing!.user_id === user.id}
                onFavoriteClick={handleFavoriteClick}
                onViewDetails={handleViewDetails}
                onSendMessage={handleSendMessage}
                onReport={handleReport}
              />
            ))}
          </Box>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}

          {/* Sonuç bulunamadı */}
          {listings.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                Henüz ilan bulunmamaktadır
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* Report Modal */}
      <ReportModal
        open={reportModal.open}
        listingId={reportModal.listingId || ''}
        listingTitle={reportModal.listingTitle || ''}
        onClose={() => setReportModal({ open: false })}
      />
    </Container>
  );
};

export default AllListingsPage;
