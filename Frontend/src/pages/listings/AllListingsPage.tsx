import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Pagination,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import TruckCenterCard from '../../components/cards/TruckCenterCard';
import ListingFilters, { FilterValues } from '../../components/filters/ListingFilters';
import ReportModal from '../../components/ReportModal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { messageService } from '../../services/messageService';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

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
  success: boolean;
  data: {
    listings: Listing[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

const AllListingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showErrorNotification } = useNotification();
  const { confirm } = useConfirmDialog();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [rawListings, setRawListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 12;

  // Filter state
  const [activeFilters, setActiveFilters] = useState<FilterValues>({});

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
    
    // Seller bilgilerini belirle - users relation'ından kurumsal bilgileri al
    const sellerName = listing.users?.is_corporate 
      ? listing.users.company_name || listing.seller_name || 'İlan Sahibi'
      : listing.seller_name || `${listing.users?.first_name || ''} ${listing.users?.last_name || ''}`.trim() || 'İlan Sahibi';
    const sellerPhone = listing.users?.phone || listing.seller_phone || 'Telefon Belirtilmemiş';
    
    // Debug: Kurumsal bilgileri kontrol et
    if (listing.users?.is_corporate) {
      console.log('🏢 Kurumsal ilan bulundu:', {
        id: listing.id,
        title: listing.title,
        is_corporate: listing.users.is_corporate,
        company_name: listing.users.company_name,
        user_id: listing.user_id
      });
    }
    
    // Debug: Backend'den gelen users bilgilerini logla
    if (listing.title.includes('Mercedes')) {
      console.log('🔍 Mercedes ilan users data:', {
        title: listing.title,
        users: listing.users,
        is_corporate: listing.users?.is_corporate,
        company_name: listing.users?.company_name
      });
    }
    
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
        is_corporate: listing.users?.is_corporate || false,
        company_name: listing.users?.company_name || '',
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

  // Handle message click function
  const handleMessageClick = useCallback(async (listingId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Kendi ilanına mesaj göndermeyi engelle
    const listing = listings.find(l => l && l.id === listingId);
    if (listing && listing.user_id === user.id) {
      await confirm({
        title: 'Uyarı',
        description: 'Kendi ilanınıza mesaj gönderemezsiniz!',
        severity: 'warning',
        confirmText: 'Tamam',
        cancelText: ''
      });
      return;
    }
    
    navigate(`/real-time-messages?listing=${listingId}`);
  }, [user, navigate, confirm]);

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
      console.log('🔍 Category Param:', categoryParam);
      console.log('🔍 Current Page:', currentPage);
      console.log('🔍 Active Filters:', activeFilters);
      
      const params: any = {
        page: currentPage,
        limit: itemsPerPage
      };
      
      // Kategori filtresi ekle (URL parametresinden)
      if (categoryParam) {
        params.category = categoryParam;
        console.log('🎯 Adding category filter:', categoryParam);
      }
      
      // Aktif filtreleri ekle
      if (activeFilters.search) {
        params.search = activeFilters.search;
      }
      if (activeFilters.category) {
        params.category = activeFilters.category;
      }
      if (activeFilters.brand) {
        params.brand = activeFilters.brand;
      }
      if (activeFilters.model) {
        params.model = activeFilters.model;
      }
      if (activeFilters.city) {
        params.city = activeFilters.city;
      }
      if (activeFilters.district) {
        params.district = activeFilters.district;
      }
      if (activeFilters.yearMin) {
        params.yearMin = activeFilters.yearMin;
      }
      if (activeFilters.yearMax) {
        params.yearMax = activeFilters.yearMax;
      }
      if (activeFilters.priceMin) {
        params.priceMin = activeFilters.priceMin;
      }
      if (activeFilters.priceMax) {
        params.priceMax = activeFilters.priceMax;
      }
      if (activeFilters.kmMin) {
        params.kmMin = activeFilters.kmMin;
      }
      if (activeFilters.kmMax) {
        params.kmMax = activeFilters.kmMax;
      }
      if (activeFilters.isCorporate !== undefined) {
        params.isCorporate = activeFilters.isCorporate;
      }
      
      console.log('📤 API request params:', params);
      
      const response = await api.get<ListingsResponse>('/listings', { params });
      
      // Backend response format: { success: true, data: { listings: [], pagination: {} } }
      const responseData = response.data.data || response.data;
      
      if (responseData.listings && Array.isArray(responseData.listings)) {
        // Deep clone to prevent reference issues
        const listingsClone = JSON.parse(JSON.stringify(responseData.listings));
        setRawListings(listingsClone);
        setTotalPages(responseData.pagination.pages);
        console.log('✅ Raw listings set:', listingsClone.length, 'for category:', categoryParam || 'all');
      } else {
        console.warn('⚠️ No listings data or invalid format', { responseData });
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
    console.log('🔄 Category param changed:', categoryParam);
    setCurrentPage(1); // Kategori değiştiğinde ilk sayfaya dön
    loadListings();
  }, [categoryParam]);

  useEffect(() => {
    console.log('🔄 Current page changed:', currentPage);
    loadListings();
  }, [currentPage]);

  useEffect(() => {
    console.log('🔄 Active filters changed:', activeFilters);
    setCurrentPage(1); // Filtre değiştiğinde ilk sayfaya dön
    loadListings();
  }, [activeFilters]);

  const handleFiltersChange = (newFilters: FilterValues) => {
    console.log('🎯 Filters changed:', newFilters);
    setActiveFilters(newFilters);
  };

  const handleFavoriteClick = (id: string) => {
    console.log('Favorileme:', id);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/listing/${id}`);
  };

  const handleVisitStore = (userId: string, companyName: string) => {
    // Kurumsal mağaza sayfasına yönlendir
    navigate(`/store/${userId}`, { 
      state: { companyName } 
    });
  };

  const handleSendMessage = async (listingId: string) => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    
    // Kendi ilanına mesaj göndermeyi engelle
    const listing = listings.find(l => l && l.id === listingId);
    if (!listing) {
      console.error('❌ Listing not found:', listingId);
      return;
    }
    
    if (listing.user_id === user.id) {
      await confirm({
        title: 'Uyarı',
        description: 'Kendi ilanınıza mesaj gönderemezsiniz!',
        severity: 'warning',
        confirmText: 'Tamam',
        cancelText: ''
      });
      return;
    }
    
    try {
      console.log('🔥 Starting conversation for listing:', listingId);
      
      // Backend'e conversation başlatma isteği gönder
      const response = await messageService.startConversation({
        listingId: listingId,
        otherUserId: listing.user_id,
        initialMessage: `${listing.title} ilanınız hakkında bilgi almak istiyorum.`
      });
      
      if (response.success && response.conversation) {
        console.log('✅ Conversation started:', response.conversation);
        // Conversation ID ile mesajlaşma sayfasına git
        navigate(`/real-time-messages?conversation=${response.conversation.id}`);
      } else {
        console.error('❌ Failed to start conversation:', response);
        navigate(`/real-time-messages?listing=${listingId}`);
      }
    } catch (error) {
      console.error('❌ Error starting conversation:', error);
      // Fallback: Listing ID ile git
      navigate(`/real-time-messages?listing=${listingId}`);
    }
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

  // Kategori isimlerini Türkçeye çevir
  const getCategoryDisplayName = (category: string | null): string => {
    if (!category) return 'Tüm İlanlar';
    
    const categoryNames: Record<string, string> = {
      'cekici': 'Çekici',
      'dorse': 'Dorse', 
      'kamyon': 'Kamyon & Kamyonet',
      'romork': 'Römork',
      'minibus': 'Minibüs & Midibüs',
      'otobus': 'Otobüs',
      'karoser': 'Karoser & Üst Yapı',
      'kurtarici': 'Oto Kurtarıcı & Taşıyıcı'
    };
    
    return categoryNames[category] || 'Tüm İlanlar';
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
    <Container maxWidth="xl" sx={{ py: { xs: 1, md: 2 }, px: { xs: 1, sm: 2, md: 3 } }}> {/* Mobile'da daha az padding */}
      {/* Filtreleme Sistemi */}
      <ListingFilters
        onFiltersChange={handleFiltersChange}
        initialFilters={activeFilters}
        loading={loading}
      />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>İlanlar yükleniyor...</Typography>
        </Box>
      ) : (
        <>
          
          {/* İlan Kartları - Responsive Grid */}
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',                    // Mobile: 1 kolon
                sm: '1fr',                    // Small tablet: 1 kolon
                md: 'repeat(2, 1fr)',         // Medium tablet: 2 kolon
                lg: 'repeat(2, 1fr)',         // Desktop: 2 kolon
                xl: 'repeat(3, 1fr)'          // Large desktop: 3 kolon
              },
              gap: { xs: 2, sm: 2.5, md: 3, lg: 3.5 }, // Gap artırıldı
              alignItems: "stretch", // ✅ yükseklikleri eşitle
              mb: 4,
              // Mobile'da daha kompakt görünüm
              '& .MuiCard-root': {
                maxWidth: { xs: '100%', md: 460 } // Max width artırıldı
              }
            }}
          >
            {listings.filter(listing => listing !== null).map(listing => {
              console.log('🎯 Rendering TruckCenterCard for listing:', {
                id: listing!.id,
                title: listing!.title,
                seller_is_corporate: listing!.seller.is_corporate,
                seller_company_name: listing!.seller.company_name,
                user_id: listing!.user_id
              });
              
              return (
                <TruckCenterCard
                  key={listing!.id}
                  listing={listing!}
                  isOwn={!!user && listing!.user_id === user.id}
                  onFavoriteClick={handleFavoriteClick}
                  onViewDetails={handleViewDetails}
                  onSendMessage={handleSendMessage}
                  onReport={handleReport}
                  onVisitStore={handleVisitStore}
                />
              );
            })}
          </Box>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 3, md: 4 } }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="medium" // Tek size kullan
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }
                }}
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
