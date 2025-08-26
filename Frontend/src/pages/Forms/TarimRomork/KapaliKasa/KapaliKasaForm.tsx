import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { listingService } from '../../../../services/listingService';
import { createStandardPayload, validateListingPayload } from '../../../../services/apiNormalizer';
import { useNavigate, useLocation } from 'react-router-dom';
import { useConfirmDialog } from '../../../../hooks/useConfirmDialog';
import { locationService } from '../../../../services/locationService';
import { useEditListing } from '../../../../hooks/useEditListing';
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

const steps = ['İlan Bilgileri', 'Fotoğraflar', 'İletişim & Fiyat'];

const KapaliKasaForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { confirm } = useConfirmDialog();
  const { isEditMode, editData, editLoading, fillFormWithEditData } = useEditListing();
  
  // Location state'den gelen veriler
  const selectedBrand = location.state?.brand;
  const selectedModel = location.state?.model;
  const selectedVariant = location.state?.variant;

  const [activeStep, setActiveStep] = useState(0);
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dinamik başlık fonksiyonları
  const getFormTitle = () => {
    if (selectedVariant?.variant_name) {
      return `${selectedVariant.variant_name} İlanı`;
    }
    if (selectedModel?.model_name) {
      return `${selectedModel.model_name} Kapalı Kasa İlanı`;
    }
    if (selectedBrand?.brand_name) {
      return `${selectedBrand.brand_name} Kapalı Kasa İlanı`;
    }
    return 'Kapalı Kasa Tarım Römorku İlanı';
  };

  const getStepTitle = () => {
    const baseName = selectedVariant?.variant_name || selectedModel?.model_name || 'Kapalı Kasa';
    return `${baseName} - ${steps[activeStep]}`;
  };

  // Şehir değişikliği yönetimi
  const handleCityChange = async (city: any) => {
    setSelectedCity(city);
    setSelectedDistrict(null);
    setFormData(prev => ({ ...prev, city: city?.name || '', district: '' }));
    
    if (city) {
      try {
        const cityDistricts = await locationService.getDistrictsByCity(city.id);
        setDistricts(cityDistricts);
      } catch (error) {
        console.error('İlçeler yüklenirken hata:', error);
      }
    } else {
      setDistricts([]);
    }
  };

  // Component mount olduğunda çalışacak
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Şehirleri yükle
        const citiesData = await locationService.getCities();
        setCities(citiesData);

        // Kullanıcı verilerini otomatik doldur
        if (user) {
          setFormData(prev => ({
            ...prev,
            contactName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            email: user.email || '',
            phone: user.phone || ''
          }));
        }
      } catch (error) {
        console.error('Başlangıç verileri yüklenirken hata:', error);
      }
    };

    loadInitialData();
  }, [user]);
  const [formData, setFormData] = useState({
    // İlan Bilgileri
    title: '',
    description: '',
    productionYear: '',
    hasDamper: false,
    exchangeable: '',
    // Fotoğraflar
    images: [] as File[],
    // İletişim & Fiyat
    contactName: '',
    phone: '',
    email: '',
    price: '',
    city: '',
    district: ''
  });

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
      if (!selectedCity) {
        await confirm({
          title: 'Eksik Bilgi',
          description: 'Şehir seçimi gereklidir',
          severity: 'warning',
          confirmText: 'Tamam',
          cancelText: ''
        });
        setIsSubmitting(false);
        return;
      }

      // Vehicle type kontrolü ve debug
      console.log('Debug - selectedBrand:', selectedBrand);
      console.log('Debug - selectedBrand.vehicle_type_id:', selectedBrand?.vehicle_type_id);
      console.log('Debug - selectedBrand.vehicle_types:', selectedBrand?.vehicle_types);
      console.log('Debug - selectedBrand.vehicle_types?.id:', selectedBrand?.vehicle_types?.id);
      
      if (!selectedBrand?.vehicle_type_id) {
        console.error('Vehicle type ID bulunamadı! selectedBrand structure:', selectedBrand);
        await confirm({
          title: 'Eksik Bilgi',
          description: 'Araç türü seçimi zorunludur',
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
        district_id: selectedDistrict?.id,
        
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
        hasDamper: formData.hasDamper ? 'Evet' : 'Hayır',
        isExchangeable: formData.exchangeable
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

      // API'ye gönder
      const response = await listingService.createStandardListing(payload);
      
      if (response.success) {
        console.log('✅ Kapalı Kasa Tarım Römorku ilanı başarıyla oluşturuldu:', response.data);
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
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.hasDamper}
                  onChange={(e) => setFormData(prev => ({ ...prev, hasDamper: e.target.checked }))}
                />
              }
              label="Damper"
            />
            
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

      case 1:
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
                      setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, ...files]
                      }));
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

      case 2:
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
                getOptionLabel={(option) => option.name || ''}
                value={selectedCity}
                onChange={(_, newValue) => handleCityChange(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="İl"
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start"><LocationOn /></InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
              />
            </Box>

            <Autocomplete
              fullWidth
              options={districts}
              getOptionLabel={(option) => option.name || ''}
              value={selectedDistrict}
              onChange={(_, newValue) => {
                setSelectedDistrict(newValue);
                setFormData(prev => ({ ...prev, district: newValue?.name || '' }));
              }}
              disabled={!selectedCity}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="İlçe"
                  placeholder={selectedCity ? "İlçe seçin" : "Önce il seçin"}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start"><LocationOn /></InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
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
          <Button onClick={handleSubmit} variant="contained">
            İlanı Yayınla
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

export default KapaliKasaForm;
