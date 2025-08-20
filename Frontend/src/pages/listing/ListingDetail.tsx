import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Chip,
  Button,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogContent,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import {
  ArrowBack,
  Phone,
  Message,
  LocationOn,
  CalendarToday,
  Visibility,
  Share,
  Favorite,
  FavoriteBorder,
  Close,
  ChevronLeft,
  ChevronRight,
  Flag
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import api from '../../services/api';

interface ListingDetailData {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  
  // Vehicle details
  brand?: string;
  model?: string;
  variant?: string;
  year?: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  enginePower?: number;
  
  // Location
  city?: string;
  district?: string;
  
  // User info
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profileImage?: string;
    memberSince: string;
    totalListings: number;
    isVerified: boolean;
  };
  
  // Additional details
  features?: string[];
  specifications?: Record<string, any>;
  condition?: string;
  negotiable?: boolean;
}

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  
  const [listing, setListing] = useState<ListingDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchListingDetail();
      setIsFavorite(favorites.some(fav => fav.id === id));
    }
  }, [id, favorites]);

  const fetchListingDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/listings/${id}`);
      if (response.data.success) {
        setListing(response.data.data);
      } else {
        setError('İlan bulunamadı');
      }
    } catch (error: any) {
      console.error('Error fetching listing detail:', error);
      setError('İlan detayları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      console.log('Favorilere eklemek için giriş yapmalısınız');
      return;
    }
    
    if (!listing) return;

    try {
      if (isFavorite) {
        await removeFromFavorites(listing.id);
        setIsFavorite(false);
        console.log('Favorilerden çıkarıldı');
      } else {
        await addToFavorites(listing.id);
        setIsFavorite(true);
        console.log('Favorilere eklendi');
      }
    } catch (error) {
      console.log('İşlem sırasında hata oluştu');
    }
  };

  const handleContactSeller = () => {
    if (!user) {
      console.log('İletişim için giriş yapmalısınız');
      return;
    }
    
    if (!listing?.user.phone) {
      console.log('Satıcı telefon bilgisi mevcut değil');
      return;
    }
    
    window.open(`tel:${listing.user.phone}`, '_blank');
  };

  const handleSendMessage = () => {
    if (!user) {
      console.log('Mesaj göndermek için giriş yapmalısınız');
      return;
    }
    
    // Navigate to messages page with user
    navigate(`/messages?userId=${listing?.user.id}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      console.log('Link kopyalandı');
    }
  };

  const handleReport = () => {
    if (!user) {
      console.log('Şikayet için giriş yapmalısınız');
      return;
    }
    console.log('Şikayet özelliği yakında aktif olacak');
  };

  const nextImage = () => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === listing.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  };

  const formatPrice = (price: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !listing) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'İlan bulunamadı'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          variant="outlined"
        >
          Geri Dön
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: theme.palette.primary.main }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {listing.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handleShare} sx={{ color: theme.palette.text.secondary }}>
            <Share />
          </IconButton>
          <IconButton onClick={handleReport} sx={{ color: theme.palette.text.secondary }}>
            <Flag />
          </IconButton>
          <IconButton onClick={handleFavoriteToggle} sx={{ color: isFavorite ? 'red' : theme.palette.text.secondary }}>
            {isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Images */}
        <Grid xs={12} md={8}>
          <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            {listing.images && listing.images.length > 0 ? (
              <Box sx={{ position: 'relative', height: 400 }}>
                <img
                  src={listing.images[currentImageIndex]}
                  alt={`${listing.title} - ${currentImageIndex + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    cursor: 'pointer'
                  }}
                  onClick={() => setImageDialogOpen(true)}
                />
                
                {listing.images.length > 1 && (
                  <>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        left: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: alpha(theme.palette.common.black, 0.6),
                        color: 'white',
                        '&:hover': { bgcolor: alpha(theme.palette.common.black, 0.8) }
                      }}
                      onClick={prevImage}
                    >
                      <ChevronLeft />
                    </IconButton>
                    
                    <IconButton
                      sx={{
                        position: 'absolute',
                        right: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: alpha(theme.palette.common.black, 0.6),
                        color: 'white',
                        '&:hover': { bgcolor: alpha(theme.palette.common.black, 0.8) }
                      }}
                      onClick={nextImage}
                    >
                      <ChevronRight />
                    </IconButton>
                    
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        bgcolor: alpha(theme.palette.common.black, 0.6),
                        color: 'white',
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        fontSize: '0.875rem'
                      }}
                    >
                      {currentImageIndex + 1} / {listing.images.length}
                    </Box>
                  </>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: theme.palette.grey[200],
                  color: theme.palette.text.secondary
                }}
              >
                <Typography variant="h6">Resim bulunamadı</Typography>
              </Box>
            )}
          </Paper>

          {/* Image Thumbnails */}
          {listing.images && listing.images.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, mb: 3 }}>
              {listing.images.map((image, index) => (
                <Box
                  key={index}
                  sx={{
                    minWidth: 80,
                    height: 60,
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: index === currentImageIndex ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                    opacity: index === currentImageIndex ? 1 : 0.7
                  }}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              ))}
            </Box>
          )}

          {/* Vehicle Details */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Araç Bilgileri
            </Typography>
            <Grid container spacing={3}>
              <Grid xs={6} sm={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Marka</Typography>
                  <Typography variant="body1" fontWeight={500}>{listing.brand || '-'}</Typography>
                </Box>
              </Grid>
              <Grid xs={6} sm={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Model</Typography>
                  <Typography variant="body1" fontWeight={500}>{listing.model || '-'}</Typography>
                </Box>
              </Grid>
              <Grid xs={6} sm={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Varyant</Typography>
                  <Typography variant="body1" fontWeight={500}>{listing.variant || '-'}</Typography>
                </Box>
              </Grid>
              <Grid xs={6} sm={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Yıl</Typography>
                  <Typography variant="body1" fontWeight={500}>{listing.year || '-'}</Typography>
                </Box>
              </Grid>
              <Grid xs={6} sm={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Kilometre</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {listing.mileage ? `${listing.mileage.toLocaleString('tr-TR')} km` : '-'}
                  </Typography>
                </Box>
              </Grid>
              <Grid xs={6} sm={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Yakıt Türü</Typography>
                  <Typography variant="body1" fontWeight={500}>{listing.fuelType || '-'}</Typography>
                </Box>
              </Grid>
              <Grid xs={6} sm={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Vites</Typography>
                  <Typography variant="body1" fontWeight={500}>{listing.transmission || '-'}</Typography>
                </Box>
              </Grid>
              <Grid xs={6} sm={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Motor Gücü</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {listing.enginePower ? `${listing.enginePower} HP` : '-'}
                  </Typography>
                </Box>
              </Grid>
              <Grid xs={6} sm={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Durum</Typography>
                  <Typography variant="body1" fontWeight={500}>{listing.condition || '-'}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Description */}
          {listing.description && (
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Açıklama
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {listing.description}
              </Typography>
            </Paper>
          )}
        </Grid>

        {/* Right Column - Price and User Info */}
        <Grid xs={12} md={4}>
          {/* Price Card */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h4" sx={{ 
              color: theme.palette.primary.main, 
              fontWeight: 700, 
              mb: 1 
            }}>
              {formatPrice(listing.price, listing.currency)}
            </Typography>
            {listing.negotiable && (
              <Chip label="Pazarlık Yapılır" size="small" color="secondary" sx={{ mb: 2 }} />
            )}
            
            <Stack spacing={2}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<Phone />}
                onClick={handleContactSeller}
                disabled={!listing.user.phone}
                sx={{ py: 1.5 }}
              >
                Ara
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<Message />}
                onClick={handleSendMessage}
                sx={{ py: 1.5 }}
              >
                Mesaj Gönder
              </Button>
            </Stack>

            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationOn sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
              <Typography variant="body2" color="text.secondary">
                {listing.city} {listing.district && `/ ${listing.district}`}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CalendarToday sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
              <Typography variant="body2" color="text.secondary">
                {formatDate(listing.createdAt)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Visibility sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
              <Typography variant="body2" color="text.secondary">
                İlan No: {listing.id.slice(-8).toUpperCase()}
              </Typography>
            </Box>
          </Paper>

          {/* Seller Info Card */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Satıcı Bilgileri
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={listing.user.profileImage}
                sx={{ width: 60, height: 60, mr: 2 }}
              >
                {listing.user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  {listing.user.name}
                  {listing.user.isVerified && (
                    <Chip
                      label="Doğrulanmış"
                      size="small"
                      color="success"
                      sx={{ ml: 1, fontSize: '0.75rem' }}
                    />
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(listing.user.memberSince)} tarihinden beri üye
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={600} color="primary">
                  {listing.user.totalListings}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Toplam İlan
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={600} color="primary">
                  4.5
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Değerlendirme
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={600} color="primary">
                  98%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Yanıt Oranı
                </Typography>
              </Box>
            </Box>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate(`/profile/${listing.user.id}`)}
            >
              Profili Görüntüle
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Image Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: alpha(theme.palette.common.black, 0.6),
              color: 'white',
              zIndex: 1,
              '&:hover': { bgcolor: alpha(theme.palette.common.black, 0.8) }
            }}
            onClick={() => setImageDialogOpen(false)}
          >
            <Close />
          </IconButton>
          
          {listing.images && listing.images[currentImageIndex] && (
            <img
              src={listing.images[currentImageIndex]}
              alt={`${listing.title} - ${currentImageIndex + 1}`}
              style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ListingDetail;
