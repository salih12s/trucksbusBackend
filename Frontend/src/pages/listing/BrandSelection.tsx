import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UserHeader from '../../components/layout/UserHeader';

interface Brand {
  id: string;
  name: string;
  image_url?: string;
  vehicle_type_id: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  data: Brand[];
  count: number;
}

interface VehicleType {
  id: string;
  name: string;
  image_url?: string;
}

const BrandSelection: React.FC = () => {
  const navigate = useNavigate();
  const { vehicleTypeId } = useParams<{ vehicleTypeId: string }>();
  const location = useLocation();
  const vehicleType = location.state?.vehicleType as VehicleType;
  
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fallback data for brands
  const fallbackBrands: Brand[] = [
    { id: '1', name: 'Ford', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/FORD.png', created_at: '', updated_at: '' },
    { id: '2', name: 'Mercedes', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Mercedes.png', created_at: '', updated_at: '' },
    { id: '3', name: 'Volvo', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Volvo.png', created_at: '', updated_at: '' },
    { id: '4', name: 'Scania', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Scania.png', created_at: '', updated_at: '' },
    { id: '5', name: 'MAN', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/MAN.png', created_at: '', updated_at: '' },
    { id: '6', name: 'DAF', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/DAF.png', created_at: '', updated_at: '' },
    { id: '7', name: 'Iveco', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Iveco-Otoyol.png', created_at: '', updated_at: '' },
    { id: '8', name: 'Renault', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Renault.png', created_at: '', updated_at: '' },
    { id: '9', name: 'Isuzu', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Isuzu.png', created_at: '', updated_at: '' },
    { id: '10', name: 'BMC', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/BMC.png', created_at: '', updated_at: '' },
  ];

  useEffect(() => {
    if (vehicleTypeId) {
      fetchBrands();
    }
  }, [vehicleTypeId]);

  useEffect(() => {
    const filtered = brands.filter(brand =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBrands(filtered);
  }, [searchTerm, brands]);

  const fetchBrands = async () => {
    try {
      setError(null);
      const response = await fetch(`http://localhost:3005/api/categories/vehicle-types/${vehicleTypeId}/brands`);
      
      if (!response.ok) {
        throw new Error('Markalar alınamadı');
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        setBrands(data.data);
        setFilteredBrands(data.data);
      } else {
        // API'den veri gelmezse fallback kullan
        setBrands(fallbackBrands);
        setFilteredBrands(fallbackBrands);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      // Hata durumunda fallback kullan
      setBrands(fallbackBrands);
      setFilteredBrands(fallbackBrands);
      setError('Markalar yüklenirken bir hata oluştu. Varsayılan veriler gösteriliyor.');
    } finally {
      setLoading(false);
    }
  };

  const handleBrandSelect = (brand: Brand) => {
    navigate(`/model-selection/${brand.id}`, {
      state: { brand, vehicleType }
    });
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <UserHeader />
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#f8f9fa'
    }}>
      {/* Header */}
      <UserHeader />

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
        {/* Title */}
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: 'bold',
            color: '#333',
            mb: 1
          }}
        >
          {vehicleType?.name || 'Marka Seçimi'}
        </Typography>

        <Typography 
          variant="subtitle1" 
          align="center" 
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Toplam {filteredBrands.length} marka mevcut
        </Typography>

        {/* Search Bar */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <TextField
            placeholder="Marka ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            sx={{
              width: '100%',
              maxWidth: 500,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#f8f9fa',
                border: 'none !important',
                outline: 'none !important',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '& fieldset': {
                  border: 'none !important',
                  borderColor: 'transparent !important',
                },
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '& fieldset': {
                    border: 'none !important',
                    borderColor: 'transparent !important',
                  },
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  '& fieldset': {
                    border: 'none !important',
                    borderColor: 'transparent !important',
                  },
                },
                '&.Mui-focused fieldset': {
                  border: 'none !important',
                  borderColor: 'transparent !important',
                },
                '& input': {
                  padding: '14px 16px',
                  fontSize: '16px',
                  outline: 'none !important',
                  border: 'none !important',
                  '&:focus': {
                    outline: 'none !important',
                    border: 'none !important',
                    boxShadow: 'none !important',
                  },
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#666', ml: 1 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Brands Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
              lg: 'repeat(5, 1fr)',
            },
            gap: 2,
          }}
        >
          {filteredBrands.map((brand) => (
            <Card
              key={brand.id}
              onClick={() => handleBrandSelect(brand)}
              sx={{
                cursor: 'pointer',
                height: 120,
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                border: '2px solid transparent',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                  border: '2px solid #1976d2',
                },
              }}
            >
              {brand.image_url ? (
                <Box
                  component="img"
                  src={brand.image_url}
                  alt={brand.name}
                  sx={{
                    width: '100%',
                    height: '70px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  }}
                />
              ) : (
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    color: '#333',
                    fontWeight: 600,
                    textAlign: 'center',
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {brand.name}
                </Typography>
              )}
            </Card>
          ))}
        </Box>

        {/* No Results */}
        {filteredBrands.length === 0 && !loading && !error && (
          <Box textAlign="center" sx={{ mt: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Aradığınız kriterlere uygun marka bulunamadı
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default BrandSelection;
