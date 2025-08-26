import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { listingService } from '../../../services/listingService';
import { useEditListing } from '../../../hooks/useEditListing';
import { createStandardPayload, validateListingPayload } from '../../../services/apiNormalizer';
import { locationService, City, District } from '../../../services/locationService';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  MenuItem,
  Stack,
  Chip,
  InputAdornment,
  Alert,
  Autocomplete
} from '@mui/material';
import { AttachMoney, Upload, LocationOn, Person, Phone, Email } from '@mui/icons-material';

interface SulamaFormData {
  title: string;
  description: string;
  productionYear: string;
  hasDamper: boolean;
  volume: string;
  isExchangeable: string;
  
  // Fotoğraf bilgileri - MinibusAdForm uyumlu
  uploadedImages: File[];
  
  // İletişim ve fiyat bilgileri
  price: string;
  priceType: string;
  currency: string;
  sellerPhone: string;
  sellerName: string;
  sellerEmail: string;
  city: string;
  district: string;
}

const steps = ['İlan Detayları', 'Fotoğraflar', 'İletişim & Fiyat'];

const SulamaForm: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { confirm } = useConfirmDialog();
  const { isEditMode, editData, editLoading, fillFormWithEditData } = useEditListing();
  
  // Location state'den gelen veriler
  const selectedBrand = location.state?.brand;
  const selectedModel = location.state?.model;
  const selectedVariant = location.state?.variant;
  
  const [activeStep, setActiveStep] = useState(0);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dinamik başlık fonksiyonları
  const getFormTitle = () => {
    if (selectedVariant?.variant_name) {
      return `${selectedVariant.variant_name} İlanı`;
    }
    if (selectedModel?.model_name) {
      return `${selectedModel.model_name} Sulama İlanı`;
    }
    if (selectedBrand?.brand_name) {
      return `${selectedBrand.brand_name} Sulama İlanı`;
    }
    return 'Sulama İlanı Ver';
  };

  const getStepTitle = () => {
    const baseName = selectedVariant?.variant_name || selectedModel?.model_name || 'Sulama';
    return `${baseName} - ${steps[activeStep]}`;
  };

  // Şehir değişikliği yönetimi
  const handleCityChange = async (city: any) => {
    setSelectedCity(city);
    setSelectedDistrict(null);
    setFormData(prev => ({ ...prev, district: '', city: city?.name || '' }));
    
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
  
  const [formData, setFormData] = useState<SulamaFormData>({
    title: '',
    description: '',
    productionYear: '',
    hasDamper: false,
    volume: '',
    isExchangeable: '',
    
    uploadedImages: [],
    
    price: '',
    priceType: 'fixed',
    currency: 'TRY',
    sellerPhone: user?.phone || '',
    sellerName: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
    sellerEmail: user?.email || '',
    city: '',
    district: ''
  });

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
            sellerName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            sellerEmail: user.email || '',
            sellerPhone: user.phone || ''
          }));
        }
      } catch (error) {
        console.error('Başlangıç verileri yüklenirken hata:', error);
      }
    };

    loadInitialData();
  }, [user]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (field: keyof SulamaFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalFiles = formData.uploadedImages.length + newFiles.length;

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
      uploadedImages: [...prev.uploadedImages, ...newFiles]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter((_, i) => i !== index)
    }));
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 30; year--) {
      years.push(year.toString());
    }
    return years;
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
        { field: 'volume', message: 'Hacim bilgisi gereklidir' },
        { field: 'price', message: 'Fiyat bilgisi gereklidir' },
        { field: 'sellerName', message: 'İletişim adı gereklidir' },
        { field: 'sellerPhone', message: 'Telefon numarası gereklidir' }
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
        formData.uploadedImages.map((file) => {
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
        seller_name: formData.sellerName,
        seller_phone: formData.sellerPhone,
        seller_email: formData.sellerEmail || undefined,
        
        // Yıl
        year: parseInt(formData.productionYear),
        
        // Fotoğraflar
        images: base64Images
      }, {
        // Özel özellikler (additional properties)
        hasDamper: formData.hasDamper ? 'Evet' : 'Hayır',
        volume: formData.volume,
        isExchangeable: formData.isExchangeable
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
        console.log('✅ Sulama Römorku ilanı başarıyla oluşturuldu:', response.data);
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

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {getStepTitle()}
              </Typography>
              
              <TextField
                fullWidth
                label="İlan Başlığı"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="Açıklama"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                margin="normal"
                multiline
                rows={4}
                required
              />
              
              <TextField
                select
                fullWidth
                label="Üretim Yılı"
                value={formData.productionYear}
                onChange={(e) => handleInputChange('productionYear', e.target.value)}
                margin="normal"
                required
              >
                {generateYearOptions().map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.hasDamper}
                    onChange={(e) => handleInputChange('hasDamper', e.target.checked)}
                  />
                }
                label="Damper"
                sx={{ mt: 2, mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Hacim (m³)"
                value={formData.volume}
                onChange={(e) => handleInputChange('volume', e.target.value)}
                margin="normal"
                type="number"
                required
              />
              
              <FormControl component="fieldset" margin="normal" fullWidth>
                <FormLabel component="legend">Takaslı</FormLabel>
                <RadioGroup
                  value={formData.isExchangeable}
                  onChange={(e) => handleInputChange('isExchangeable', e.target.value)}
                  row
                >
                  <FormControlLabel value="evet" control={<Radio />} label="Evet" />
                  <FormControlLabel value="hayır" control={<Radio />} label="Hayır" />
                </RadioGroup>
              </FormControl>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Upload color="primary" />
              Fotoğraf Yükleme
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aracınızın fotoğraflarını yükleyin (Maksimum 10 adet)
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
            {formData.uploadedImages.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Yüklenen Fotoğraflar ({formData.uploadedImages.length}/10)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {formData.uploadedImages.map((file, index) => (
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
                handleInputChange('district', newValue?.name || '');
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
                value={formData.sellerName}
                onChange={(e) => handleInputChange('sellerName', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Person /></InputAdornment>,
                }}
                required
              />

              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Telefon"
                value={formData.sellerPhone}
                onChange={(e) => handleInputChange('sellerPhone', e.target.value)}
                placeholder="(5XX) XXX XX XX"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Phone /></InputAdornment>,
                }}
                required
                error={!formData.sellerPhone}
                helperText={!formData.sellerPhone ? "Telefon numarası zorunludur" : ""}
              />
            </Box>

            <TextField
              fullWidth
              label="E-posta"
              value={formData.sellerEmail}
              onChange={(e) => handleInputChange('sellerEmail', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email /></InputAdornment>,
              }}
              type="email"
              required
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
        <Typography variant="h4" component="h1" gutterBottom>
          {getFormTitle()}
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mb: 4 }}>
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

export default SulamaForm;
