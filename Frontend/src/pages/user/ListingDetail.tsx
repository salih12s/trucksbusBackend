import React from 'react';
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
  TextField,
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  AttachMoney,
  Phone,
  Email,
  Share,
  Favorite,
  FavoriteOutlined,
  Report,
  ArrowBack,
  Message,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { Listing } from '@/types';

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      const mockListing: Listing = {
        id: id || '1',
        title: 'Mercedes Actros 2545 Kamyon',
        description: `Bu kamyon mükemmel durumda olup, düzenli bakımları yapılmıştır. 
        
        Özellikler:
        • Motor: Mercedes OM471 - 449 HP
        • Vites: G281-12 PowerShift
        • Km: 450.000 km
        • Yaş: 2018 Model
        • Yakıt: Dizel
        • Renk: Beyaz
        
        Araç bakımlı ve sorunsuz olup, ticari kullanıma hazırdır. Detaylı bilgi için iletişime geçiniz.`,
        price: 750000,
        categoryId: 'cat-1',
        category: {
          id: 'cat-1',
          name: 'Kamyon',
          slug: 'kamyon',
          createdAt: new Date(),
        },
        userId: 'user-1',
        user: {
          id: 'user-1',
          email: 'satici@example.com',
          username: 'kamyoncu',
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          phone: '+90 532 123 45 67',
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        images: [
          'https://via.placeholder.com/800x400?text=Kamyon+1',
          'https://via.placeholder.com/800x400?text=Kamyon+2',
          'https://via.placeholder.com/800x400?text=Kamyon+3',
        ],
        location: 'İstanbul, Türkiye',
        status: 'APPROVED' as any,
        isApproved: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
      };
      
      setListing(mockListing);
      setLoading(false);
    }, 500);
  }, [id]);

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
    }).format(date);
  };

  const handleContact = () => {
    setContactDialogOpen(true);
  };

  const handleReport = () => {
    setReportDialogOpen(true);
  };

  const submitReport = () => {
    // Handle report submission
    console.log('Report submitted:', reportReason);
    setReportDialogOpen(false);
    setReportReason('');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Yükleniyor...</Typography>
      </Container>
    );
  }

  if (!listing) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5">İlan bulunamadı</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
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
              image={listing.images[0]}
              alt={listing.title}
              sx={{ objectFit: 'cover' }}
            />
          </Card>
          
          {/* Additional Images */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto' }}>
            {listing.images.slice(1).map((image, index) => (
              <Card key={index} sx={{ minWidth: 120 }}>
                <CardMedia
                  component="img"
                  height="80"
                  image={image}
                  alt={`${listing.title} ${index + 2}`}
                  sx={{ objectFit: 'cover', cursor: 'pointer' }}
                />
              </Card>
            ))}
          </Box>
        </Box>

        {/* Listing Info */}
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" component="h1" fontWeight="bold">
                {formatPrice(listing.price)}
              </Typography>
              <Box>
                <IconButton onClick={() => setIsFavorite(!isFavorite)}>
                  {isFavorite ? <Favorite color="error" /> : <FavoriteOutlined />}
                </IconButton>
                <IconButton>
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
              <Avatar>{listing.user.firstName[0]}</Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {listing.user.firstName} {listing.user.lastName}
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

      {/* Description */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Açıklama
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
          {listing.description}
        </Typography>
      </Paper>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)}>
        <DialogTitle>İletişim Bilgileri</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone />
              <Typography>{listing.user.phone}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Email />
              <Typography>{listing.user.email}</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)}>
        <DialogTitle>İlan Şikayet Et</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Şikayet Sebebi"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>İptal</Button>
          <Button onClick={submitReport} variant="contained" color="warning">
            Şikayet Et
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ListingDetail;
