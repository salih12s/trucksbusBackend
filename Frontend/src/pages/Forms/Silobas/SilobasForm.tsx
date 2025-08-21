import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../../context/AuthContext';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  InputAdornment,
  Card,
  Autocomplete,
  Stack,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  ArrowForward,
  ArrowBack,
  Upload,
  LocationOn,
  LocalShipping,
  Person,
  Phone,
  Email,
  CloudUpload,
  Close,
  AccountBalance,
} from '@mui/icons-material';
import { locationService, City, District } from '../../../services/locationService';
import { api } from '../../../services/api';
import { formatPhoneNumber } from '../../../utils/phoneUtils';

interface SilobasFormData {
  // Temel Bilgiler
  title: string;
  description: string;
  price: string;
  year: number;
  
  // Silobas Özel Bilgiler
  hacim: number; // m3
  gozSayisi: number;
  lastikDurumu: number; // yüzde
  renk: string;
  takasli: string; // "Evet" veya "Hayır"
  
  // Dolum Şekli
  alttan: boolean;
  usttan: boolean;
  
  // Konum
  city: string;
  district: string;
  
  // Fotoğraflar
  images: File[];
  
  // İletişim Bilgileri
  sellerName: string;
  phone: string;
  email: string;
  isCompany: boolean;
  companyName?: string;
  
  // Ekstra
  warranty: boolean;
  negotiable: boolean;
  exchange: boolean;
}

const steps = [
  'Silobas Bilgileri',
  'Teknik Özellikler',
  'Fotoğraflar',
  'İletişim & Fiyat'
];

const SilobasForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { variantId } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<SilobasFormData>({
    title: '',
    description: '',
    price: '',
    year: new Date().getFullYear(),
    hacim: 0,
    gozSayisi: 1,
    lastikDurumu: 100,
    renk: '',
    takasli: 'Hayır',
    alttan: false,
    usttan: false,
    city: '',
    district: '',
    images: [],
    sellerName: '',
    phone: '',
    email: '',
    isCompany: false,
    warranty: false,
    negotiable: false,
    exchange: false,
  });

  // Şehirleri yükle
  useEffect(() => {
    const loadCities = async () => {
      try {
        const cityData = await locationService.getCities();
        console.log('Cities loaded:', cityData.length);
        setCities(cityData);
      } catch (err) {
        console.error('Şehirler yüklenirken hata:', err);
        setError('Şehirler yüklenirken hata oluştu');
      }
    };
    loadCities();
  }, []);

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        sellerName: `${user.first_name} ${user.last_name}`,
        phone: user.phone || '',
        email: user.email || '',
        city: user.city || '',
        district: user.district || '',
      }));
    }
  }, [user]);

  // Fotoğraf yükleme için dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.slice(0, 15 - formData.images.length);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newFiles]
    }));
  }, [formData.images.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 15
  });

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleCityChange = async (cityId: string, cityName: string) => {
    console.log('City changed:', { cityId, cityName });
    setFormData(prev => ({ ...prev, city: cityName, district: '' }));
    setLoadingDistricts(true);
    
    try {
      const districtData = await locationService.getDistrictsByCity(cityId);
      console.log('Districts loaded:', districtData);
      setDistricts(districtData);
    } catch (err) {
      console.error('İlçeler yüklenirken hata:', err);
      setError('İlçeler yüklenirken hata oluştu');
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleInputChange = (field: keyof SilobasFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fotoğrafları base64'e dönüştür
      const imageDataUrls: string[] = [];
      
      for (const file of formData.images) {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        imageDataUrls.push(dataUrl);
      }

      const listingData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        year: formData.year,
        category_id: 'vehicle-category-001',
        vehicle_type_id: 'cme633w8v0001981ksnpl6dj5',
        variant_id: variantId,
        seller_name: formData.sellerName,
        seller_phone: formData.phone,
        seller_email: formData.email,
        city: formData.city,
        district: formData.district,
        is_exchangeable: formData.exchange,
        images: imageDataUrls,
        properties: {
          dorseType: 'Silobas',
          hacim: formData.hacim.toString(),
          gozSayisi: formData.gozSayisi.toString(),
          lastikDurumu: formData.lastikDurumu.toString(),
          renk: formData.renk,
          takasli: formData.takasli,
          alttan: formData.alttan ? 'Evet' : 'Hayır',
          usttan: formData.usttan ? 'Evet' : 'Hayır',
          warranty: formData.warranty ? 'Evet' : 'Hayır',
          negotiable: formData.negotiable ? 'Evet' : 'Hayır'
        }
      };

      const response = await api.post('/listings', listingData);
      
      if (response.data) {
        alert('İlanınız başarıyla oluşturuldu! Moderatör onayından sonra yayınlanacaktır.');
        navigate('/');
      }
    } catch (err: any) {
      console.error('İlan oluşturma hatası:', err);
      setError(err.response?.data?.message || 'İlan oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Silobas Bilgileri
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalance color="primary" />
              Silobas Bilgileri
            </Typography>
            
            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Örn: 2018 Model Silobas Dorse"
              required
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Açıklama"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Silobas aracınız hakkında detaylı bilgi verin..."
              required
            />
          </Stack>
        );

      case 1: // Teknik Özellikler
        return (
          <Stack spacing={3}>
            <Typography variant="h6" color="primary">
              Teknik Özellikler
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                type="number"
                label="Hacim"
                value={formData.hacim}
                onChange={(e) => handleInputChange('hacim', parseFloat(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">m³</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 0.1 }}
                required
              />

              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                type="number"
                label="Göz Sayısı"
                value={formData.gozSayisi}
                onChange={(e) => handleInputChange('gozSayisi', parseInt(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">ad</InputAdornment>,
                }}
                inputProps={{ min: 1 }}
                required
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                type="number"
                label="Lastik Durumu"
                value={formData.lastikDurumu}
                onChange={(e) => handleInputChange('lastikDurumu', parseInt(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                inputProps={{ min: 0, max: 100 }}
                required
              />

              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Renk"
                value={formData.renk}
                onChange={(e) => handleInputChange('renk', e.target.value)}
                placeholder="Örn: Beyaz, Kırmızı"
                required
              />
            </Box>

            <FormControl fullWidth required>
              <InputLabel>Takaslı</InputLabel>
              <Select
                value={formData.takasli}
                label="Takaslı"
                onChange={(e) => handleInputChange('takasli', e.target.value)}
              >
                <MenuItem value="Evet">Evet</MenuItem>
                <MenuItem value="Hayır">Hayır</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="h6" color="primary">
              Dolum Şekli
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.alttan}
                    onChange={(e) => handleInputChange('alttan', e.target.checked)}
                  />
                }
                label="Alttan Dolum"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.usttan}
                    onChange={(e) => handleInputChange('usttan', e.target.checked)}
                  />
                }
                label="Üstten Dolum"
              />
            </Box>
          </Stack>
        );

      case 2: // Fotoğraflar
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CloudUpload color="primary" />
              Fotoğraflar ({formData.images.length}/15)
            </Typography>
            
            {formData.images.length < 15 && (
              <Card
                {...getRootProps()}
                sx={{
                  p: 4,
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'grey.300',
                  backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                  cursor: 'pointer',
                  textAlign: 'center',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <input {...getInputProps()} />
                <Upload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {isDragActive ? 'Fotoğrafları buraya bırakın' : 'Fotoğraf Yükleyin'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fotoğrafları sürükleyin veya tıklayarak seçin (En fazla 15 adet)
                </Typography>
              </Card>
            )}

            {formData.images.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {formData.images.map((file, index) => (
                  <Card key={index} sx={{ position: 'relative', width: 150, height: 150 }}>
                    <Box
                      component="img"
                      src={URL.createObjectURL(file)}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <IconButton
                      onClick={() => removePhoto(index)}
                      sx={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.7)'
                        }
                      }}
                      size="small"
                    >
                      <Close />
                    </IconButton>
                  </Card>
                ))}
              </Box>
            )}
          </Stack>
        );

      case 3: // İletişim & Fiyat
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person color="primary" />
              İletişim Bilgileri
            </Typography>

            <TextField
              fullWidth
              label="Satıcı Adı"
              value={formData.sellerName}
              onChange={(e) => handleInputChange('sellerName', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Person /></InputAdornment>,
              }}
              required
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Telefon Numarası"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', formatPhoneNumber(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Phone /></InputAdornment>,
                }}
                placeholder="(555) 555-5555"
                required
              />

              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="E-posta"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Email /></InputAdornment>,
                }}
                required
              />
            </Box>

            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn color="primary" />
              Konum Bilgileri
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Autocomplete
                sx={{ flex: 1, minWidth: 200 }}
                options={cities}
                getOptionLabel={(option) => option.name}
                value={cities.find(city => city.name === formData.city) || null}
                onChange={(_, newValue) => {
                  if (newValue) {
                    handleCityChange(newValue.id, newValue.name);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Şehir"
                    required
                  />
                )}
              />

              <Autocomplete
                sx={{ flex: 1, minWidth: 200 }}
                options={districts}
                getOptionLabel={(option) => option.name}
                value={districts.find(district => district.name === formData.district) || null}
                onChange={(_, newValue) => {
                  if (newValue) {
                    handleInputChange('district', newValue.name);
                  }
                }}
                disabled={!formData.city || loadingDistricts}
                loading={loadingDistricts}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="İlçe"
                    required
                  />
                )}
              />
            </Box>

            <Typography variant="h6" color="primary">
              Fiyat Bilgileri
            </Typography>

            <TextField
              fullWidth
              label="Fiyat"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₺</InputAdornment>,
              }}
              placeholder="0"
              required
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.exchange}
                    onChange={(e) => handleInputChange('exchange', e.target.checked)}
                  />
                }
                label="Takaslı"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.negotiable}
                    onChange={(e) => handleInputChange('negotiable', e.target.checked)}
                  />
                }
                label="Pazarlık Kabul Edilir"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.warranty}
                    onChange={(e) => handleInputChange('warranty', e.target.checked)}
                  />
                }
                label="Garantili"
              />
            </Box>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <AccountBalance fontSize="large" color="primary" />
              Silobas İlan Ver
            </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Silobas aracınızın detaylarını girin ve ilanınızı yayınlayın
              </Typography>
            </Box>

            {/* Stepper */}
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Progress */}
            {loading && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress />
              </Box>
            )}

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Form Content */}
            <Box sx={{ mb: 4 }}>
              {renderStepContent(activeStep)}
            </Box>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBack />}
                variant="outlined"
              >
                Geri
              </Button>
              
              <Box>
                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForward />}
                  >
                    İleri
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    endIcon={<LocalShipping />}
                  >
                    {loading ? 'Oluşturuluyor...' : 'İlanı Yayınla'}
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
      </Box>
    </Container>
  );
};export default SilobasForm;
