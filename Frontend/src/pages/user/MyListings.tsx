import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Fab,
  Stack,
  Pagination,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  LocalShipping as TruckIcon,
  Delete as DeleteIcon,

} from '@mui/icons-material';
import TruckCenterCard from '../../components/cards/TruckCenterCard';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { SimpleListing } from '../../context/ListingContext';

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
  user_id: string;
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


const MyListings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showErrorNotification } = useNotification();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  const [deleting, setDeleting] = useState(false);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchMyListings();
  }, [currentPage]);

  const fetchMyListings = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Making request to /me/listings with user:', user?.id);
      const response = await api.get(`/me/listings?page=${currentPage}&limit=${itemsPerPage}`);
      
      if (response.data.success) {
        const { listings: fetchedListings, pagination } = response.data.data;
        console.log('🖼️ MyListings API Response:', response.data);
        console.log('🖼️ First listing images array (from images field):', fetchedListings?.[0]?.images);
        console.log('🖼️ First listing images array (from listing_images):', fetchedListings?.[0]?.listing_images);
        console.log('🖼️ Full first listing:', fetchedListings?.[0]);
        setListings(fetchedListings || []);
        setTotalPages(pagination?.pages || 0);
      } else {
        throw new Error(response.data.message || 'İlanlar yüklenirken hata oluştu');
      }
    } catch (error: any) {
      console.error('Error fetching my listings:', error);
      setError(error.message || 'İlanlar yüklenirken hata oluştu');
      showErrorNotification(error.message || 'İlanlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteClick = (id: string) => {
    console.log('Favorileme:', id);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/listing/${id}`);
  };

  const handleSendMessage = (listingId: string) => {
    // Kendi ilanına mesaj gönderme mantıklı değil, edit sayfasına yönlendir
    navigate(`/edit-listing/${listingId}`);
  };

  const handleReport = (id: string) => {
    // Kendi ilanını şikayet etmek mantıklı değil, edit sayfasına yönlendir
    navigate(`/edit-listing/${id}`);
  };

  const handleDelete = (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (listing) {
      setListingToDelete(listing);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!listingToDelete) return;

    try {
      setDeleting(true);
      
      const response = await api.delete(`/listings/${listingToDelete.id}`);
      
      if (response.data.success) {
        // İlanı listeden kaldır
        setListings(prev => prev.filter(listing => listing.id !== listingToDelete.id));
        setDeleteDialogOpen(false);
        setListingToDelete(null);
        // Başarı mesajı göster
        console.log('İlan başarıyla silindi');
      } else {
        throw new Error(response.data.message || 'İlan silinirken hata oluştu');
      }
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      showErrorNotification(error.message || 'İlan silinirken hata oluştu');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setListingToDelete(null);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  // Backend verilerini SimpleListing formatına dönüştür
  const mapToSimpleListing = (listing: Listing): SimpleListing => {
    return {
      id: listing.id,
      title: listing.title,
      price: listing.price,
      category: listing.categories?.name || listing.category?.name || '',
      brand: listing.brands?.name || listing.brand?.name || '',
      model: listing.models?.name || listing.model?.name || '',
      year: listing.year,
      km: listing.kilometers || listing.km || 0,
      location: `${listing.cities?.name || listing.city_name || ''}, ${listing.districts?.name || listing.district_name || ''}`,
      image: listing.images?.[0] || listing.listing_images?.[0]?.url || '',
      images: listing.images || listing.listing_images?.map(img => img.url) || [],
      user_id: listing.user_id,
      seller: {
        name: `${listing.users?.first_name || listing.user?.first_name || ''} ${listing.users?.last_name || listing.user?.last_name || ''}`.trim(),
        phone: listing.users?.phone || listing.user?.phone || listing.seller_phone || ''
      },
      owner: {
        name: `${listing.users?.first_name || listing.user?.first_name || ''} ${listing.users?.last_name || listing.user?.last_name || ''}`.trim(),
        phone: listing.users?.phone || listing.user?.phone || listing.seller_phone || ''
      },
      status: 'APPROVED' as const, // Kullanıcının kendi ilanları approved kabul ediyoruz
      isFavorite: listing.isFavorite || false,
      createdAt: listing.created_at
    };
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={40} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              İlanlarım
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Toplam {listings.length} ilan
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/category-selection')}
            size="large"
          >
            Yeni İlan Ver
          </Button>
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Content */}
      {listings.length === 0 && !loading ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            backgroundColor: 'grey.50',
            borderRadius: 2,
            border: '2px dashed #e0e0e0'
          }}
        >
          <TruckIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Henüz ilanınız bulunmuyor
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            İlk ilanınızı vererek satış yapmaya başlayın
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/category-selection')}
          >
            İlan Ver
          </Button>
        </Box>
      ) : (
        <>
          {/* İlan Kartları - Anasayfadaki gibi */}
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(2, 1fr)',
                xl: 'repeat(3, 1fr)'
              },
              gap: { xs: 2, md: 3 },
              alignItems: "stretch",
              mb: 4
            }}
          >
            {listings.filter(listing => listing !== null).map(listing => (
              <TruckCenterCard
                key={listing!.id}
                listing={mapToSimpleListing(listing!)}
                isOwn={true} // Kendi ilanları olduğu için true
                onFavoriteClick={handleFavoriteClick}
                onViewDetails={handleViewDetails}
                onSendMessage={handleSendMessage}
                onReport={handleReport}
                onDelete={handleDelete}
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
        </>
      )}

      {/* Floating Add Button for mobile */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={() => navigate('/category-selection')}
      >
        <AddIcon />
      </Fab>

      {/* Silme Onay Modal'ı */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          İlanı Sil
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            "{listingToDelete?.title}" adlı ilanınızı silmek istediğinizden emin misiniz?
            Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            İptal
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleting ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyListings;
