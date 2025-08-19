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
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UserHeader from '../../components/layout/UserHeader';

interface Variant {
  id: string;
  name: string;
  model_id: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  data: Variant[];
  count: number;
}

interface Model {
  id: string;
  name: string;
  brand_id: string;
}

interface Brand {
  id: string;
  name: string;
  image_url?: string;
}

const VariantSelection: React.FC = () => {
  const navigate = useNavigate();
  const { modelId } = useParams<{ modelId: string }>();
  const location = useLocation();
  const model = location.state?.model as Model;
  const brand = location.state?.brand as Brand;
  
  const [variants, setVariants] = useState<Variant[]>([]);
  const [filteredVariants, setFilteredVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (modelId) {
      fetchVariants();
    }
  }, [modelId]);

  useEffect(() => {
    const filtered = variants.filter(variant =>
      variant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVariants(filtered);
  }, [searchTerm, variants]);

  const fetchVariants = async () => {
    try {
      setError(null);
      const response = await fetch(`http://localhost:3005/api/categories/variants?model_id=${modelId}`);
      
      if (!response.ok) {
        throw new Error('Varyantlar alınamadı');
      }
      
      const data = await response.json();
      console.log('Variants API Response:', data);
      
      // Backend direkt array dönüyor
      if (Array.isArray(data)) {
        setVariants(data);
        setFilteredVariants(data);
      } else if (data.success && data.data) {
        setVariants(data.data);
        setFilteredVariants(data.data);
      } else {
        throw new Error('Veri formatı hatalı');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSelect = (variant: Variant) => {
    const vehicleType = location.state?.vehicleType;
    
    console.log('🚛 VariantSelect Debug:', {
      modelName: model?.name,
      variantName: variant.name,
      vehicleTypeName: vehicleType?.name,
      variantId: variant.id,
      brandName: brand?.name
    });
    
    // Damperli Dorse için özel yönlendirme - Dorse kategorisi kontrolü
    const isDamperliDorse = model?.name === 'Damperli' || 
                           variant.name.toLowerCase().includes('damperli') ||
                           vehicleType?.name?.toLowerCase().includes('dorse') ||
                           model?.name?.toLowerCase().includes('dorse') ||
                           brand?.name?.toLowerCase().includes('damper') ||
                           // URL'de damperli varsa
                           window.location.href.includes('damperli');
    
    if (isDamperliDorse) {
      let variantType = '';
      
      // Variant ismine göre tip belirleme - gerçek variant isimlerini kullan
      const variantNameLower = variant.name.toLowerCase();
      
      if (variantNameLower.includes('kapaklı') || variantNameLower.includes('kapakli') || 
          variantNameLower.includes('kapak') || variantNameLower === 'kapaklı tip') {
        variantType = 'kapakli-tip';
      } else if (variantNameLower.includes('kaya') || variantNameLower === 'kaya tipi') {
        variantType = 'kaya-tipi';
      } else if (variantNameLower.includes('hafriyat') || variantNameLower === 'hafriyat tipi') {
        variantType = 'hafriyat-tipi';
      } else if (variantNameLower.includes('havuz') || variantNameLower.includes('hardox') || 
                 variantNameLower === 'havuz (hardox) tipi') {
        variantType = 'havuz-hardox-tipi';
      } else {
        // Variant ID'sine göre de kontrol edelim
        if (variant.id === 'cme6bt060000f40qa8syjxrwu') {
          variantType = 'kapakli-tip'; // İlk variant Kapaklı Tip olsun
        } else {
          variantType = 'kapakli-tip'; // Default
        }
      }
      
      console.log('🚛 Damperli Dorse yönlendirme:', variantType);
      
      navigate(`/create-ad/dorse/damperli/${variantType}`, {
        state: { 
          variant,
          model,
          brand,
          vehicleType,
          variantType,
          selection: {
            vehicleType,
            brand,
            model,
            variant
          }
        }
      });
      return;
    }
    
    // Vehicle type'a göre doğru form sayfasına yönlendir
    if (vehicleType?.name === 'Minibüs & Midibüs') {
      navigate(`/create-ad/minibus/${variant.id}`, {
        state: { 
          variant,
          model,
          brand,
          vehicleType,
          selection: {
            vehicleType,
            brand,
            model,
            variant
          }
        }
      });
    } else if (vehicleType?.name === 'Kamyon & Kamyonet') {
      navigate(`/create-ad/kamyon/${variant.id}`, {
        state: { 
          variant,
          model,
          brand,
          vehicleType,
          selection: {
            vehicleType,
            brand,
            model,
            variant
          }
        }
      });
    } else if (vehicleType?.name === 'Otobüs') {
      navigate(`/create-ad/otobus/${variant.id}`, {
        state: { 
          variant,
          model,
          brand,
          vehicleType,
          selection: {
            vehicleType,
            brand,
            model,
            variant
          }
        }
      });
    } else if (vehicleType?.name === 'Çekici') {
      navigate(`/create-ad/cekici/${variant.id}`, {
        state: { 
          variant,
          model,
          brand,
          vehicleType,
          selection: {
            vehicleType,
            brand,
            model,
            variant
          }
        }
      });
    } else {
      // Diğer kategoriler için genel form (henüz oluşturulmamış)
      navigate('/create-listing', {
        state: { 
          variant,
          model,
          brand,
          vehicleType,
          selection: {
            vehicleType,
            brand,
            model,
            variant
          }
        }
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <UserHeader />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh'
        }}>
          <CircularProgress size={40} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <UserHeader />

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
          {model?.name || 'Varyant Seçimi'}
        </Typography>

        <Typography 
          variant="subtitle1" 
          align="center" 
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          {brand?.name} - Toplam {filteredVariants.length} varyant mevcut
        </Typography>

        {/* Search Bar */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <TextField
            placeholder="Varyant ara..."
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
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Variants Grid */}
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
          {filteredVariants.map((variant) => (
            <Card
              key={variant.id}
              onClick={() => handleVariantSelect(variant)}
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
                {variant.name}
              </Typography>
            </Card>
          ))}
        </Box>

        {/* No Results */}
        {filteredVariants.length === 0 && !loading && !error && (
          <Box textAlign="center" sx={{ mt: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Aradığınız kriterlere uygun varyant bulunamadı
            </Typography>
            <Button
              variant="contained"
              onClick={() => handleVariantSelect({ 
                id: 'custom', 
                name: 'Diğer/Belirtilmemiş',
                model_id: modelId || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })}
              sx={{ mt: 2 }}
            >
              Diğer/Belirtilmemiş Seçeneği ile Devam Et
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default VariantSelection;
