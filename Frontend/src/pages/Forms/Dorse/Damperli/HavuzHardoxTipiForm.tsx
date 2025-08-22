import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { useConfirmDialog } from '../../../../hooks/useConfirmDialog';
import { listingService } from '../../../../services/listingService';
import { createStandardPayload, validateListingPayload } from '../../../../services/apiNormalizer';
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
  Straighten,
  CloudUpload,
  Close,
} from '@mui/icons-material';
import { locationService, City, District } from '../../../../services/locationService';
import { formatPhoneNumber } from '../../../../utils/phoneUtils';

// Havuz Hardox Tipi Damperli Dorse Üreticileri
// Devrilme Yönleri
const DEVRILME_YONLERI = [
  'Arkaya',
  'Sağa',
  'Sola'
];

interface HavuzHardoxTipiDorseFormData {
  // Temel Bilgiler
  title: string;
  description: string;
  price: string;
  year: number;
  
  // Teknik Özellikler
  genislik: number; // metre
  uzunluk: number; // metre
  lastikDurumu: number; // yüzde
  devrilmeYonu: string;
  
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
  'Araç Bilgileri',
  'Teknik Özellikler', 
  'Fotoğraflar',
  'İletişim & Fiyat'
];

const HavuzHardoxTipiDorseAdForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { confirm } = useConfirmDialog();
  const selectedBrand = location.state?.brand;
  const selectedModel = location.state?.model;
  const selectedVariant = location.state?.variant;
  const [activeStep, setActiveStep] = useState(0);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);

  const [formData, setFormData] = useState<HavuzHardoxTipiDorseFormData>({
    title: '',
    description: '',
    price: '',
    year: new Date().getFullYear(),
    genislik: 0,
    uzunluk: 0,
    lastikDurumu: 100,
    devrilmeYonu: '',
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

  // Şehirler yükle
  useEffect(() => {
    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const cityData = await locationService.getCities();
        console.log('Cities loaded:', cityData.length);
        setCities(cityData);
      } catch (err) {
        console.error('Şehirler yüklenirken hata:', err);
        setError('Şehirler yüklenirken hata oluştu');
      } finally {
        setLoadingCities(false);
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
        email: user.email,
        city: user.city || '',
        district: user.district || '',
      }));
    }
  }, [user]);

  // Dropzone callbacks
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const totalFiles = photos.length + acceptedFiles.length;
    if (totalFiles > 10) {
      setError('En fazla 10 fotoğraf yükleyebilirsiniz');
      return;
    }
    setPhotos(prev => [...prev, ...acceptedFiles]);
    setError(null);
  }, [photos.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 10 - photos.length,
    disabled: photos.length >= 10
  });

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
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
      setDistricts([]);
      setError('İlçeler yüklenirken hata oluştu');
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    const formattedPhone = formatPhoneNumber(value);
    handleInputChange('phone', formattedPhone);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Araç Bilgileri
        if (!formData.title.trim()) {
          setError('İlan başlığı gerekli');
          return false;
        }
        if (!formData.description.trim()) {
          setError('Açıklama gerekli');
          return false;
        }
        if (formData.year < 1980 || formData.year > new Date().getFullYear() + 1) {
          setError('Geçerli bir üretim yılı giriniz');
          return false;
        }
        break;
      case 1: // Teknik Özellikler
        if (formData.genislik <= 0) {
          setError('Genişlik bilgisi gerekli');
          return false;
        }
        if (formData.uzunluk <= 0) {
          setError('Uzunluk bilgisi gerekli');
          return false;
        }
        if (!formData.devrilmeYonu) {
          setError('Devrilme yönü seçimi gerekli');
          return false;
        }
        break;
      case 2: // Fotoğraflar
        if (photos.length === 0) {
          setError('En az 1 fotoğraf yüklemeniz gerekli');
          return false;
        }
        break;
      case 3: // İletişim & Fiyat
        if (!formData.phone.trim()) {
          setError('Telefon numarası gerekli');
          return false;
        }
        if (!formData.price.trim()) {
          setError('Fiyat bilgisi gerekli');
          return false;
        }
        if (!formData.city) {
          setError('Şehir seçimi gerekli');
          return false;
        }
        if (!formData.district) {
          setError('İlçe seçimi gerekli');
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Base64 image conversion
      const base64Images = await Promise.all(
        photos.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      // City ve District'i ID'ye çevir
      const selectedCity = cities.find(city => city.name === formData.city);
      const selectedDistrict = districts.find(district => district.name === formData.district);
      
      if (!selectedCity || !selectedDistrict) {
        setError('Lütfen şehir ve ilçe seçimi yapınız.');
        return;
      }

      // Create standard payload using our service
      const payload = createStandardPayload({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        year: parseInt(formData.year),
        city: formData.city,
        city_id: selectedCity.id,
        district_id: selectedDistrict.id,
        category_id: selectedBrand?.vehicle_types?.categories?.id || "vehicle-category-001",
        seller_name: formData.sellerName,
        seller_phone: formData.phone,
        seller_email: formData.email,
        is_exchangeable: formData.exchange,
        images: base64Images,
        vehicle_type_id: selectedBrand?.vehicle_type_id,
        brand_id: selectedBrand?.id,
        model_id: selectedModel?.id,
        variant_id: selectedVariant?.id
      }, {
        // Dorse properties
        genislik: formData.genislik.toString(),
        uzunluk: formData.uzunluk.toString(),
        lastikDurumu: formData.lastikDurumu.toString(),
        devrilmeYonu: formData.devrilmeYonu,
        warranty: formData.warranty ? 'Evet' : 'Hayır',
        negotiable: formData.negotiable ? 'Evet' : 'Hayır'
      });

      // Validate payload
      const validationResult = validateListingPayload(payload);
      if (!validationResult.isValid) {
        setError(`Veri doğrulama hatası: ${validationResult.errors.join(', ')}`);
        return;
      }

      console.log('🚀 Havuz Hardox Tipi Dorse ilanı oluşturuluyor...', payload);

      // Use standard listing service
      const response = await listingService.createStandardListing(payload);
      
      if (response.success) {
        console.log('✅ Havuz Hardox Tipi Dorse ilanı başarıyla oluşturuldu:', response.data);
        await confirm({
          title: 'Başarılı',
          description: 'İlanınız başarıyla oluşturuldu! Admin onayından sonra yayınlanacaktır.',
          severity: 'success',
          confirmText: 'Tamam',
          cancelText: ''
        });
        navigate('/'); // Anasayfaya yönlendir
      } else {
        throw new Error(response.message || 'İlan oluşturulamadı');
      }
    } catch (err: any) {
      console.error('❌ Havuz Hardox Tipi Dorse ilanı oluşturma hatası:', err);
      setError(err.message || 'İlan oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Araç Bilgileri
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalShipping color="primary" />
              Havuz Hardox Tipi Damperli Dorse Bilgileri
            </Typography>

            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Örn: Tertemiz 2020 Model Havuz Hardox Tipi Damperli Dorse"
              required
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Açıklama"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Dorsenizin detaylı açıklamasını yazın..."
              required
            />

            <TextField
              fullWidth
              type="number"
              label="Üretim Yılı"
              value={formData.year}
              onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start"><DateRange /></InputAdornment>,
              }}
              inputProps={{
                min: 1980,
                max: new Date().getFullYear() + 1
              }}
              required
            />
          </Stack>
        );

      case 1: // Teknik Özellikler
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Straighten color="primary" />
              Teknik Özellikler
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Genişlik"
                  value={formData.genislik}
                  onChange={(e) => handleInputChange('genislik', parseFloat(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">m</InputAdornment>,
                  }}
                  inputProps={{ step: 0.1, min: 0 }}
                  required
                />
              </Box>
              
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Uzunluk"
                  value={formData.uzunluk}
                  onChange={(e) => handleInputChange('uzunluk', parseFloat(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">m</InputAdornment>,
                  }}
                  inputProps={{ step: 0.1, min: 0 }}
                  required
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              type="number"
              label="Lastik Durumu"
              value={formData.lastikDurumu}
              onChange={(e) => handleInputChange('lastikDurumu', parseInt(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              inputProps={{ min: 0, max: 100 }}
            />

            <FormControl fullWidth required>
              <InputLabel>Devrilme Yönü</InputLabel>
              <Select
                value={formData.devrilmeYonu}
                onChange={(e) => handleInputChange('devrilmeYonu', e.target.value)}
              >
                {DEVRILME_YONLERI.map((yon) => (
                  <MenuItem key={yon} value={yon}>
                    {yon}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>


             <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
                    checked={formData.exchange}
                    onChange={(e) => handleInputChange('exchange', e.target.checked)}
                  />
                }
                label="Takas Kabul Edilir"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.warranty}
                    onChange={(e) => handleInputChange('warranty', e.target.checked)}
                  />
                }
                label="Garanti var"
              />
            </Box>
          </Stack>
        );

      case 2: // Fotoğraflar
        return (
          <Stack spacing={3}>
            <Card sx={{ p: 3, border: '2px solid #e3f2fd', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                📷 Fotoğraf Yükleme
              </Typography>
              
              <Paper
                {...getRootProps()}
                sx={{
                  border: '2px dashed #1976d2',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: isDragActive ? '#e3f2fd' : '#fafafa',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#f0f7ff',
                    borderColor: '#1565c0'
                  }
                }}
              >
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                  Fotoğrafları buraya sürükleyin veya tıklayın
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  En fazla 10 fotoğraf yükleyebilirsiniz (JPG, PNG)
                </Typography>
              </Paper>

              {photos.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Yüklenen Fotoğraflar ({photos.length}/10)
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {photos.map((photo, index) => (
                      <Box key={index} sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.333% - 8px)', md: 'calc(25% - 8px)' } }}>
                        <Card sx={{ position: 'relative', overflow: 'hidden' }}>
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Fotoğraf ${index + 1}`}
                            style={{
                              width: '100%',
                              height: 150,
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removePhoto(index)}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              backgroundColor: 'rgba(244, 67, 54, 0.9)',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'rgba(244, 67, 54, 1)'
                              }
                            }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Card>
                      </Box>
                    ))}
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    💡 İpucu: İlk fotoğraf vitrin fotoğrafı olacaktır.
                  </Typography>
                </Box>
              )}
            </Card>
          </Stack>
        );

      case 3: // İletişim & Fiyat
        return (
          <Stack spacing={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              💰 Fiyat Bilgileri
            </Typography>

            <TextField
              fullWidth
              label="Fiyat"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₺</InputAdornment>,
              }}
              placeholder="450000"
              required
            />

           

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              📍 Konum Bilgileri
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Autocomplete
                sx={{ flex: 1, minWidth: 200 }}
                options={cities}
                getOptionLabel={(option) => option.name}
                value={cities.find(city => city.name === formData.city) || null}
                loading={loadingCities}
                onChange={(_, value) => {
                  if (value) {
                    handleCityChange(value.id, value.name);
                  } else {
                    setFormData(prev => ({ ...prev, city: '', district: '' }));
                    setDistricts([]);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="İl"
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>,
                    }}
                  />
                )}
              />
            </Box>

            <Autocomplete
              fullWidth
              options={districts}
              getOptionLabel={(option) => option.name}
              value={districts.find(district => district.name === formData.district) || null}
              loading={loadingDistricts}
              onChange={(_, value) => {
                handleInputChange('district', value ? value.name : '');
              }}
              disabled={!formData.city || loadingDistricts}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="İlçe"
                  placeholder={formData.city ? (loadingDistricts ? "Yükleniyor..." : "İlçe seçin") : "Önce il seçin"}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>,
                  }}
                />
              )}
            />

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              📞 İletişim Bilgileri
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Ad Soyad"
                value={formData.sellerName}
                onChange={(e) => handleInputChange('sellerName', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Person /></InputAdornment>,
                }}
                disabled
                helperText="Kullanıcı profilinden otomatik dolduruldu"
              />

              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Telefon"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="0xxx xxx xx xx"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Phone /></InputAdornment>,
                }}
                required
                error={!formData.phone}
                helperText={!formData.phone ? "Telefon numarası zorunludur" : ""}
              />
            </Box>

            <TextField
              fullWidth
              label="E-posta"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email /></InputAdornment>,
              }}
              type="email"
              disabled
              helperText="Kullanıcı profilinden otomatik dolduruldu"
            />
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4, mt: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Havuz Hardox Tipi Damperli Dorse İlanı Oluştur
          </Typography>
        </Box>

        {/* Stepper */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Form Content */}
        <Paper elevation={2} sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading && <LinearProgress sx={{ mb: 3 }} />}

          {renderStepContent(activeStep)}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            {activeStep > 0 && (
              <Button
                type="button"
                onClick={handleBack}
                startIcon={<ArrowBack />}
              >
                Geri
              </Button>
            )}

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                endIcon={<Upload />}
                size="large"
              >
                {loading ? 'İlan Oluşturuluyor...' : 'İlanı Yayınla'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
              >
                İleri
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default HavuzHardoxTipiDorseAdForm;
