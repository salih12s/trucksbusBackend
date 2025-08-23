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

interface Model {
  id: string;
  name: string;
  brand_id: string;
  created_at: string;
  updated_at: string;
}

interface Brand {
  id: string;
  name: string;
  image_url?: string;
}

const ModelSelection: React.FC = () => {
  const navigate = useNavigate();
  const { brandId } = useParams<{ brandId: string }>();
  const location = useLocation();
  const brand = location.state?.brand as Brand;
  const vehicleType = location.state?.vehicleType;
  
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (brandId) {
      fetchModels();
    }
  }, [brandId]);

  useEffect(() => {
    const filtered = models.filter(model =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredModels(filtered);
  }, [searchTerm, models]);

  const fetchModels = async () => {
    try {
      setError(null);
      
      const response = await api.get(`/categories/models?brand_id=${brandId}`);
      const data = response.data;
      
      console.log('Models API Response:', data);
      
      // Backend direkt array dönüyor
      if (Array.isArray(data)) {
        setModels(data);
        setFilteredModels(data);
      } else if (data.success && data.data) {
        setModels(data.data);
        setFilteredModels(data.data);
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

  const handleModelSelect = (model: Model) => {
    navigate(`/variant-selection/${model.id}`, {
      state: { model, brand, vehicleType }
    });
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: '#f8f9fa'
      }}>
        <UserHeader />
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh'
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
          {brand?.name || 'Model Seçimi'}
        </Typography>

        <Typography 
          variant="subtitle1" 
          align="center" 
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Toplam {filteredModels.length} model mevcut
        </Typography>

        {/* Search Bar */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <TextField
            placeholder="Model ara..."
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

        {/* Models Grid */}
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
          {filteredModels.map((model) => (
            <Card
              key={model.id}
              onClick={() => handleModelSelect(model)}
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
                {model.name}
              </Typography>
            </Card>
          ))}
        </Box>

        {/* No Results */}
        {filteredModels.length === 0 && !loading && !error && (
          <Box textAlign="center" sx={{ mt: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Aradığınız kriterlere uygun model bulunamadı
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ModelSelection;
