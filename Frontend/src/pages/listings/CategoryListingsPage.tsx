import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Pagination,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import { Home, NavigateNext } from '@mui/icons-material';
import TruckCenterCard from '../../components/cards/TruckCenterCard';
import ReportModal from '../../components/ReportModal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { messageService } from '../../services/messageService';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { SimpleListing } from '../../context/ListingContext';

// Kategori mapping
const categoryMapping: Record<string, string> = {
  'cekici': 'Çekici',
  'dorse': 'Dorse', 
  'kamyon': 'Kamyon & Kamyonet',
  'romork': 'Römork',
  'minibus': 'Minibüs & Midibüs',
  'otobus': 'Otobüs',
  'karoser': 'Karoser & Üst Yapı',
  'kurtarici': 'Oto Kurtarıcı & Taşıyıcı'
};

const CategoryListingsPage: React.FC = () => {
  const { category: categorySlug } = useParams<{ category: string }>();
  const { user } = useAuth();
  const { showErrorNotification } = useNotification();
  const { confirm } = useConfirmDialog();
  const navigate = useNavigate();
  
  const [rawListings, setRawListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportListingId, setReportListingId] = useState<string | null>(null);
  
  const itemsPerPage = 12;
  const categoryName = categorySlug ? categoryMapping[categorySlug] : '';

  // Memoized transform function
  const transformListing = useCallback((listing: any): SimpleListing | null => {
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
      location: `${listing.cities?.name || 'Şehir'}, ${listing.districts?.name || 'İlçe'}`,
      image: images.length > 0 ? images[0] : '', // İlk resmi ana resim olarak kullan
      images: images.filter((img, index, arr) => arr.indexOf(img) === index), // Duplicate'ları kaldır
      user_id: listing.user_id || listing.users?.id, // Önce direkt user_id, sonra users ilişkisinden id
      seller: {
        name: sellerName,
        phone: sellerPhone,
      },
      owner: {
        name: sellerName,
        phone: sellerPhone,
      },
      status: 'APPROVED' as const,
      createdAt: validDate.toISOString(),
    };
  }, []);

  // Memoized transformed listings
  const listings = useMemo(() => {
    console.log('🔄 CategoryListingsPage: Memoizing listings transformation...');
    console.log('🔄 CategoryListingsPage: Raw listings count:', rawListings.length);
    
    if (!rawListings.length) return [];
    
    return rawListings.map((listing, index) => {
      console.log(`🔄 CategoryListingsPage: Processing listing ${index + 1}/${rawListings.length}:`, listing.id);
      const transformed = transformListing(listing);
      if (!transformed) {
        console.warn('⚠️ CategoryListingsPage: Skipping invalid listing:', listing.id);
        return null;
      }
      return transformed;
    }).filter(Boolean) as SimpleListing[]; // Remove null values
  }, [rawListings, transformListing]);

  // İlanları getir (vehicle type filtrelemeli)
  const fetchListings = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`📋 CategoryListingsPage: Fetching listings for vehicle type: ${categoryName}, page: ${page}`);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });
      
      // Vehicle type filtresi ekle (URL encoding olmadan)
      if (categoryName) {
        params.append('vehicle_type', categoryName);
        console.log(`🔍 CategoryListingsPage: Added vehicle_type filter: ${categoryName}`);
      }
      
      const url = `/listings?${params.toString()}`;
      console.log(`🔗 CategoryListingsPage: API URL: ${url}`);
      
      const response = await api.get(url);
      
      if (response.data.success) {
        const { listings, pagination } = response.data.data;
        console.log(`✅ CategoryListingsPage: Found ${listings.length} listings for vehicle type ${categoryName}`);
        
        setRawListings(listings);
        setTotalPages(pagination.pages);
        setTotalCount(pagination.total);
      } else {
        throw new Error(response.data.message || 'İlanlar yüklenemedi');
      }
    } catch (error: any) {
      console.error('❌ CategoryListingsPage: Error fetching listings:', error);
      setError(error.message || 'İlanlar yüklenirken hata oluştu');
      showErrorNotification('İlanlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings(1);
    setCurrentPage(1);
  }, [categorySlug]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    fetchListings(page);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/listing/${id}`);
  };

  const handleReport = (listingId: string) => {
    if (!user) {
      showErrorNotification('Rapor vermek için giriş yapmalısınız');
      return;
    }
    setReportListingId(listingId);
    setReportModalOpen(true);
  };

  const handleDelete = async (listingId: string) => {
    const confirmed = await confirm({
      title: 'İlanı Sil',
      description: 'Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      confirmText: 'Sil',
      cancelText: 'İptal',
      severity: 'warning'
    });

    if (!confirmed) return;

    try {
      const response = await api.delete(`/api/listings/${listingId}`);
      if (response.data.success) {
        fetchListings(currentPage);
      }
    } catch (error: any) {
      showErrorNotification(error.response?.data?.message || 'İlan silinirken hata oluştu');
    }
  };

  const handleSendMessage = async (listingId: string) => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    
    // Kendi ilanına mesaj göndermeyi engelle
    const listing = rawListings.find(l => l && l.id === listingId);
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

  // Kategori bulunamadıysa
  if (categorySlug && !categoryName) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Kategori bulunamadı. Lütfen geçerli bir kategori seçin.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Breadcrumb */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb">
          <Link 
            href="/" 
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'text.secondary' }}
          >
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Ana Sayfa
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            {categoryName || 'Kategoriler'}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Başlık ve İstatistik */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
          {categoryName || 'Tüm İlanlar'}
        </Typography>
        
        {!loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={`${totalCount} ilan bulundu`}
              color="primary"
              variant="outlined"
            />
            {categoryName && (
              <Chip 
                label={`Kategori: ${categoryName}`}
                color="secondary"
                variant="filled"
              />
            )}
          </Box>
        )}
      </Box>

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* İlanlar Grid */}
      {!loading && !error && (
        <>
          {listings.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {categoryName ? `${categoryName} kategorisinde ilan bulunamadı` : 'Henüz ilan bulunmamaktadır'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lütfen daha sonra tekrar kontrol edin.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                },
                gap: 3,
                mb: 4,
              }}
            >
              {listings.map((listing) => (
                <TruckCenterCard
                  key={listing.id}
                  listing={listing}
                  onViewDetails={handleViewDetails}
                  onSendMessage={handleSendMessage}
                  onReport={handleReport}
                  onDelete={user?.id === listing.user_id ? handleDelete : undefined}
                />
              ))}
            </Box>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" py={4}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Report Modal */}
      {reportListingId && (
        <ReportModal
          open={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            setReportListingId(null);
          }}
          listingId={reportListingId}
        />
      )}
    </Container>
  );
};

export default CategoryListingsPage;
