import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  CardContent,
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
  AttachMoney,
  AcUnit,
} from '@mui/icons-material';
import UserHeader from '../../components/layout/UserHeader';
import { locationService, City, District } from '../../services/locationService';
import api from '../../services/api';
import { formatPhoneNumber } from '../../utils/phoneUtils';

interface FrigofirikFormData {
  // Temel Bilgiler
  title: string;
  description: string;
  price: string;
  year: number;
  
  // Teknik Özellikler
  uzunluk: number; // metre
  lastikDurumu: number; // yüzde
  sogutucu: string; // Çalışıyor/Arızalı/Yok
  
  // Konum
  city: string;
  district: string;
  
  // İletişim Bilgileri
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
  
  // Ekstra
  warranty: boolean;
  negotiable: boolean;
  exchange: boolean;
}

const steps = [
  'Frigofirik Bilgileri',
  'Teknik Özellikler', 
  'Fotoğraflar',
  'İletişim & Fiyat'
];

const FrigofirikForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { variantId } = useParams<{ variantId: string }>();
  const [activeStep, setActiveStep] = useState(0);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const [formData, setFormData] = useState<FrigofirikFormData>({
    title: '',
    description: '',
    price: '',
    year: new Date().getFullYear(),
    uzunluk: 0,
    lastikDurumu: 100,
    sogutucu: '',
    city: '',
    district: '',
    sellerName: '',
    sellerPhone: '',
    sellerEmail: '',
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
        sellerPhone: user.phone || '',
        sellerEmail: user.email,
        city: user.city || '',
        district: user.district || '',
      }));
    }
  }, [user]);

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
    handleInputChange('sellerPhone', formattedPhone);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const totalFiles = uploadedImages.length + files.length;
    
    if (totalFiles > 15) {
      setError('En fazla 15 fotoğraf yükleyebilirsiniz');
      return;
    }
    
    setUploadedImages(prev => [...prev, ...files]);
    setError(null);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
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
      case 0: // Frigofirik Bilgileri
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
        if (formData.uzunluk <= 0) {
          setError('Uzunluk bilgisi gerekli');
          return false;
        }
        if (!formData.sogutucu) {
          setError('Soğutucu bilgisi gerekli');
          return false;
        }
        break;
      case 2: // Fotoğraflar
        if (uploadedImages.length === 0) {
          setError('En az 1 fotoğraf yüklemeniz gerekli');
          return false;
        }
        break;
      case 3: // İletişim & Fiyat
        if (!formData.sellerPhone.trim()) {
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
    try {
      console.log('🚀 Frigofirik ilanı oluşturuluyor...');
      console.log('Form Data:', formData);
      console.log('Images:', uploadedImages.length);

      // Fotoğrafları base64'e çevir
      const imageDataUrls = await Promise.all(
        uploadedImages.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      // API için veri hazırlığı - Frigofirik'i Dorse kategorisi altında gönder
      const listingData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        year: formData.year,
        category_id: 'vehicle-category-001', // Vasıta kategorisi
        vehicle_type_id: 'cme633w8v0001981ksnpl6dj5', // Dorse vehicle_type_id
        variant_id: variantId, // URL'den gelen variant ID
        seller_name: formData.sellerName,
        seller_phone: formData.sellerPhone,
        seller_email: formData.sellerEmail,
        city: formData.city,
        district: formData.district,
        is_exchangeable: formData.exchange,
        images: imageDataUrls,
        // Frigofirik'e özel bilgileri properties olarak gönder
        properties: {
          dorseType: 'Frigofirik', // Dorse alt kategorisi olarak Frigofirik
          uzunluk: formData.uzunluk.toString(),
          lastikDurumu: formData.lastikDurumu.toString(),
          sogutucu: formData.sogutucu,
          warranty: formData.warranty ? 'Evet' : 'Hayır',
          negotiable: formData.negotiable ? 'Evet' : 'Hayır'
        }
      };

      console.log('🚀 API verileri:', listingData);

      // API çağrısı
      const response = await api.post('/listings', listingData);
      
      if (response.data) {
        console.log('✅ Frigofirik ilanı başarıyla oluşturuldu:', response.data);
        alert('İlanınız başarıyla oluşturuldu! Moderatör onayından sonra yayınlanacaktır.');
        navigate('/profile');
      }
    } catch (err: any) {
      console.error('❌ Frigofirik ilanı oluşturma hatası:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      setError(err.response?.data?.message || 'İlan oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Frigofirik Bilgileri
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AcUnit color="primary" />
              Frigofirik Bilgileri
            </Typography>

            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Örn: 2018 Model Frigofirik Dorse"
              required
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Açıklama"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Frigofirik dorsenizin detaylı açıklamasını yazın..."
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

            <TextField
              fullWidth
              type="number"
              label="Uzunluk"
              value={formData.uzunluk}
              onChange={(e) => handleInputChange('uzunluk', parseFloat(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Straighten /></InputAdornment>,
                endAdornment: <InputAdornment position="end">metre</InputAdornment>,
              }}
              inputProps={{ step: 0.1, min: 0 }}
              placeholder="Örn: 13.6"
              required
            />

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
              placeholder="Örn: 85"
            />

            <FormControl fullWidth required>
              <InputLabel>Soğutucu Durumu</InputLabel>
              <Select
                value={formData.sogutucu}
                label="Soğutucu Durumu"
                onChange={(e) => handleInputChange('sogutucu', e.target.value)}
              >
                <MenuItem value="Çalışıyor">Çalışıyor</MenuItem>
                <MenuItem value="Arızalı">Arızalı</MenuItem>
                <MenuItem value="Yok">Yok</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        );

      case 2: // Fotoğraflar
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CloudUpload color="primary" />
              Fotoğraflar
            </Typography>

            <Card variant="outlined">
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Frigofirik Fotoğraflarını Yükleyin
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    En fazla 15 fotoğraf yükleyebilirsiniz. (JPG, PNG, WebP)
                  </Typography>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<Upload />}
                      disabled={uploadedImages.length >= 15}
                    >
                      Fotoğraf Seç
                    </Button>
                  </label>
                </Box>
              </CardContent>
            </Card>

            {uploadedImages.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Yüklenen Fotoğraflar ({uploadedImages.length}/15)
                </Typography>
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                  {uploadedImages.map((file, index) => (
                    <Card key={index} sx={{ position: 'relative', width: 120, height: 120 }}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 4,
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                        }}
                        onClick={() => removeImage(index)}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        );

      case 3: // İletişim & Fiyat
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person color="primary" />
              İletişim & Fiyat Bilgileri
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

            <TextField
              fullWidth
              label="Telefon"
              value={formData.sellerPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="0xxx xxx xx xx"
              InputProps={{
                startAdornment: <InputAdornment position="start"><Phone /></InputAdornment>,
              }}
              required
            />

            <TextField
              fullWidth
              label="E-posta"
              type="email"
              value={formData.sellerEmail}
              onChange={(e) => handleInputChange('sellerEmail', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email /></InputAdornment>,
              }}
              required
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Autocomplete
                options={cities}
                getOptionLabel={(option) => option.name}
                value={cities.find(city => city.name === formData.city) || null}
                onChange={(_, newValue) => {
                  if (newValue) {
                    handleCityChange(newValue.id, newValue.name);
                  }
                }}
                loading={loadingCities}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Şehir"
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>,
                    }}
                  />
                )}
              />

              <Autocomplete
                options={districts}
                getOptionLabel={(option) => option.name}
                value={districts.find(district => district.name === formData.district) || null}
                onChange={(_, newValue) => {
                  if (newValue) {
                    handleInputChange('district', newValue.name);
                  }
                }}
                loading={loadingDistricts}
                disabled={!formData.city || loadingDistricts}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="İlçe"
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>,
                    }}
                  />
                )}
              />
            </Box>

            <TextField
              fullWidth
              label="Fiyat"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
                endAdornment: <InputAdornment position="end">TL</InputAdornment>,
              }}
              placeholder="150000"
              required
            />

            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.warranty}
                    onChange={(e) => handleInputChange('warranty', e.target.checked)}
                  />
                }
                label="Garanti var"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.negotiable}
                    onChange={(e) => handleInputChange('negotiable', e.target.checked)}
                  />
                }
                label="Pazarlık yapılabilir"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.exchange}
                    onChange={(e) => handleInputChange('exchange', e.target.checked)}
                  />
                }
                label="Takas yapılabilir"
              />
            </Box>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <UserHeader />
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              🧊 Frigofirik İlan Ver
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Frigofirik dorsenizi kolayca satışa çıkarın
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Progress Bar */}
          <LinearProgress
            variant="determinate"
            value={(activeStep / (steps.length - 1)) * 100}
            sx={{ mb: 4, height: 6, borderRadius: 3 }}
          />

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Step Content */}
          <Box sx={{ mb: 4, minHeight: 400 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              startIcon={<ArrowBack />}
            >
              Geri
            </Button>

            <Typography variant="body2" color="text.secondary">
              Adım {activeStep + 1} / {steps.length}
            </Typography>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <LinearProgress /> : <LocalShipping />}
                sx={{ minWidth: 120 }}
              >
                {loading ? 'Gönderiliyor...' : 'İlanı Yayınla'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
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

export default FrigofirikForm;
