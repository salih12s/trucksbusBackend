import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { useEditListing } from '../../../hooks/useEditListing';
import { listingService } from '../../../services/listingService';
import { createStandardPayload, validateListingPayload } from '../../../services/apiNormalizer';
import { locationService, City, District } from '../../../services/locationService';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Paper,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Alert,
  Autocomplete
} from '@mui/material';
import {
  Upload,
  AttachMoney,
  LocationOn,
  Person,
  Phone,
  Email
} from '@mui/icons-material';

const steps = ['İlan Bilgileri', 'Römork Özellikleri', 'Fotoğraflar', 'İletişim & Fiyat'];

const KamyonRomorkForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { confirm } = useConfirmDialog();
  const { isEditMode, editData, editLoading, fillFormWithEditData } = useEditListing();
  
  // Location state'den gelen veriler
  const selectedBrand = location.state?.brand;
  const selectedModel = location.state?.model;
  const selectedVariant = location.state?.variant;
  
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dinamik başlık fonksiyonları
  const getFormTitle = () => {
    if (selectedVariant?.variant_name) {
      return `${selectedVariant.variant_name} İlanı`;
    }
    if (selectedModel?.model_name) {
      return `${selectedModel.model_name} Kamyon Römorku İlanı`;
    }
    if (selectedBrand?.brand_name) {
      return `${selectedBrand.brand_name} Kamyon Römorku İlanı`;
    }
    return 'Kamyon Römorku İlanı';
  };

  const getStepTitle = () => {
    const baseName = selectedVariant?.variant_name || selectedModel?.model_name || 'Kamyon Römorku';
    return `${baseName} - ${steps[activeStep]}`;
  };
  
  // City/District state
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  
  const [formData, setFormData] = useState({
    // İlan Bilgileri
    title: '',
    description: '',
    productionYear: '',
    // Römork Özellikleri
    length: '',
    width: '',
    hasTent: false,
    hasDamper: false,
    exchangeable: '',
    // Fotoğraflar
    images: [] as File[],
    // İletişim & Fiyat
    contactName: '',
    phone: '',
    email: '',
    price: '',
    currency: 'TL',
    city: '',
    district: ''
  });

  // Load cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoadingCities(true);
        const citiesData = await locationService.getCities();
        setCities(citiesData);
        console.log('🏙️ KamyonRomorkForm: Şehirler yüklendi:', citiesData.length);
      } catch (error) {
        console.error('❌ KamyonRomorkForm: Şehirler yüklenemedi:', error);
      } finally {
        setLoadingCities(false);
      }
    };
    
    loadCities();
  }, []);

  // Load districts when city changes
  const handleCityChange = async (city: City | null) => {
    setSelectedCity(city);
    setSelectedDistrict(null);
    setFormData(prev => ({ ...prev, city: city?.name || '', district: '' }));
    
    if (city) {
      try {
        setLoadingDistricts(true);
        const districtsData = await locationService.getDistrictsByCity(city.id);
        setDistricts(districtsData);
        console.log('🏘️ KamyonRomorkForm: İlçeler yüklendi:', districtsData.length);
      } catch (error) {
        console.error('❌ KamyonRomorkForm: İlçeler yüklenemedi:', error);
      } finally {
        setLoadingDistricts(false);
      }
    } else {
      setDistricts([]);
    }
  };

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        phone: user.phone || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Edit modu için veri yükle
  useEffect(() => {
    if (isEditMode && editData && !editLoading) {
      fillFormWithEditData(setFormData);
    }
  }, [isEditMode, editData, editLoading]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);

      // Gerekli alanların kontrolü
      const requiredFields = [
        { field: 'title', message: 'İlan başlığı gereklidir' },
        { field: 'description', message: 'Açıklama gereklidir' },
        { field: 'productionYear', message: 'Üretim yılı seçimi gereklidir' },
        { field: 'length', message: 'Uzunluk bilgisi gereklidir' },
        { field: 'width', message: 'Genişlik bilgisi gereklidir' },
        { field: 'price', message: 'Fiyat bilgisi gereklidir' },
        { field: 'contactName', message: 'İletişim adı gereklidir' },
        { field: 'phone', message: 'Telefon numarası gereklidir' }
      ];

      for (const { field, message } of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          await confirm({
            title: 'Eksik Bilgi',
            description: message,
            severity: 'warning',
            confirmText: 'Tamam',
            cancelText: ''
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Lokasyon kontrolü
      if (!selectedCity || !selectedDistrict) {
        await confirm({
          title: 'Eksik Bilgi',
          description: 'Şehir ve ilçe seçimi gereklidir',
          severity: 'warning',
          confirmText: 'Tamam',
          cancelText: ''
        });
        setIsSubmitting(false);
        return;
      }

      // Vehicle type kontrolü
      if (!selectedBrand?.vehicle_type_id) {
        await confirm({
          title: 'Eksik Bilgi',
          description: 'Marka seçimi zorunludur',
          severity: 'warning',
          confirmText: 'Tamam',
          cancelText: ''
        });
        setIsSubmitting(false);
        return;
      }

      // Convert images to base64
      const base64Images = await Promise.all(
        formData.images.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      // Standardized payload oluşturma
      const payload = createStandardPayload({
        // Temel bilgiler
        title: formData.title,
        description: formData.description,
        
        // Araç bilgileri
        vehicle_type_id: selectedBrand?.vehicle_type_id,
        brand_id: selectedBrand?.id,
        model_id: selectedModel?.id,
        variant_id: selectedVariant?.id,
        category_id: selectedBrand?.vehicle_types?.categories?.id || "vehicle-category-001",
        
        // Lokasyon
        city: formData.city,
        district: formData.district,
        city_id: selectedCity.id,
        district_id: selectedDistrict.id,
        
        // İletişim ve fiyat
        price: parseFloat(formData.price.replace(/[^\d.-]/g, '')),
        seller_name: formData.contactName,
        seller_phone: formData.phone,
        seller_email: formData.email || undefined,
        
        // Yıl
        year: parseInt(formData.productionYear),
        
        // Fotoğraflar
        images: base64Images
      }, {
        // Özel özellikler (additional properties)
        length: formData.length,
        width: formData.width,
        hasTent: formData.hasTent ? 'Evet' : 'Hayır',
        hasDamper: formData.hasDamper ? 'Evet' : 'Hayır',
        exchangeable: formData.exchangeable,
        currency: formData.currency
      });

      console.log('Gönderilen payload:', payload);

      // Payload validasyonu
      const validationResult = validateListingPayload(payload);
      if (!validationResult.isValid) {
        console.error('Payload validasyon hatası:', validationResult.errors);
        await confirm({
          title: 'Doğrulama Hatası',
          description: `Form validasyon hatası: ${validationResult.errors.join(', ')}`,
          severity: 'error',
          confirmText: 'Tamam',
          cancelText: ''
        });
        setIsSubmitting(false);
        return;
      }

      // Edit mode or create mode handling
      if (isEditMode && editData) {
        console.log('✅ Kamyon Römorku ilanı güncelleniyor:', payload);
        const response = await listingService.updateStandardListing(editData.id, payload);
        
        if (response.success) {
          console.log('✅ Kamyon Römorku ilanı başarıyla güncellendi:', response.data);
          const shouldNavigate = await confirm({
            title: 'İlan Başarıyla Güncellendi! 🎉',
            description: 'İlanınız başarıyla güncellendi ve tekrar inceleme sürecine alındı. Onaylandıktan sonra yayına alınacak. İlanlarım sayfasına gitmek istiyor musunuz?',
            severity: 'success',
            confirmText: 'İlanlarım',
            cancelText: 'Bu Sayfada Kal'
          });
          if (shouldNavigate) {
            navigate('/user/my-listings');
          }
        } else {
          throw new Error(response.message || 'İlan güncellenemedi');
        }
      } else {
        console.log('✅ Kamyon Römorku ilanı oluşturuluyor:', payload);
        const response = await listingService.createStandardListing(payload);
        
        if (response.success) {
          console.log('✅ Kamyon Römorku ilanı başarıyla oluşturuldu:', response.data);
          const shouldNavigate = await confirm({
            title: 'İlan Başarıyla Oluşturuldu! 🎉',
            description: 'İlanınız başarıyla oluşturuldu ve inceleme sürecine alındı. Onaylandıktan sonra yayına alınacak. Ana sayfaya dönmek istiyor musunuz?',
            severity: 'success',
            confirmText: 'Ana Sayfaya Git',
            cancelText: 'Bu Sayfada Kal'
          });
          if (shouldNavigate) {
            navigate('/');
          }
        } else {
          throw new Error(response.message || 'İlan oluşturulamadı');
        }
      }

    } catch (error) {
      console.error('İlan oluşturma hatası:', error);
      await confirm({
        title: 'Hata',
        description: error instanceof Error ? error.message : 'İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
        severity: 'error',
        confirmText: 'Tamam',
        cancelText: ''
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalFiles = formData.images.length + newFiles.length;

    if (totalFiles > 15) {
      await confirm({
        title: 'Maksimum Dosya Sayısı',
        description: 'En fazla 15 fotoğraf yükleyebilirsiniz.',
        severity: 'warning',
        confirmText: 'Tamam',
        cancelText: ''
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newFiles]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Üretim yılları (son 30 yıl)
  const currentYear = new Date().getFullYear();
  const productionYears = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Typography variant="h5" gutterBottom>{getStepTitle()}</Typography>
            <TextField
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Açıklama"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={4}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Üretim Yılı</InputLabel>
              <Select
                value={formData.productionYear}
                label="Üretim Yılı"
                onChange={(e) => setFormData(prev => ({ ...prev, productionYear: e.target.value }))}
              >
                {productionYears.map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="h5" gutterBottom>{getStepTitle()}</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Uzunluk (cm)"
                type="number"
                value={formData.length}
                onChange={(e) => setFormData(prev => ({ ...prev, length: e.target.value }))}
                fullWidth
                required
                inputProps={{ min: 0 }}
              />
              <TextField
                label="Genişlik (cm)"
                type="number"
                value={formData.width}
                onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                fullWidth
                required
                inputProps={{ min: 0 }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.hasTent}
                    onChange={(e) => setFormData(prev => ({ ...prev, hasTent: e.target.checked }))}
                  />
                }
                label="Tente"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.hasDamper}
                    onChange={(e) => setFormData(prev => ({ ...prev, hasDamper: e.target.checked }))}
                  />
                }
                label="Damper"
              />
            </Box>
            
            <FormControl component="fieldset">
              <FormLabel component="legend">Takaslı</FormLabel>
              <RadioGroup
                value={formData.exchangeable}
                onChange={(e) => setFormData(prev => ({ ...prev, exchangeable: e.target.value }))}
                row
              >
                <FormControlLabel value="evet" control={<Radio />} label="Evet" />
                <FormControlLabel value="hayır" control={<Radio />} label="Hayır" />
              </RadioGroup>
            </FormControl>
          </Stack>
        );

      case 2:
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
                  onChange={handleImageUpload}
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
                        onClick={() => removeImage(index)}
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

      case 3:
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
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
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
                value={selectedCity}
                onChange={(_, newValue) => handleCityChange(newValue)}
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
              value={selectedDistrict}
              onChange={(_, newValue) => {
                setSelectedDistrict(newValue);
                setFormData(prev => ({ ...prev, district: newValue?.name || '' }));
              }}
              loading={loadingDistricts}
              disabled={!selectedCity}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="İlçe"
                  placeholder={selectedCity ? "İlçe seçin" : "Önce şehir seçin"}
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
                value={formData.contactName}
                onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Person /></InputAdornment>,
                }}
                required
              />

              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Telefon"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
        return 'Bilinmeyen adım';
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        {getFormTitle()}
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 2, mb: 1 }}>
        {renderStepContent(activeStep)}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <Button
          color="inherit"
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Geri
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep === steps.length - 1 ? (
          <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'İlan Oluşturuluyor...' : 'İlanı Yayınla'}
          </Button>
        ) : (
          <Button onClick={handleNext} variant="contained">
            İleri
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default KamyonRomorkForm;
