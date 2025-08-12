import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Pagination,
  TextField,
  MenuItem,
  InputAdornment,
  Skeleton,
} from '@mui/material';
import { Search, LocationOn, CalendarToday, AttachMoney } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Listing } from '@/types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    setTimeout(() => {
      const mockListings: Listing[] = Array.from({ length: 9 }, (_, i) => ({
        id: `listing-${i + 1}`,
        title: `${i % 2 === 0 ? 'Kamyon' : 'Otobüs'} İlanı ${i + 1}`,
        description: `Bu bir örnek ${i % 2 === 0 ? 'kamyon' : 'otobüs'} ilanıdır. Detaylı açıklama buraya gelecek.`,
        price: (i + 1) * 50000,
        categoryId: `cat-${i % 3 + 1}`,
        category: {
          id: `cat-${i % 3 + 1}`,
          name: i % 3 === 0 ? 'Kamyon' : i % 3 === 1 ? 'Otobüs' : 'Minibüs',
          slug: i % 3 === 0 ? 'kamyon' : i % 3 === 1 ? 'otobus' : 'minibus',
          createdAt: new Date(),
        },
        userId: `user-${i + 1}`,
        user: {
          id: `user-${i + 1}`,
          email: `user${i + 1}@example.com`,
          username: `user${i + 1}`,
          firstName: `İsim${i + 1}`,
          lastName: `Soyisim${i + 1}`,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        images: [`https://via.placeholder.com/300x200?text=${i % 2 === 0 ? 'Kamyon' : 'Otobüs'}+${i + 1}`],
        location: `${['İstanbul', 'Ankara', 'İzmir'][i % 3]}, Türkiye`,
        status: 'APPROVED' as any,
        isApproved: true,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      }));
      
      setListings(mockListings);
      setTotalPages(3);
      setLoading(false);
    }, 1000);
  }, [page]);

  const handleListingClick = (id: string) => {
    navigate(`/listing/${id}`);
  };

  const handleSearch = () => {
    // Implement search logic
    console.log('Search:', { searchTerm, categoryFilter, locationFilter });
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
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          TruckBus
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Türkiye'nin En Büyük Kamyon ve Otobüs İlanları Platformu
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Binlerce ilan arasından size uygun aracı bulun
        </Typography>
      </Box>

      {/* Search Filters */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 4, 
        flexWrap: 'wrap',
        justifyContent: 'center',
        bgcolor: 'background.paper',
        p: 3,
        borderRadius: 2,
        boxShadow: 1
      }}>
        <TextField
          placeholder="Ne arıyorsunuz?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
        
        <TextField
          select
          label="Kategori"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Tümü</MenuItem>
          <MenuItem value="kamyon">Kamyon</MenuItem>
          <MenuItem value="otobus">Otobüs</MenuItem>
          <MenuItem value="minibus">Minibüs</MenuItem>
        </TextField>
        
        <TextField
          select
          label="Şehir"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Tümü</MenuItem>
          <MenuItem value="istanbul">İstanbul</MenuItem>
          <MenuItem value="ankara">Ankara</MenuItem>
          <MenuItem value="izmir">İzmir</MenuItem>
        </TextField>
        
        <Button 
          variant="contained" 
          onClick={handleSearch}
          sx={{ px: 4 }}
        >
          Ara
        </Button>
      </Box>

      {/* Listings Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: '1fr 1fr', 
          md: '1fr 1fr 1fr' 
        }, 
        gap: 3,
        mb: 4 
      }}>
        {loading ? (
          // Loading skeletons
          Array.from({ length: 9 }).map((_, i) => (
            <Card key={i} sx={{ maxWidth: '100%' }}>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" sx={{ fontSize: '1.5rem' }} />
                <Skeleton variant="text" />
                <Skeleton variant="text" width="60%" />
              </CardContent>
            </Card>
          ))
        ) : (
          listings.map((listing) => (
            <Card 
              key={listing.id} 
              sx={{ 
                maxWidth: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => handleListingClick(listing.id)}
            >
              <CardMedia
                component="img"
                height="200"
                image={listing.images[0]}
                alt={listing.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" component="h2" fontWeight="bold" noWrap>
                    {listing.title}
                  </Typography>
                  <Chip 
                    label={listing.category.name} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                </Box>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {listing.description}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AttachMoney color="success" />
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    {formatPrice(listing.price)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationOn color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {listing.location}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(listing.createdAt)}
                  </Typography>
                </Box>
              </CardContent>
              
              <CardActions>
                <Button size="small" color="primary">
                  Detayları Gör
                </Button>
                <Button size="small" color="secondary">
                  İletişim
                </Button>
              </CardActions>
            </Card>
          ))
        )}
      </Box>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          size="large"
        />
      </Box>
    </Container>
  );
};

export default HomePage;
