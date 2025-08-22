import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
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
  CardContent,
  Autocomplete,
  Stack,
  LinearProgress,
  IconButton,
  Chip,
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
  LocalGasStation,
  AttachMoney,
} from '@mui/icons-material';
import { locationService, City, District } from '../../../services/locationService';
import { api } from '../../../services/api';

interface TankerFormData {
  // Temel Bilgiler
  title: string;
  description: string;
  price: string;
  year: number;
  
  // Tanker Özel Bilgiler
  hacim: number; // m3
  gozSayisi: number;
  lastikDurumu: number; // yüzde
  renk: string;
  takasli: string; // "Evet" veya "Hayır"
  
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
  'Tanker Bilgileri',
  'Teknik Özellikler',
  'Fotoğraflar',
  'İletişim & Fiyat'
];

const TankerForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { variantId } = useParams();
  const { confirm } = useConfirmDialog();
  const [activeStep, setActiveStep] = useState(0);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TankerFormData>({
    title: '',
    description: '',
    price: '',
    year: new Date().getFullYear(),
    hacim: 0,
    gozSayisi: 1,
    lastikDurumu: 100,
    renk: '',
    takasli: 'Hayır',
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
        email: user.email || '',
        city: user.city || '',
        district: user.district || '',
      }));
    }
  }, [user]);

  // Fotoğraf yükleme için dropzone
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

  const handleInputChange = (field: keyof TankerFormData, value: any) => {
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
          dorseType: 'Tanker',
          hacim: formData.hacim.toString(),
          gozSayisi: formData.gozSayisi.toString(),
          lastikDurumu: formData.lastikDurumu.toString(),
          renk: formData.renk,
          takasli: formData.takasli,
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
      case 0: // Tanker Bilgileri
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalGasStation color="primary" />
              Tanker Bilgileri
            </Typography>
            
            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Örn: 2018 Model Tanker Dorse"
              required
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Açıklama"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Tanker aracınız hakkında detaylı bilgi verin..."
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
              Aracınızın fotoğraflarını yükleyin (Maksimum 15 adet)
            </Typography>

            <Card sx={{ border: '2px dashed #ddd', textAlign: 'center', p: 4 }}>
              <CardContent>
                <Upload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Fotoğraf Yükle
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  JPG, PNG formatında maksimum 5MB boyutunda dosyalar yükleyebilirsiniz
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  multiple
                  type="file"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (formData.images.length + files.length <= 15) {
                      handleInputChange('images', [...formData.images, ...files]);
                    }
                  }}
                />
                <label htmlFor="image-upload">
                  <Button variant="contained" component="span">
                    Fotoğraf Seç
                  </Button>
                </label>
              </CardContent>
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
                      {index === 0 && (
                        <Chip
                          label="Vitrin"
                          color="success"
                          size="small"
                          sx={{ position: 'absolute', top: 4, left: 4 }}
                        />
                      )}
                      <Button
                        size="small"
                        color="error"
                        onClick={() => removePhoto(index)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          minWidth: 24,
                          width: 24,
                          height: 24,
                          p: 0,
                          bgcolor: 'rgba(255,255,255,0.8)'
                        }}
                      >
                        ×
                      </Button>
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
              <AttachMoney color="primary" />
              Fiyat ve İletişim Bilgileri
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Fiyat"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="Örn: 450.000"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                }}
                required
              />

              <Autocomplete
                sx={{ flex: 1, minWidth: 200 }}
                options={cities}
                getOptionLabel={(option) => option.name}
                value={cities.find(city => city.name === formData.city) || null}
                onChange={(_, value) => {
                  if (value) {
                    handleCityChange(value.id, value.name);
                  } else {
                    handleInputChange('city', '');
                    handleInputChange('district', '');
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
            </Box>

            <Autocomplete
              fullWidth
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
                onChange={(e) => handleInputChange('phone', e.target.value)}
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
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <LocalGasStation fontSize="large" color="primary" />
              Tanker İlan Ver
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Tanker aracınızın detaylarını girin ve ilanınızı yayınlayın
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
};export default TankerForm;
