import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Skeleton,
  Alert,
  Chip,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import TruckCenterCard from '../../components/cards/TruckCenterCard';
import { SimpleListing } from '../../context/ListingContext';

type FavListing = {
  id: string;
  title: string;
  price: number;
  km?: number;
  year?: number;
  images?: string[];
  city_name?: string;
  district_name?: string;
  created_at?: string;
  seller_phone?: string;
};

// FavListing'i SimpleListing formatına dönüştür
const convertToSimpleListing = (item: FavListing): SimpleListing => {
  console.log('🔍 Converting FavListing to SimpleListing:', item); // Debug için
  console.log('🔍 seller_phone:', item.seller_phone); // Debug için
  
  return {
    id: item.id,
    title: item.title,
    price: item.price,
    category: '', // FavListing'de yok
    brand: '', // FavListing'de yok
    model: '', // FavListing'de yok
    year: item.year || new Date().getFullYear(),
    km: item.km || 0,
    location: [item.city_name, item.district_name].filter(Boolean).join(', ') || '',
    image: item.images?.[0] || '',
    images: item.images || [],
    user_id: 'unknown', // Favorites'ta kendi ilanımız olmaz genelde
    seller: {
      name: 'İlan Sahibi',
      phone: item.seller_phone || ''
    },
    owner: {
      name: 'İlan Sahibi', // Backend'den gelmiyorsa default
      phone: item.seller_phone || ''
    },
    status: 'APPROVED' as const,
    createdAt: item.created_at || new Date().toISOString()
  };
};

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { favorites, loading, removeFromFavorites, fetchFavorites } = useFavorites();

  const [items, setItems] = useState<FavListing[]>([]);
  const [hydrating, setHydrating] = useState(false);

  // header'dan gelince tazele
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // join varsa direkt kullan; yoksa hydrate
  useEffect(() => {
    if (!isAuthenticated) return;

    const hasJoined = favorites.some(f => !!f.listing);
    if (hasJoined) {
      console.log('🔍 Favorites with join:', favorites); // Debug için
      setItems(
        favorites.map(f => {
          console.log('🔍 Favorite listing:', f.listing); // Debug için
          console.log('🔍 seller_phone from join:', f.listing!.seller_phone); // Debug için
          return {
            id: f.listing!.id,
            title: f.listing!.title,
            price: f.listing!.price,
            km: f.listing!.km,
            year: f.listing!.year,
            images: f.listing!.images,
            city_name: f.listing!.city_name,
            district_name: f.listing!.district_name,
            created_at: f.listing!.created_at,
            seller_phone: f.listing!.seller_phone // Backend'den geliyor
          };
        })
      );
      return;
    }

    const run = async () => {
      setHydrating(true);
      try {
        const results = await Promise.all(
          favorites.map(async f => {
            const res = await api.get(`/listings/${f.listing_id}`);
            const l = res.data;
            console.log('🔍 Listing data:', l); // Debug için
            console.log('🔍 seller_phone:', l.seller_phone); // Debug için
            console.log('🔍 users.phone:', l.users?.phone); // Debug için
            return {
              id: l.id,
              title: l.title,
              price: +l.price,
              km: l.km,
              year: l.year,
              images: l.listing_images?.map((img: any) => img.url) || [],
              city_name: l.cities?.name,
              district_name: l.districts?.name,
              created_at: l.created_at,
              seller_phone: l.seller_phone || l.users?.phone // seller_phone veya users.phone
            } as FavListing;
          })
        );
        setItems(results);
      } catch (e) {
        console.error('Favori ilanları yüklenemedi', e);
      } finally {
        setHydrating(false);
      }
    };
    if (favorites.length) run();
    else setItems([]);
  }, [favorites, isAuthenticated]);

  const busy = loading || hydrating;

  const handleRemove = async (listingId: string) => {
    await removeFromFavorites(listingId);
    setItems(prev => prev.filter(i => i.id !== listingId));
  };

  const openDetails = (listingId: string) => navigate(`/listing/${listingId}`);

  // ---------- UI ----------
  if (busy) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 3 }}>
          Favorilerim
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 3,
            justifyItems: 'center'
          }}
        >
          {[...Array(6)].map((_, i) => (
            <Box key={i} sx={{ width: 420, height: 260, borderRadius: 3, overflow: 'hidden' }}>
              <Skeleton variant="rectangular" width="100%" height="100%" />
            </Box>
          ))}
        </Box>
      </Container>
    );
  }

  if (!items.length) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 2 }}>
          Favorilerim
        </Typography>
        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
          Henüz favori ilanınız yok. İlan kartlarından "Kaydet"e basarak ekleyebilirsiniz.
        </Alert>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')} 
            sx={{ bgcolor: '#E14D43', '&:hover': { bgcolor: '#D34237' } }}
          >
            İlanları Keşfet
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
          Favorilerim
        </Typography>
        <Chip 
          label={`${items.length} ilan`} 
          sx={{ bgcolor: '#E14D43', color: 'white', fontWeight: 700 }} 
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 3,
          justifyItems: 'center'
        }}
      >
        {items.map(item => (
          <TruckCenterCard
            key={item.id}
            listing={convertToSimpleListing(item)}
            onViewDetails={openDetails}
            onFavoriteClick={(listingId) => handleRemove(listingId)}
          />
        ))}
      </Box>
    </Container>
  );
};

export default FavoritesPage;
