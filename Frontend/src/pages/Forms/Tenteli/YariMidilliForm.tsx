import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../../context/AuthContext';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { useEditListing } from '../../../hooks/useEditListing';
import { listingService } from '../../../services/listingService';
import { createStandardPayload, validateListingPayload } from '../../../services/apiNormalizer';
import { locationService, City, District } from '../../../services/locationService';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
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
  DateRange,
  CloudUpload,
  Close,
  Umbrella,
} from '@mui/icons-material';
import { locationService, City, District } from '../../../services/locationService';
import { api } from '../../../services/api';
import { formatPhoneNumber } from '../../../utils/phoneUtils';

// Çatı Perde Sistemi Türleri
const CATI_PERDE_SISTEMLERI = [
  'Hızlı Kayar Perde',
  'Sabit Tente',
  'Tulum Kayar Perde',
  'Yana Kayar Perde',
  'Tavana Sabit Yana Kayar Perde'
];

interface FormData {
  // Genel Bilgiler
  title: string;
  description: string;
  year: number;
  price: string;
  
  // Teknik Özellikler
  uzunluk: number;
  lastikDurumu: number;
  catiPerdeSistemi: string;
  
  // Durum
  exchange: boolean;
  negotiable: boolean;
  warranty: boolean;
  
  // Fotoğraflar
  images: File[];
  
  // İletişim
  sellerName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
}

const steps = ['Genel Bilgiler', 'Teknik Özellikler', 'Fotoğraflar', 'İletişim Bilgileri'];

const YariMidilliForm: React.FC = () => {
  const navigate = useNavigate();
  const { variantId } = useParams<{ variantId: string }>();
  const { user } = useAuth();
  const { confirm } = useConfirmDialog();
  const { isEditMode, editData, editLoading, fillFormWithEditData } = useEditListing();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    year: new Date().getFullYear(),
    price: '',
    uzunluk: 0,
    lastikDurumu: 100,
    catiPerdeSistemi: '',
    exchange: false,
    negotiable: false,
    warranty: false,
    images: [],
    sellerName: '',
    phone: '',
    email: '',
    city: '',
    district: ''
  });

  // Şehirleri yükle
  useEffect(() => {
    const loadCities = async () => {
      try {
        const cityData = await locationService.getCities();
        setCities(cityData);
      } catch (error) {
        console.error('Şehirler yüklenemedi:', error);
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
    setFormData(prev => ({ ...prev, city: cityName, district: '' }));
    setLoadingDistricts(true);
    
    try {
      const districtData = await locationService.getDistrictsByCity(cityId);
      setDistricts(districtData);
    } catch (error) {
      console.error('İlçeler yüklenemedi:', error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
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
          dorseType: 'Tenteli',
          tenteliType: 'Yarı Midilli',
          uzunluk: formData.uzunluk.toString(),
          lastikDurumu: formData.lastikDurumu.toString(),
          catiPerdeSistemi: formData.catiPerdeSistemi,
          warranty: formData.warranty ? 'Evet' : 'Hayır',
          negotiable: formData.negotiable ? 'Evet' : 'Hayır'
        }
      };

      const response = await api.post('/listings', listingData);
      
      if (response.data) {
        await confirm({
          title: 'Başarılı',
          description: 'İlanınız başarıyla oluşturuldu! Admin onayından sonra yayınlanacaktır.',
          severity: 'success',
          confirmText: 'Tamam',
          cancelText: ''
        });
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
      case 0: // Genel Bilgiler
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Umbrella color="primary" />
              Yarı Midilli Tenteli Bilgileri
            </Typography>
            
            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Örn: 2018 Model Yarı Midilli Tenteli Dorse"
              required
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                type="number"
                label="Üretim Yılı"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><DateRange /></InputAdornment>,
                }}
              />
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Fiyat"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                }}
                placeholder="0"
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Açıklama"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Yarı Midilli tenteli aracınız hakkında detaylı bilgi verin..."
              required
            />
          </Stack>
        );

      case 1: // Teknik Özellikler
        return (
          <Stack spacing={3}>
            <Typography variant="h6" color="primary">
              Tenteli Özellikleri
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                type="number"
                label="Uzunluk"
                value={formData.uzunluk}
                onChange={(e) => handleInputChange('uzunluk', parseInt(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">m</InputAdornment>,
                }}
                inputProps={{ min: 0 }}
              />

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
              />
            </Box>

            <FormControl fullWidth required>
              <InputLabel>Çatı Perde Sistemi</InputLabel>
              <Select
                value={formData.catiPerdeSistemi}
                label="Çatı Perde Sistemi"
                onChange={(e) => handleInputChange('catiPerdeSistemi', e.target.value)}
              >
                {CATI_PERDE_SISTEMLERI.map((sistem) => (
                  <MenuItem key={sistem} value={sistem}>
                    {sistem}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="h6" color="primary">
              Durum Bilgileri
            </Typography>

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

      case 3: // İletişim Bilgileri
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
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Paper sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Umbrella fontSize="large" color="primary" />
                Yarı Midilli Tenteli İlan Ver
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Yarı Midilli tenteli aracınızın detaylarını girin ve ilanınızı yayınlayın
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
    </>
  );
};

export default YariMidilliForm;
