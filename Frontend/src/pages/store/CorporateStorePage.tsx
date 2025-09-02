import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Avatar, 
  Divider,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { useParams, useLocation } from 'react-router-dom';
import { alpha, useTheme } from '@mui/material/styles';
import { Store as StoreIcon, Email as EmailIcon, Phone as PhoneIcon } from '@mui/icons-material';
import TruckCenterCard from '../../components/cards/TruckCenterCard';
import { api } from '../../services/api';
import { SimpleListing } from '../../context/ListingContext';

interface CorporateStoreData {
  company_name: string;
  email: string;
  phone?: string;
  totalListings: number;
  listings: SimpleListing[];
}

const CorporateStorePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const theme = useTheme();
  const [storeData, setStoreData] = useState<CorporateStoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const companyName = location.state?.companyName || 'Kurumsal Mağaza';

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!userId) {
        setError('Mağaza ID bulunamadı');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Kullanıcının tüm ilanlarını çek
        const response = await api.get(`/listings`, {
          params: {
            user_id: userId,
            limit: 100, // Tüm ilanları çekmek için büyük bir limit
            page: 1
          }
        });

        if (response.data.success && response.data.data?.listings) {
          const listings = response.data.data.listings;
          
          // İlan verilerini SimpleListing formatına dönüştür
          const formattedListings: SimpleListing[] = listings.map((listing: any) => ({
            id: listing.id,
            title: listing.title,
            price: listing.price,
            category: listing.categories?.name || listing.category?.name || '',
            brand: listing.brands?.name || listing.brand?.name || '',
            model: listing.models?.name || listing.model?.name || '',
            year: listing.year,
            km: listing.km || listing.kilometers || 0,
            location: `${listing.cities?.name || listing.city_name || ''}, ${listing.districts?.name || listing.district_name || ''}`,
            image: listing.images?.[0] || listing.listing_images?.[0]?.url || '',
            images: listing.images || listing.listing_images?.map((img: any) => img.url) || [],
            user_id: listing.user_id,
            seller: {
              name: listing.users?.company_name || `${listing.users?.first_name || ''} ${listing.users?.last_name || ''}`.trim(),
              phone: listing.users?.phone || listing.seller_phone || '',
              is_corporate: listing.users?.is_corporate || false,
              company_name: listing.users?.company_name || ''
            },
            owner: {
              name: listing.users?.company_name || `${listing.users?.first_name || ''} ${listing.users?.last_name || ''}`.trim(),
              phone: listing.users?.phone || listing.seller_phone || ''
            },
            status: 'APPROVED' as const,
            createdAt: listing.created_at
          }));

          // Store bilgilerini oluştur
          const storeInfo: CorporateStoreData = {
            company_name: listings[0]?.users?.company_name || companyName,
            email: listings[0]?.users?.email || '',
            phone: listings[0]?.users?.phone || '',
            totalListings: formattedListings.length,
            listings: formattedListings
          };

          setStoreData(storeInfo);
        } else {
          setError('Mağaza verileri yüklenemedi');
        }
      } catch (error) {
        console.error('Store data fetch error:', error);
        setError('Mağaza verileri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [userId, companyName]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !storeData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Mağaza bulunamadı'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Mağaza Header */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Avatar sx={{ 
              width: { xs: 60, md: 80 }, 
              height: { xs: 60, md: 80 }, 
              bgcolor: alpha(theme.palette.primary.main, 0.1), 
              color: theme.palette.primary.main,
              fontSize: { xs: 24, md: 32 }
            }}>
              <StoreIcon sx={{ fontSize: { xs: 30, md: 40 } }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '1.5rem', md: '2.125rem' },
                    color: theme.palette.text.primary
                  }}
                >
                  {storeData.company_name}
                </Typography>
                <Chip 
                  icon={<StoreIcon sx={{ fontSize: 16 }} />} 
                  label="Kurumsal Mağaza" 
                  size="small"
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    border: 'none',
                    '& .MuiChip-icon': {
                      color: theme.palette.primary.main
                    }
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
                {storeData.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon 
                      fontSize="small" 
                      sx={{ color: theme.palette.text.secondary }}
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {storeData.email}
                    </Typography>
                  </Box>
                )}
                {storeData.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon 
                      fontSize="small" 
                      sx={{ color: theme.palette.text.secondary }}
                    />
                    <Typography 
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {storeData.phone}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          <Divider sx={{ mb: 3, borderColor: alpha(theme.palette.divider, 0.5) }} />

          {/* İstatistikler */}
                    <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' }, 
            gap: 3,
            mt: 3 
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 600, 
                  color: theme.palette.primary.main,
                  fontSize: { xs: '1.75rem', md: '3rem' }
                }}
              >
                {storeData.totalListings || 0}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  mt: 0.5,
                  fontWeight: 500
                }}
              >
                Toplam İlan
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 600, 
                  color: theme.palette.info.main,
                  fontSize: { xs: '1.75rem', md: '3rem' }
                }}
              >
                Aktif
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  mt: 0.5,
                  fontWeight: 500
                }}
              >
                Durum
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Mağaza İlanları */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Mağaza İlanları ({storeData.listings.length})
        </Typography>
        
        {storeData.listings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Bu mağazada henüz ilan bulunmuyor.
            </Typography>
          </Box>
        ) : (
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
                xl: 'repeat(4, 1fr)'
              },
              gap: 3,
              alignItems: "stretch"
            }}
          >
            {storeData.listings.map(listing => (
              <TruckCenterCard
                key={listing.id}
                listing={listing}
                onViewDetails={(id: string) => window.open(`/listing/${id}`, '_blank')}
                onSendMessage={(id: string) => window.open(`/real-time-messages?listing=${id}`, '_blank')}
                onReport={() => {}} // Store sayfasında rapor butonu gizli
                onFavoriteClick={() => {}} // Store sayfasında favorileme gizli
              />
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default CorporateStorePage;
