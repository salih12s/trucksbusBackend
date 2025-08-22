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
import api from '../../services/api';

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

  // Fallback data for brands - Kamyon & Kamyonet markaları (updated with correct image paths)
  const fallbackBrands: Brand[] = [
    { id: '1', name: 'Aixam', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Axiam.png', created_at: '', updated_at: '' },
    { id: '2', name: 'Akeso', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Akeso.png', created_at: '', updated_at: '' },
    { id: '3', name: 'Alke', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Alke.png', created_at: '', updated_at: '' },
    { id: '4', name: 'Anadol', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Anadol-logo.png', created_at: '', updated_at: '' },
    { id: '5', name: 'Askam', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Askam.png', created_at: '', updated_at: '' },
    { id: '6', name: 'Astra', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Astra.png', created_at: '', updated_at: '' },
    { id: '7', name: 'Avia', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Avıa.png', created_at: '', updated_at: '' },
    { id: '8', name: 'Bedford', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Bedford.png', created_at: '', updated_at: '' },
    { id: '9', name: 'Beemobs', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Beemobs.png', created_at: '', updated_at: '' },
    { id: '10', name: 'BMC', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/BMC.png', created_at: '', updated_at: '' },
    { id: '11', name: 'Cenntro', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Centro.png', created_at: '', updated_at: '' },
    { id: '12', name: 'Chrysler', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Crhysler.png', created_at: '', updated_at: '' },
    { id: '13', name: 'Citroen', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Citroen.png', created_at: '', updated_at: '' },
    { id: '14', name: 'CMC', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/CMC.png', created_at: '', updated_at: '' },
    { id: '15', name: 'Dacia', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Dacia.png', created_at: '', updated_at: '' },
    { id: '16', name: 'Daewoo', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Daewoo.png', created_at: '', updated_at: '' },
    { id: '17', name: 'DAF', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/DAF.png', created_at: '', updated_at: '' },
    { id: '18', name: 'Daihatsu', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Daihatsu.png', created_at: '', updated_at: '' },
    { id: '19', name: 'DFM', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/DFM.png', created_at: '', updated_at: '' },
    { id: '20', name: 'DFSK', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/DFSK.png', created_at: '', updated_at: '' },
    { id: '21', name: 'Dodge', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/dodge.png', created_at: '', updated_at: '' },
    { id: '22', name: 'Dongfeng', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Dongfeng-logo.png', created_at: '', updated_at: '' },
    { id: '23', name: 'FAW', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/FAW.png', created_at: '', updated_at: '' },
    { id: '24', name: 'Fiat', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Fiat.png', created_at: '', updated_at: '' },
    { id: '25', name: 'Folkvan', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/folkvan.png', created_at: '', updated_at: '' },
    { id: '26', name: 'Ford Trucks', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/FORD.png', created_at: '', updated_at: '' },
    { id: '27', name: 'GAZ', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/GAZ.png', created_at: '', updated_at: '' },
    { id: '28', name: 'Green Car', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/GreenCar.png', created_at: '', updated_at: '' },
    { id: '29', name: 'HFKanuni', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/HFKanuni.webp', created_at: '', updated_at: '' },
    { id: '30', name: 'Hino', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Hino.png', created_at: '', updated_at: '' },
    { id: '31', name: 'Hyundai', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Hyundai.png', created_at: '', updated_at: '' },
    { id: '32', name: 'International', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/International.png', created_at: '', updated_at: '' },
    { id: '33', name: 'Isuzu', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Isuzu.png', created_at: '', updated_at: '' },
    { id: '34', name: 'Iveco', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Iveco-Otoyol.png', created_at: '', updated_at: '' },
    { id: '35', name: 'JAC', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Jac-motors.png', created_at: '', updated_at: '' },
    { id: '36', name: 'Junda', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Junda.png', created_at: '', updated_at: '' },
    { id: '37', name: 'Kia', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Kia-logo.png', created_at: '', updated_at: '' },
    { id: '38', name: 'Kuba', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/kuba.png', created_at: '', updated_at: '' },
    { id: '39', name: 'Lada', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/lada.png', created_at: '', updated_at: '' },
    { id: '40', name: 'MAN', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/MAN.png', created_at: '', updated_at: '' },
    { id: '41', name: 'Maxus', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/maxus.png', created_at: '', updated_at: '' },
    { id: '42', name: 'MAZ', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/MAZ.png', created_at: '', updated_at: '' },
    { id: '43', name: 'Mazda', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/mazda.png', created_at: '', updated_at: '' },
    { id: '44', name: 'Mercedes-Benz', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Mercedes.png', created_at: '', updated_at: '' },
    { id: '45', name: 'Mitsubishi – Fuso', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Mitsubishi.png', created_at: '', updated_at: '' },
    { id: '46', name: 'Mitsubishi – Temsa', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/MitsubishiTemsa.jpg', created_at: '', updated_at: '' },
    { id: '47', name: 'Musatti', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/MUSATTİ.png', created_at: '', updated_at: '' },
    { id: '48', name: 'Nissan', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/nissan.png', created_at: '', updated_at: '' },
    { id: '49', name: 'Opel', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/OpelLogo.png', created_at: '', updated_at: '' },
    { id: '50', name: 'Ortimobil', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Ortimobil.png', created_at: '', updated_at: '' },
    { id: '51', name: 'Otokar', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Otokar.png', created_at: '', updated_at: '' },
    { id: '52', name: 'Peugeot', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Peugeot.png', created_at: '', updated_at: '' },
    { id: '53', name: 'Piaggio', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Piaggio-Logo.png', created_at: '', updated_at: '' },
    { id: '54', name: 'Pilotcar', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Pilotcar.png', created_at: '', updated_at: '' },
    { id: '55', name: 'Proton', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Proton.png', created_at: '', updated_at: '' },
    { id: '56', name: 'Regis', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Regis.png', created_at: '', updated_at: '' },
    { id: '57', name: 'Renault Trucks', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Renault.png', created_at: '', updated_at: '' },
    { id: '58', name: 'Runhorse', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Runhorse.png', created_at: '', updated_at: '' },
    { id: '59', name: 'Samsung', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Samsung.png', created_at: '', updated_at: '' },
    { id: '60', name: 'Sany', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Sany.png', created_at: '', updated_at: '' },
    { id: '61', name: 'Scania', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Scanıa.png', created_at: '', updated_at: '' },
    { id: '62', name: 'Shifeng', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Shifeng.png', created_at: '', updated_at: '' },
    { id: '63', name: 'Sinotruk', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Sinotruk.png', created_at: '', updated_at: '' },
    { id: '64', name: 'Skoda', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Skoda.png', created_at: '', updated_at: '' },
    { id: '65', name: 'Suzuki', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Suzuki.png', created_at: '', updated_at: '' },
    { id: '66', name: 'Tata', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/TataLogo.png', created_at: '', updated_at: '' },
    { id: '67', name: 'Tatra', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Tatra.png', created_at: '', updated_at: '' },
    { id: '68', name: 'Tenax', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Tenax.png', created_at: '', updated_at: '' },
    { id: '69', name: 'Toyota', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Toyoto.png', created_at: '', updated_at: '' },
    { id: '70', name: 'Victory', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Victory.png', created_at: '', updated_at: '' },
    { id: '71', name: 'Volkswagen', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Volkswagen_logo.png', created_at: '', updated_at: '' },
    { id: '72', name: 'Volvo', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/Volvo.png', created_at: '', updated_at: '' },
    { id: '73', name: 'Diğer Markalar', vehicle_type_id: vehicleTypeId!, image_url: '/ModelImage/DigerMarkalar.png', created_at: '', updated_at: '' },
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
      console.log('🔍 Fetching brands for vehicle type:', vehicleTypeId);
      
      const response = await api.get(`/categories/brands?vehicle_type_id=${vehicleTypeId}`);
      const data = response.data;
      
      console.log('📦 Brands API Response:', data);
      console.log('📊 Data type and length:', typeof data, Array.isArray(data) ? data.length : 'not array');
      
      // Backend direkt array dönüyor
      if (Array.isArray(data) && data.length > 0) {
        console.log('✅ Using API data:', data.length, 'brands');
        setBrands(data);
        setFilteredBrands(data);
      } else if (data.success && data.data && data.data.length > 0) {
        console.log('✅ Using API data from success wrapper:', data.data.length, 'brands');
        setBrands(data.data);
        setFilteredBrands(data.data);
      } else {
        // API'den veri gelmezse fallback kullan
        console.warn('⚠️ No API data, using fallback brands:', fallbackBrands.length);
        setBrands(fallbackBrands);
        setFilteredBrands(fallbackBrands);
      }
    } catch (err) {
      console.error('❌ Fetch error:', err);
      // Hata durumunda fallback kullan
      console.warn('⚠️ Error occurred, using fallback brands:', fallbackBrands.length);
      setBrands(fallbackBrands);
      setFilteredBrands(fallbackBrands);
      setError('Markalar yüklenirken bir hata oluştu. Varsayılan veriler gösteriliyor.');
    } finally {
      setLoading(false);
    }
  };

  const handleBrandSelect = async (brand: Brand) => {
    if (!brand?.id) {
      console.warn('⚠️ Invalid brand selected:', brand);
      return;
    }

    // Dorse kategorisi için özel yönlendirme
    if (vehicleType?.name === 'Dorse') {
      try {
        console.log('🔍 Fetching models for Dorse brand:', brand.id);
        const response = await api.get(`/categories/models?brand_id=${brand.id}`);
        const models = response.data;
        
        console.log('✅ Parsed models:', models);
        
        if (Array.isArray(models) && models.length > 0) {
          const model = models[0];
          navigate(`/variant-selection/${model.id}`, {
            state: { model, brand, vehicleType }
          });
          return;
        }
      } catch (error) {
        console.error('❌ Model alınırken hata:', error);
        // Fallback to normal flow
      }
    }

    // Römork kategorisi için özel yönlendirme
    if (vehicleType?.name === 'Römork') {
      // Kamyon Römorkları ve Özel Amaçlı Römorklar direkt variant'a git (tek model var)
      if (brand.name === 'Kamyon Römorkları' || brand.name === 'Özel Amaçlı Römorklar') {
        try {
          const response = await api.get(`/categories/models?brand_id=${brand.id}`);
          const models = response.data;
          
          console.log('✅ Parsed römork models:', models);
          
          if (Array.isArray(models) && models.length > 0) {
            const model = models[0];
            navigate(`/variant-selection/${model.id}`, {
              state: { model, brand, vehicleType }
            });
            return;
          }
        } catch (error) {
          console.error('❌ Model alınırken hata (römork):', error);
        }
      }
      // Tarım ve Taşıma Römorkları normal model seçimine git (çoklu model var)
    }

    // Oto Kurtarıcı & Taşıyıcı kategorisi için özel yönlendirme
    if (vehicleType?.name === 'Oto Kurtarıcı & Taşıyıcı') {
      // Tüm markalar direkt variant'a git (tek model var, marka adıyla aynı)
      try {
        const response = await api.get(`/categories/models?brand_id=${brand.id}`);
        const models = response.data;
        
        console.log('✅ Parsed oto kurtarıcı models:', models);
        
        if (Array.isArray(models) && models.length > 0) {
          const model = models[0];
          navigate(`/variant-selection/${model.id}`, {
            state: { model, brand, vehicleType }
          });
          return;
        }
      } catch (error) {
        console.error('❌ Model alınırken hata (oto kurtarıcı):', error);
      }
    }
    
    // Diğer kategoriler için normal akış
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
                height: 140,
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                border: '2px solid #e0e0e0',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                '&:hover': {
                  transform: 'translateY(-6px) scale(1.02)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  border: '2px solid #1976d2',
                  '& img': {
                    transform: 'scale(1.05)',
                  },
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
                    height: '80%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    transition: 'transform 0.2s ease',
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
