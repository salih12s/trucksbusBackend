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
  Pool,
} from '@mui/icons-material';
import { locationService, City, District } from '../../../services/locationService';
import { api } from '../../../services/api';
import { formatPhoneNumber } from '../../../utils/phoneUtils';

// Hidrolik Sistemi Türleri
const HIDROLIK_SISTEMLERI = [
  'Hidrolik',
  'Pnömatik', 
  'Manuel'
];

interface HavuzluFormData {
  dingilSayisi: unknown;
  // Temel Bilgiler
  title: string;
  description: string;
  price: string;
  year: number;
  
  // Havuzlu Özel Bilgiler
  havuzDerinligi: number; // metre
  havuzGenisligi: number; // metre
  havuzUzunlugu: number; // metre
  lastikDurumu: number; // yüzde
  istiapHaddi: number; // ton
  hidrolikSistem: string[]; // Hidrolik, Pnömatik, Manuel seçenekleri
  
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
  'Havuzlu Bilgileri',
  'Teknik Özellikler',
  'Fotoğraflar',
  'İletişim & Fiyat'
];

const HavuzluForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { variantId } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('🏊 HavuzluForm yüklendi! variantId:', variantId);

  const [formData, setFormData] = useState<HavuzluFormData>({
    title: '',
    description: '',
    price: '',
    year: new Date().getFullYear(),
    havuzDerinligi: 0,
    havuzGenisligi: 0,
    havuzUzunlugu: 0,
    lastikDurumu: 100,
    istiapHaddi: 0,
    hidrolikSistem: [],
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
    dingilSayisi: 0, // Varsayılan dingil sayısı
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
      case 0: // Havuzlu Bilgileri
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
        // Havuzlu için özel teknik özellik kontrolü gerekiyorsa buraya eklenebilir
        break;
      case 2: // Fotoğraflar
        if (formData.images.length === 0) {
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
    try {
      // Fotoğrafları base64'e çevir
      const imageDataUrls = await Promise.all(
        formData.images.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      // API için veri hazırlığı - Havuzlu'yu Lowbed kategorisi altında gönder
      const listingData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        year: formData.year,
        category_id: 'vehicle-category-001', // Vasıta kategorisi
        vehicle_type_id: 'cme633w8v0001981ksnpl6dj5', // Dorse vehicle_type_id
        variant_id: variantId, // URL'den gelen variant ID
        seller_name: formData.sellerName,
        seller_phone: formData.phone,
        seller_email: formData.email,
        city: formData.city,
        district: formData.district,
        is_exchangeable: formData.exchange,
        images: imageDataUrls,
        // Havuzlu'ya özel bilgileri properties olarak gönder
        properties: {
          dorseType: 'Havuzlu', // Dorse alt kategorisi olarak Havuzlu
          havuzDerinligi: formData.havuzDerinligi.toString(),
          havuzGenisligi: formData.havuzGenisligi.toString(),
          havuzUzunlugu: formData.havuzUzunlugu.toString(),
          lastikDurumu: formData.lastikDurumu.toString(),
          istiapHaddi: formData.istiapHaddi.toString(),
          hidrolikSistem: formData.hidrolikSistem.join(', '),
          warranty: formData.warranty ? 'Evet' : 'Hayır',
          negotiable: formData.negotiable ? 'Evet' : 'Hayır'
        }
      };

      console.log('🚀 Havuzlu ilanı oluşturuluyor...', listingData);

      // API çağrısı
      const response = await api.post('/listings', listingData);
      
      if (response.data) {
        console.log('✅ Havuzlu ilanı başarıyla oluşturuldu:', response.data);
        alert('İlanınız başarıyla oluşturuldu! Moderatör onayından sonra yayınlanacaktır.');
        navigate('/');
      }
    } catch (err: any) {
      console.error('❌ Havuzlu ilanı oluşturma hatası:', err);
      setError(err.response?.data?.message || 'İlan oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Havuzlu Bilgileri
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Pool color="primary" />
              Havuzlu Lowbed Bilgileri
            </Typography>
            
            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Örn: 2018 Model Havuzlu Lowbed Dorse"
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
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Açıklama"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Havuzlu lowbed aracınız hakkında detaylı bilgi verin..."
              required
            />
          </Stack>
        );

      case 1: // Teknik Özellikler
        return (
          <Stack spacing={3}>
            

            <Typography variant="h6" color="primary">
              Havuz Özellikleri
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
               <TextField
                sx={{ flex: 1, minWidth: 200 }}
                type="number"
                label="Dingil Sayısı"
                value={formData.dingilSayisi}
                onChange={(e) => handleInputChange('dingilSayisi', parseInt(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">ad</InputAdornment>,
                }}
                inputProps={{ min: 0 }}
              />

              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                type="number"
                label="Havuz Genişliği"
                value={formData.havuzGenisligi}
                onChange={(e) => handleInputChange('havuzGenisligi', parseInt(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">m</InputAdornment>,
                }}
                inputProps={{ min: 0 }}
              />
            </Box>

            <TextField
              fullWidth
              type="number"
              label="Havuz Uzunluğu"
              value={formData.havuzUzunlugu}
              onChange={(e) => handleInputChange('havuzUzunlugu', parseInt(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">m</InputAdornment>,
              }}
              inputProps={{ min: 0 }}
            />

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
              />

              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                type="number"
                label="İstiap Haddi"
                value={formData.istiapHaddi}
                onChange={(e) => handleInputChange('istiapHaddi', parseInt(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">ton</InputAdornment>,
                }}
                inputProps={{ min: 0 }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Hidrolik Sistem (İsteğe bağlı - birden fazla seçebilirsiniz)
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {HIDROLIK_SISTEMLERI.map((sistem) => {
                  const isSelected = formData.hidrolikSistem.includes(sistem);
                  return (
                    <Paper
                      key={sistem}
                      elevation={isSelected ? 3 : 1}
                      onClick={() => {
                        const currentSystems = [...formData.hidrolikSistem];
                        if (isSelected) {
                          // Seçili ise çıkar
                          const newSystems = currentSystems.filter(s => s !== sistem);
                          handleInputChange('hidrolikSistem', newSystems);
                        } else {
                          // Seçili değilse ekle
                          handleInputChange('hidrolikSistem', [...currentSystems, sistem]);
                        }
                      }}
                      sx={{
                        flex: 1,
                        minWidth: 150,
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                        backgroundColor: isSelected ? '#e3f2fd' : 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: isSelected ? '#e3f2fd' : '#f5f5f5',
                          elevation: 2
                        }
                      }}
                    >
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: isSelected ? 'bold' : 'normal',
                          color: isSelected ? '#1976d2' : 'text.primary'
                        }}
                      >
                        {sistem}
                      </Typography>
                      {isSelected && (
                        <Typography variant="caption" sx={{ color: '#1976d2', mt: 0.5 }}>
                          ✓ Seçildi
                        </Typography>
                      )}
                    </Paper>
                  );
                })}
              </Box>
              {formData.hidrolikSistem.length > 0 && (
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  Seçilen sistemler: {formData.hidrolikSistem.join(', ')}
                </Typography>
              )}
            </Box>
          </Stack>
        );

      case 2: // Fotoğraflar
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Upload color="primary" />
              Fotoğraf Yükleme
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Havuzlu aracınızın fotoğraflarını yükleyin (Maksimum 15 adet)
            </Typography>

            <Card 
              {...getRootProps()} 
              sx={{ 
                border: '2px dashed #ddd', 
                textAlign: 'center', 
                p: 4,
                cursor: 'pointer',
                backgroundColor: isDragActive ? '#f5f5f5' : 'white'
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Fotoğrafları buraya bırakın' : 'Fotoğraf Yükle'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                JPG, PNG formatında maksimum 5MB boyutunda dosyalar yükleyebilirsiniz
              </Typography>
            </Card>

            {/* Yüklenen fotoğrafları göster */}
            {formData.images.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Yüklenen Fotoğraflar ({formData.images.length}/15)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {formData.images.map((file, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        style={{
                          width: 120,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 8,
                          border: index === 0 ? '2px solid #4CAF50' : '1px solid #ddd'
                        }}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removePhoto(index)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(255,255,255,0.8)'
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            <Typography variant="body2" color="text.secondary">
              💡 İpucu: İlk yüklediğiniz fotoğraf vitrin fotoğrafı olarak kullanılacaktır
            </Typography>
          </Stack>
        );

      case 3: // İletişim & Fiyat
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalShipping color="primary" />
              Fiyat ve İletişim Bilgileri
            </Typography>

            <TextField
              fullWidth
              label="Fiyat"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="Örn: 450000"
              InputProps={{
                startAdornment: <InputAdornment position="start">₺</InputAdornment>,
              }}
              required
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Autocomplete
                sx={{ flex: 1, minWidth: 200 }}
                options={cities}
                getOptionLabel={(option) => option.name}
                value={cities.find(city => city.name === formData.city) || null}
                onChange={(_, value) => {
                  if (value) {
                    handleCityChange(value.id, value.name);
                  } else {
                    setFormData(prev => ({ ...prev, city: '', district: '' }));
                    setDistricts([]);
                  }
                }}
                loading={loadingCities}
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

              <Autocomplete
                sx={{ flex: 1, minWidth: 200 }}
                options={districts}
                getOptionLabel={(option) => option.name}
                value={districts.find(district => district.name === formData.district) || null}
                onChange={(_, value) => {
                  handleInputChange('district', value ? value.name : '');
                }}
                disabled={!formData.city}
                loading={loadingDistricts}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="İlçe"
                    placeholder={formData.city ? "İlçe seçin" : "Önce il seçin"}
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>,
                    }}
                  />
                )}
              />
            </Box>

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
                placeholder="(5XX) XXX XX XX"
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
              disabled
              helperText="Kullanıcı profilinden otomatik dolduruldu"
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email /></InputAdornment>,
              }}
              type="email"
            />

       

            <Alert severity="info">
              <strong>Önemli:</strong> İlanınız yayına alınmadan önce moderatörlerimiz tarafından incelenecektir. 
              Onay sürecinde e-posta veya telefon ile bilgilendirileceksiniz.
            </Alert>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <UserHeader />
      
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4, mt: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Havuzlu Lowbed İlanı Oluştur
          </Typography>
          <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
            Dorse - Lowbed - Havuzlu
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
                disabled={loading}
                startIcon={<ArrowBack />}
              >
                Geri
              </Button>
            )}

            {activeStep === steps.length - 1 ? (
              <Button
                type="button"
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                size="large"
                sx={{ minWidth: 200, ml: 'auto' }}
              >
                {loading ? 'İlan Oluşturuluyor...' : 'İlanı Yayınla'}
              </Button>
            ) : (
              <Button
                type="button"
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                endIcon={<ArrowForward />}
                sx={{ ml: 'auto' }}
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

export default HavuzluForm;
