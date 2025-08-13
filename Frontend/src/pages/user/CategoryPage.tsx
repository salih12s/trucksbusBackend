import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Skeleton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { Home, NavigateNext } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Listing, Category } from '../../types';

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('');

  useEffect(() => {
    // Mock data based on category
    setTimeout(() => {
      const mockCategory: Category = {
        id: 'cat-1',
        name: slug === 'kamyon' ? 'Kamyon' : slug === 'otobus' ? 'Otobüs' : 'Minibüs',
        slug: slug || 'kamyon',
        description: `${slug === 'kamyon' ? 'Kamyon' : slug === 'otobus' ? 'Otobüs' : 'Minibüs'} ilanları`,
        createdAt: new Date(),
      };

      const mockListings: Listing[] = Array.from({ length: 12 }, (_, i) => ({
        id: `listing-${i + 1}`,
        title: `${mockCategory.name} İlanı ${i + 1}`,
        description: `Bu bir örnek ${mockCategory.name.toLowerCase()} ilanıdır.`,
        price: (i + 1) * 75000,
        categoryId: mockCategory.id,
        category: mockCategory,
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
        images: [`https://via.placeholder.com/300x200?text=${mockCategory.name}+${i + 1}`],
        location: `${['İstanbul', 'Ankara', 'İzmir', 'Bursa'][i % 4]}, Türkiye`,
        status: 'APPROVED' as any,
        isApproved: true,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      }));

      setCategory(mockCategory);
      setListings(mockListings);
      setTotalPages(3);
      setLoading(false);
    }, 500);
  }, [slug, page, sortBy, priceRange]);

  const handleListingClick = (id: string) => {
    navigate(`/listing/${id}`);
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

  if (loading || !category) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" sx={{ fontSize: '1.5rem' }} />
                <Skeleton variant="text" />
                <Skeleton variant="text" width="60%" />
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          underline="hover"
          color="inherit"
          component="button"
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            padding: 0,
            font: 'inherit'
          }}
          onClick={() => navigate('/')}
        >
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          Ana Sayfa
        </Link>
        <Typography color="text.primary">{category.name}</Typography>
      </Breadcrumbs>

      {/* Category Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          {category.name} İlanları
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {category.description}
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 4, 
        flexWrap: 'wrap',
        bgcolor: 'background.paper',
        p: 3,
        borderRadius: 2,
        boxShadow: 1
      }}>
        <TextField
          select
          label="Sıralama"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="newest">En Yeni</MenuItem>
          <MenuItem value="oldest">En Eski</MenuItem>
          <MenuItem value="price-low">Fiyat (Düşükten Yükseğe)</MenuItem>
          <MenuItem value="price-high">Fiyat (Yüksekten Düşüğe)</MenuItem>
        </TextField>
        
        <TextField
          select
          label="Fiyat Aralığı"
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Tümü</MenuItem>
          <MenuItem value="0-100000">0 - 100.000 TL</MenuItem>
          <MenuItem value="100000-500000">100.000 - 500.000 TL</MenuItem>
          <MenuItem value="500000-1000000">500.000 - 1.000.000 TL</MenuItem>
          <MenuItem value="1000000+">1.000.000 TL+</MenuItem>
        </TextField>
        
        <Button variant="outlined">
          Filtreleri Temizle
        </Button>
      </Box>

      {/* Results Count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {listings.length} ilan bulundu
      </Typography>

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
        {listings.map((listing) => (
          <Card 
            key={listing.id} 
            sx={{ 
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
                  label="YENİ" 
                  size="small" 
                  color="success" 
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
              
              <Typography variant="h6" color="success.main" fontWeight="bold" sx={{ mb: 1 }}>
                {formatPrice(listing.price)}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                📍 {listing.location}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                📅 {formatDate(listing.createdAt)}
              </Typography>
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
        ))}
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

export default CategoryPage;
