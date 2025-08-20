import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardMedia,
  Chip,
  Avatar,
  Divider,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  Phone,
  Email,
  Share,
  Favorite,
  FavoriteOutlined,
  Report,
  ArrowBack,
  Message,
} from '@mui/icons-material';
import { Listing } from '../../types';
import ReportModal from '../../components/ReportModal';
import { listingService } from '../../services/listingService';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  // Load listing data
  useEffect(() => {
    const loadListing = async () => {
      if (!id) {
        setError('İlan ID bulunamadı');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const listingData = await listingService.getListingById(id);
        setListing(listingData);
        
        // Check if listing is in favorites
        if (user && favorites) {
          setIsFavorite(favorites.some(fav => fav.id === listingData.id));
        }
      } catch (err: any) {
        console.error('Error loading listing:', err);
        setError(err.response?.data?.message || 'İlan yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [id, user, favorites]);

  const handleToggleFavorite = async () => {
    if (!listing || !user) return;

    try {
      if (isFavorite) {
        await removeFromFavorites(listing.id);
        setIsFavorite(false);
      } else {
        await addToFavorites(listing.id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleSendMessage = () => {
    if (!listing) return;
    
    // Navigate to chat page with listing ID
    navigate(`/real-time-messages?listing=${listing.id}`);
  };

  const handleContact = () => {
    setContactDialogOpen(true);
  };

  const handleReport = () => {
    setReportModalOpen(true);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      console.log('Link kopyalandı!');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          İlan yükleniyor...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Ana Sayfaya Dön
        </Button>
      </Container>
    );
  }

  if (!listing) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5">İlan bulunamadı</Typography>
        <Button type="button" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Ana Sayfaya Dön
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Geri Dön
      </Button>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
        {/* Images */}
        <Box>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={listing.images[selectedImageIndex] || '/placeholder-image.jpg'}
              alt={listing.title}
              sx={{ objectFit: 'cover', cursor: 'pointer' }}
              onClick={() => setImageDialogOpen(true)}
            />
          </Card>
          
          {/* Thumbnail Images */}
          {listing.images && listing.images.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto' }}>
              {listing.images.map((image, index) => (
                <Card 
                  key={index} 
                  sx={{ 
                    minWidth: 120, 
                    border: selectedImageIndex === index ? 2 : 0,
                    borderColor: 'primary.main',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <CardMedia
                    component="img"
                    height="80"
                    image={image}
                    alt={`${listing.title} ${index + 1}`}
                    sx={{ objectFit: 'cover' }}
                  />
                </Card>
              ))}
            </Box>
          )}
        </Box>

        {/* Listing Info */}
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" component="h1" fontWeight="bold">
                {formatPrice(listing.price)}
              </Typography>
              <Box>
                <IconButton onClick={handleToggleFavorite} disabled={!user}>
                  {isFavorite ? <Favorite color="error" /> : <FavoriteOutlined />}
                </IconButton>
                <IconButton onClick={handleShare}>
                  <Share />
                </IconButton>
              </Box>
            </Box>

            <Typography variant="h5" gutterBottom>
              {listing.title}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationOn color="action" />
              <Typography variant="body2" color="text.secondary">
                {listing.location}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CalendarToday color="action" />
              <Typography variant="body2" color="text.secondary">
                {formatDate(listing.createdAt)}
              </Typography>
            </Box>

            <Chip label={listing.category.name} color="primary" sx={{ mb: 3 }} />

            <Divider sx={{ my: 2 }} />

            {/* Seller Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar>{listing.user.first_name[0]}</Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {listing.user.first_name} {listing.user.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  @{listing.user.username}
                </Typography>
              </Box>
            </Box>

            {/* Contact Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Phone />}
                onClick={handleContact}
                size="large"
              >
                İletişime Geç
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Message />}
                size="large"
                onClick={handleSendMessage}
              >
                Mesaj Gönder
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Button
              startIcon={<Report />}
              onClick={handleReport}
              color="warning"
              size="small"
            >
              Şikayet Et
            </Button>
          </Paper>
        </Box>
      </Box>

      {/* Vehicle Details - Ultra Comprehensive */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Araç Detayları - Tüm Özellikler
        </Typography>
        
        {/* Vehicle Identification */}
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
          Araç Kimlik Bilgileri
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
          {(listing as any).brands?.name && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Marka
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {(listing as any).brands.name}
              </Typography>
            </Box>
          )}
          {(listing as any).models?.name && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Model
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {(listing as any).models.name}
              </Typography>
            </Box>
          )}
          {(listing as any).variants?.name && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Varyant
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {(listing as any).variants.name}
              </Typography>
            </Box>
          )}
          {(listing as any).year && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Model Yılı
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {(listing as any).year}
              </Typography>
            </Box>
          )}
          {(listing as any).categories?.name && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Kategori
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {(listing as any).categories.name}
              </Typography>
            </Box>
          )}
          {(listing as any).vehicle_types?.name && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Araç Tipi
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {(listing as any).vehicle_types.name}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Technical Specifications */}
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
          Motor ve Teknik Özellikler
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
          {(listing as any).engine_power && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Motor Gücü
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {(listing as any).engine_power} HP (Beygir Gücü)
              </Typography>
            </Box>
          )}
          {(listing as any).engine_volume && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Motor Hacmi
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {(listing as any).engine_volume} cc
              </Typography>
            </Box>
          )}
          {(listing as any).fuel_type && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Yakıt Türü
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {(listing as any).fuel_type}
              </Typography>
            </Box>
          )}
          {(listing as any).transmission && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Şanzıman Tipi
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {(listing as any).transmission}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Usage and Appearance */}
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
          Kullanım ve Görünüm Bilgileri
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
          {(listing as any).km !== null && (listing as any).km !== undefined && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Kilometre (Odometer)
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {Number((listing as any).km).toLocaleString('tr-TR')} km
              </Typography>
            </Box>
          )}
          {(listing as any).color && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Araç Rengi
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {(listing as any).color}
              </Typography>
            </Box>
          )}
          {(listing as any).vehicle_condition && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Araç Durumu
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {(listing as any).vehicle_condition}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Legal and Transaction Information */}
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
          Yasal ve İşlem Bilgileri
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
          {(listing as any).license_plate && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Plaka Numarası
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {(listing as any).license_plate}
              </Typography>
            </Box>
          )}
          {(listing as any).is_exchangeable !== null && (listing as any).is_exchangeable !== undefined && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Takas Seçeneği
              </Typography>
              <Typography variant="body1" fontWeight="medium" color={
                (listing as any).is_exchangeable ? 'success.main' : 'error.main'
              }>
                {(listing as any).is_exchangeable ? '✓ Takasa Uygun' : '✗ Sadece Satış'}
              </Typography>
            </Box>
          )}
          <Box>
            <Typography variant="body2" color="text.secondary">
              Fiyat Türü
            </Typography>
            <Typography variant="body1" fontWeight="medium" color="primary.main">
              {(listing as any).price_type === 'FIXED' ? 'Sabit Fiyat' : 'Pazarlık Edilebilir'}
            </Typography>
          </Box>
        </Box>

        {/* Location Information */}
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
          Konum Bilgileri
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
          {(listing as any).cities?.name && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Şehir
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {(listing as any).cities.name}
              </Typography>
            </Box>
          )}
          {(listing as any).districts?.name && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                İlçe
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {(listing as any).districts.name}
              </Typography>
            </Box>
          )}
        </Box>

        {/* System Information */}
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
          İlan Bilgileri
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Görüntülenme
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {(listing as any).view_count || 0} kez
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              İlan Durumu
            </Typography>
            <Typography variant="body1" fontWeight="medium" color={
              (listing as any).status === 'ACTIVE' ? 'success.main' : 
              (listing as any).status === 'PENDING' ? 'warning.main' : 'text.primary'
            }>
              {(listing as any).status === 'ACTIVE' ? 'Aktif' : 
               (listing as any).status === 'PENDING' ? 'Onay Bekliyor' : 
               (listing as any).status === 'DRAFT' ? 'Taslak' : (listing as any).status}
            </Typography>
          </Box>
          {(listing as any).created_at && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                İlan Tarihi
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {new Date((listing as any).created_at).toLocaleDateString('tr-TR')}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Description */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Açıklama
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
          {(listing as any)?.description}
        </Typography>
      </Paper>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)}>
        <DialogTitle>İletişim Bilgileri</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone />
              <Typography>{(listing as any)?.user?.phone}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Email />
              <Typography>{(listing as any)?.user?.email}</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Image Dialog */}
      <Dialog 
        open={imageDialogOpen} 
        onClose={() => setImageDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              sx={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
              image={`http://localhost:3005${(listing as any)?.images?.[selectedImageIndex]}` || '/placeholder-image.jpg'}
              alt={(listing as any)?.title}
            />
            
            {/* Navigation arrows if multiple images */}
            {(listing as any)?.images && (listing as any)?.images?.length > 1 && (
              <>
                <IconButton
                  sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
                  onClick={() => setSelectedImageIndex(prev => prev === 0 ? (listing as any)?.images?.length - 1 : prev - 1)}
                >
                  <ArrowBack />
                </IconButton>
                <IconButton
                  sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
                  onClick={() => setSelectedImageIndex(prev => prev === (listing as any)?.images?.length - 1 ? 0 : prev + 1)}
                >
                  <ArrowBack sx={{ transform: 'rotate(180deg)' }} />
                </IconButton>
              </>
            )}
          </Box>
          
          {/* Image counter */}
          {(listing as any)?.images && (listing as any)?.images?.length > 1 && (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="body2">
                {selectedImageIndex + 1} / {(listing as any)?.images?.length}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Report Dialog */}
      <ReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        listingId={(listing as any)?.id}
      />
    </Container>
  );
};

export default ListingDetail;
