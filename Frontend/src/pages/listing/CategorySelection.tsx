import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import UserHeader from '../../components/layout/UserHeader';

// API'den gelecek vehicle_types interface'i
interface VehicleType {
  id: string;
  name: string;
  category_id: string;
  image_url?: string;
  categories?: {
    id: string;
    name: string;
  };
}

interface ApiResponse {
  success: boolean;
  data: VehicleType[];
}

// Kategori isimleri ve resim dosyalarının eşleşmesi
const categoryImageMap: { [key: string]: string } = {
  'Çekici': '/CategoryImage/Çekici.png',
  'Dorse': '/CategoryImage/Dorse.png',
  'Kamyon & Kamyonet': '/CategoryImage/KamyonKamyonet.png',
  'Karoser & Üst Yapı': '/CategoryImage/KarosetÜstYapı.png',
  'Minibüs & Midibüs': '/CategoryImage/MinibüsMidibüs.png',
  'Otobüs': '/CategoryImage/Otobüs.png',
  'Oto Kurtarıcı & Taşıyıcı': '/CategoryImage/OtoKurtarıcıTaşıyıcı.png',
  'Römork': '/CategoryImage/Römork.png',
};

const CategorySelection: React.FC = () => {
  const navigate = useNavigate();
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  const fetchVehicleTypes = async () => {
    try {
      setError(null);
      const response = await fetch('http://localhost:3005/api/categories/vehicle-types/all');
      
      if (!response.ok) {
        throw new Error('Araç türleri alınamadı');
      }
      
      const data: ApiResponse = await response.json();
      
      // API response formatını kontrol et
      if (data.success && data.data) {
        setVehicleTypes(data.data);
      } else {
        throw new Error('Veri formatı hatalı');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      
      // Fallback: hardcoded data kullan
      setVehicleTypes([
        { id: '1', name: 'Çekici', category_id: '1' },
        { id: '2', name: 'Dorse', category_id: '1' },
        { id: '3', name: 'Kamyon & Kamyonet', category_id: '1' },
        { id: '4', name: 'Karoser & Üst Yapı', category_id: '1' },
        { id: '5', name: 'Minibüs & Midibüs', category_id: '1' },
        { id: '6', name: 'Otobüs', category_id: '1' },
        { id: '7', name: 'Oto Kurtarıcı & Taşıyıcı', category_id: '1' },
        { id: '8', name: 'Römork', category_id: '1' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (vehicleType: VehicleType) => {
    // Marka seçim sayfasına yönlendir
    navigate(`/brand-selection/${vehicleType.id}`, {
      state: { vehicleType }
    });
  };

  const getImagePath = (vehicleTypeName: string): string => {
    // Exact match first
    if (categoryImageMap[vehicleTypeName]) {
      return categoryImageMap[vehicleTypeName];
    }

    // Partial match
    for (const [key, imagePath] of Object.entries(categoryImageMap)) {
      if (vehicleTypeName.toLowerCase().includes(key.toLowerCase())) {
        return imagePath;
      }
    }

    // Varsayılan resim
    return '/CategoryImage/KamyonKamyonet.png';
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <UserHeader />
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="50vh"
        >
          <CircularProgress size={60} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header - Ana sayfadaki gibi */}
      <UserHeader />

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            color: '#0f172a',
            textAlign: 'center',
            mb: 1
          }}
        >
          Araç Kategorisi Seçin
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#64748b',
            textAlign: 'center',
            mb: 4
          }}
        >
          İlan vermek istediğiniz araç tipini seçerek devam edin
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: 3
          }}
        >
          {vehicleTypes.map((vehicleType) => (
            <Box key={vehicleType.id}>
              <Card
                onClick={() => handleCategorySelect(vehicleType)}
                sx={{
                  cursor: 'pointer',
                  height: 200,
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid #e5e7eb',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                    '& .overlay': {
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    },
                    '& .card-content': {
                      transform: 'translateY(-5px)',
                    }
                  },
                }}
              >
                {/* Background Image */}
                <Box
                  component="img"
                  src={vehicleType.image_url || getImagePath(vehicleType.name)}
                  alt={vehicleType.name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getImagePath(vehicleType.name);
                  }}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                />
                
                {/* Dark Overlay */}
                <Box
                  className="overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    transition: 'background-color 0.3s ease',
                  }}
                />
                
                {/* Content on top */}
                <CardContent
                  className="card-content"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    color: 'white',
                    textAlign: 'center',
                    p: 3,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    sx={{ 
                      fontWeight: 700,
                      mb: 0.5,
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      fontSize: '1.1rem'
                    }}
                  >
                    {vehicleType.name}
                  </Typography>
                  {vehicleType.categories && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        opacity: 0.9,
                        fontSize: '0.85rem',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                      }}
                    >
                      {vehicleType.categories.name}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {vehicleTypes.length === 0 && !loading && !error && (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              Henüz araç kategorisi bulunmuyor.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default CategorySelection;
