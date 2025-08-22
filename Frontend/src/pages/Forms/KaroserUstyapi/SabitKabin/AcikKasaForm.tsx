import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { useConfirmDialog } from '../../../../hooks/useConfirmDialog';
import { listingService } from '../../../../services/listingService';
import { createStandardPayload, validateListingPayload } from '../../../../services/apiNormalizer';
import { locationService, City, District } from '../../../../services/locationService';
import { Box, Button, TextField, Typography, Stepper, Step, StepLabel, Card, CardContent, MenuItem, Stack, Chip, InputAdornment, Alert, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Checkbox, Autocomplete } from '@mui/material';
import { AttachMoney, Upload, LocationOn, Person, Phone, Email } from '@mui/icons-material';

interface AcikKasaFormData {
  title: string;
  description: string;
  productionYear: string;
  bodyStructure: string;
  length: string;
  width: string;
  hasTarpaulin: boolean;
  isExchangeable: string;
  uploadedImages: File[];
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

const AcikKasaForm: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { confirm } = useConfirmDialog();
  const selectedBrand = location.state?.brand;
  const selectedModel = location.state?.model;
  const selectedVariant = location.state?.variant;
  
  console.log('🚀 AcikKasaForm location state:', location.state);
  console.log('📋 Selected Brand:', selectedBrand);
  console.log('📋 Selected Model:', selectedModel);
  console.log('📋 Selected Variant:', selectedVariant);
  console.log('👤 User Context:', user);
  
  const [activeStep, setActiveStep] = useState(0);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    phone: '',
    email: '',
    loading: true
  });

  const [formData, setFormData] = useState<AcikKasaFormData>({
    title: '',
    description: '',
    productionYear: '',
    bodyStructure: '',
    length: '',
    width: '',
    hasTarpaulin: false,
    isExchangeable: '',
    uploadedImages: [],
    price: '',
    priceType: 'fixed',
    currency: 'TRY',
    sellerPhone: '',
    sellerName: '',
    sellerEmail: '',
    city: '',
    district: ''
  });

  // Dynamic form title generation
  const getFormTitle = () => {
    if (selectedBrand && selectedModel && selectedVariant) {
      return `${selectedBrand.name} ${selectedModel.name} ${selectedVariant.name} - Açık Kasa`;
    } else if (selectedBrand && selectedModel) {
      return `${selectedBrand.name} ${selectedModel.name} - Açık Kasa`;
    } else if (selectedBrand) {
      return `${selectedBrand.name} - Açık Kasa`;
    }
    return 'Açık Kasa İlanı Ver';
  };

  const getStepTitle = (step: number) => {
    const baseTitle = selectedBrand ? `${selectedBrand.name} Açık Kasa` : 'Açık Kasa';
    const stepTitles = [
      `${baseTitle} - İlan Detayları`,
      `${baseTitle} - Fotoğraf Yükleme`,
      `${baseTitle} - İletişim & Fiyat`
    ];
    return stepTitles[step] || baseTitle;
  };

  // Load user info from backend
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        if (user?.id) {
          // Backend'den user bilgilerini çek
          console.log('👤 Loading user info for user ID:', user.id);
          
          // Gerçek API çağrısı burada olacak
          // const userProfile = await userService.getUserProfile(user.id);
          
          // Şimdilik user context'den alıyoruz
          const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
          const userPhone = user.phone || '';
          const userEmail = user.email || '';
          
          setUserInfo({
            name: userName,
            phone: userPhone,
            email: userEmail,
            loading: false
          });
          
          // Form data'yı güncelle
          setFormData(prev => ({
            ...prev,
            sellerName: userName,
            sellerPhone: userPhone,
            sellerEmail: userEmail
          }));
          
          console.log('✅ User info loaded:', { name: userName, phone: userPhone, email: userEmail });
        }
      } catch (error) {
        console.error('❌ Error loading user info:', error);
        setUserInfo(prev => ({ ...prev, loading: false }));
        confirm({
          title: 'Hata',
          description: 'Kullanıcı bilgileri yüklenirken bir hata oluştu.',
          severity: 'error'
        });
      }
    };

    loadUserInfo();
  }, [user, confirm]);

  // Load cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const citiesData = await locationService.getCities();
        setCities(citiesData);
        console.log('🏙️ Cities loaded:', citiesData.length);
      } catch (error) {
        console.error('Şehirler yüklenirken hata:', error);
        confirm({
          title: 'Hata',
          description: 'Şehirler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.',
          severity: 'error'
        });
      } finally {
        setLoadingCities(false);
      }
    };
    
    loadCities();
  }, [confirm]);

  // Load districts when city changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (!selectedCity) {
        setDistricts([]);
        setSelectedDistrict(null);
        return;
      }

      setLoadingDistricts(true);
      try {
        const districtsData = await locationService.getDistrictsByCity(selectedCity.id);
        setDistricts(districtsData);
        console.log('🏘️ Districts loaded for', selectedCity.name, ':', districtsData.length);
      } catch (error) {
        console.error('İlçeler yüklenirken hata:', error);
        confirm({
          title: 'Hata',
          description: 'İlçeler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.',
          severity: 'error'
        });
      } finally {
        setLoadingDistricts(false);
      }
    };
    
    loadDistricts();
  }, [selectedCity, confirm]);

  const handleSubmit = async () => {
    // Validation with user-friendly modals
    if (!selectedBrand?.vehicle_type_id) {
      confirm({
        title: 'Eksik Bilgi',
        description: 'Araç türü seçimi zorunludur. Lütfen araç seçim sayfasına geri dönün.',
        severity: 'warning'
      });
      return;
    }

    if (!formData.title?.trim()) {
      confirm({
        title: 'Eksik Bilgi',
        description: 'İlan başlığı zorunludur.',
        severity: 'warning'
      });
      return;
    }

    if (!formData.description?.trim()) {
      confirm({
        title: 'Eksik Bilgi', 
        description: 'Açıklama zorunludur.',
        severity: 'warning'
      });
      return;
    }

    if (!formData.productionYear) {
      confirm({
        title: 'Eksik Bilgi',
        description: 'Üretim yılı seçimi zorunludur.',
        severity: 'warning'
      });
      return;
    }

    if (!formData.bodyStructure) {
      confirm({
        title: 'Eksik Bilgi',
        description: 'Karoser yapısı seçimi zorunludur.',
        severity: 'warning'
      });
      return;
    }

    if (!formData.length?.trim() || !formData.width?.trim()) {
      confirm({
        title: 'Eksik Bilgi',
        description: 'Uzunluk ve genişlik bilgileri zorunludur.',
        severity: 'warning'
      });
      return;
    }

    if (!formData.isExchangeable) {
      confirm({
        title: 'Eksik Bilgi',
        description: 'Takas durumu seçimi zorunludur.',
        severity: 'warning'
      });
      return;
    }

    if (!formData.price?.trim()) {
      confirm({
        title: 'Eksik Bilgi',
        description: 'Fiyat bilgisi zorunludur.',
        severity: 'warning'
      });
      return;
    }

    if (!selectedCity || !selectedDistrict) {
      confirm({
        title: 'Eksik Bilgi',
        description: 'Şehir ve ilçe seçimi zorunludur.',
        severity: 'warning'
      });
      return;
    }

    if (!formData.sellerName?.trim() || !formData.sellerPhone?.trim() || !formData.sellerEmail?.trim()) {
      confirm({
        title: 'Eksik Bilgi',
        description: 'Kullanıcı bilgileri eksik. Lütfen profil bilgilerinizi tamamlayın.',
        severity: 'warning'
      });
      return;
    }

    if (formData.uploadedImages.length === 0) {
      confirm({
        title: 'Eksik Bilgi',
        description: 'En az bir fotoğraf yüklemeniz gerekiyor.',
        severity: 'warning'
      });
      return;
    }

    // Confirm submission
    const confirmSubmit = await confirm({
      title: 'İlan Yayınlansın mı?',
      description: 'İlanınız moderatör onayından sonra yayınlanacaktır. Devam etmek istediğinizden emin misiniz?',
      severity: 'info'
    });

    if (!confirmSubmit) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('🚀 AcikKasa form submission starting...');
      console.log('📋 Form Data:', formData);
      console.log('🏢 Selected City:', selectedCity);
      console.log('🏘️ Selected District:', selectedDistrict);

      // Convert images to base64
      const base64Images = await Promise.all(
        formData.uploadedImages.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () => reject(new Error('Fotoğraf dönüştürülemedi'));
            reader.readAsDataURL(file);
          });
        })
      );

      console.log('📸 Images converted to base64, count:', base64Images.length);

      // Create standardized payload
      const payload = createStandardPayload({
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        year: parseInt(formData.productionYear),
        city: selectedCity.name,
        city_id: selectedCity.id,
        district_id: selectedDistrict.id,
        category_id: selectedBrand?.vehicle_types?.categories?.id || "vehicle-category-001",
        seller_name: formData.sellerName.trim(),
        seller_phone: formData.sellerPhone.trim(),
        seller_email: formData.sellerEmail.trim(),
        is_exchangeable: formData.isExchangeable === 'evet',
        images: base64Images,
        vehicle_type_id: selectedBrand?.vehicle_type_id,
        brand_id: selectedBrand?.id,
        model_id: selectedModel?.id,
        variant_id: selectedVariant?.id
      }, {
        // AcikKasa specific properties
        bodyStructure: formData.bodyStructure,
        length: formData.length,
        width: formData.width,
        hasTarpaulin: formData.hasTarpaulin,
        currency: formData.currency,
        priceType: formData.priceType
      });

      console.log('📦 Payload created:', payload);

      // Validate payload
      const validationResult = validateListingPayload(payload);
      if (!validationResult.isValid) {
        console.error('❌ Validation failed:', validationResult.errors);
        confirm({
          title: 'Veri Hatası',
          description: `Lütfen şu alanları kontrol edin: ${validationResult.errors.join(', ')}`,
          severity: 'error'
        });
        return;
      }

      console.log('✅ Payload validation passed');

      // Submit to API
      const response = await listingService.createStandardListing(payload);
      
      if (response.success) {
        console.log('✅ AcikKasa listing created successfully:', response.data);
        
        await confirm({
          title: '🎉 Başarılı!',
          description: 'Açık Kasa ilanınız başarıyla oluşturuldu! Admin onayından sonra yayınlanacaktır. İlanlarım sayfasından durumunu takip edebilirsiniz.',
          severity: 'success'
        });
        
        // Reset form completely
        setFormData({
          title: '',
          description: '',
          productionYear: '',
          bodyStructure: '',
          length: '',
          width: '',
          hasTarpaulin: false,
          isExchangeable: '',
          uploadedImages: [],
          price: '',
          priceType: 'fixed',
          currency: 'TRY',
          sellerPhone: userInfo.phone,
          sellerName: userInfo.name,
          sellerEmail: userInfo.email,
          city: '',
          district: ''
        });
        setActiveStep(0);
        setSelectedCity(null);
        setSelectedDistrict(null);
        
        console.log('✅ Form reset completed');
      } else {
        throw new Error(response.message || 'İlan oluşturulamadı');
      }
    } catch (err: any) {
      console.error('❌ AcikKasa listing creation error:', err);
      confirm({
        title: 'Hata',
        description: err.message || 'İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleInputChange = (field: keyof AcikKasaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files);
    const totalFiles = formData.uploadedImages.length + newFiles.length;
    
    if (totalFiles > 15) {
      confirm({
        title: 'Dosya Sınırı',
        description: 'En fazla 15 fotoğraf yükleyebilirsiniz.',
        severity: 'warning'
      });
      return;
    }
    
    setFormData(prev => ({ ...prev, uploadedImages: [...prev.uploadedImages, ...newFiles] }));
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

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {getStepTitle(0)}
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Seçilen Araç:</strong> {selectedBrand?.name || 'Bilinmiyor'} 
                {selectedModel && ` - ${selectedModel.name}`}
                {selectedVariant && ` - ${selectedVariant.name}`}
              </Alert>
              
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

              <TextField
                select
                fullWidth
                label="Karoser Yapısı"
                value={formData.bodyStructure}
                onChange={(e) => handleInputChange('bodyStructure', e.target.value)}
                margin="normal"
                required
              >
                <MenuItem value="ahsap">Ahşap</MenuItem>
                <MenuItem value="metal">Metal</MenuItem>
                <MenuItem value="kompozit">Kompozit</MenuItem>
                <MenuItem value="fiberglass">Fiberglass</MenuItem>
              </TextField>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  fullWidth
                  label="Uzunluk (m)"
                  value={formData.length}
                  onChange={(e) => handleInputChange('length', e.target.value)}
                  type="number"
                  inputProps={{ step: 0.1, min: 0 }}
                  required
                />
                
                <TextField
                  fullWidth
                  label="Genişlik (m)"
                  value={formData.width}
                  onChange={(e) => handleInputChange('width', e.target.value)}
                  type="number"
                  inputProps={{ step: 0.1, min: 0 }}
                  required
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hasTarpaulin}
                      onChange={(e) => handleInputChange('hasTarpaulin', e.target.checked)}
                    />
                  }
                  label="Tente Var"
                />
              </Box>

              <FormControl component="fieldset" margin="normal" fullWidth>
                <FormLabel component="legend">Takaslı</FormLabel>
                <RadioGroup
                  value={formData.isExchangeable}
                  onChange={(e) => handleInputChange('isExchangeable', e.target.value)}
                  row
                >
                  <FormControlLabel value="evet" control={<Radio />} label="Evet" />
                  <FormControlLabel value="hayir" control={<Radio />} label="Hayır" />
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

            {formData.uploadedImages.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Yüklenen Fotoğraflar ({formData.uploadedImages.length}/15)
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
              <Autocomplete
                sx={{ flex: 1, minWidth: 200 }}
                options={cities}
                getOptionLabel={(option) => option.name}
                loading={loadingCities}
                value={selectedCity}
                onChange={(_, newValue) => {
                  setSelectedCity(newValue);
                  setSelectedDistrict(null);
                  handleInputChange('city', newValue?.name || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Şehir"
                    placeholder="Şehir seçin"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <LocationOn />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                    required
                  />
                )}
              />
              
              <Autocomplete
                sx={{ flex: 1, minWidth: 200 }}
                options={districts}
                getOptionLabel={(option) => option.name}
                loading={loadingDistricts}
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
                    placeholder={selectedCity ? "İlçe seçin" : "Önce şehir seçin"}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <LocationOn />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                    required
                  />
                )}
              />
            </Box>

            <TextField
              fullWidth
              label="Fiyat"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="Örn: 450.000"
              InputProps={{
                startAdornment: <InputAdornment position="start">
                  <AttachMoney />
                </InputAdornment>
              }}
              type="number"
              required
            />

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              📞 İletişim Bilgileri
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Ad Soyad"
                value={formData.sellerName}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Person /></InputAdornment>
                }}
                disabled={!userInfo.loading}
                required
                helperText={userInfo.loading ? "Bilgiler yükleniyor..." : "Profil bilgilerinizden otomatik alınmıştır"}
              />
              
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Telefon"
                value={formData.sellerPhone}
                placeholder="(5XX) XXX XX XX"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Phone /></InputAdornment>
                }}
                disabled={!userInfo.loading}
                required
                helperText={userInfo.loading ? "Bilgiler yükleniyor..." : "Profil bilgilerinizden otomatik alınmıştır"}
              />
            </Box>

            <TextField
              fullWidth
              label="E-posta"
              value={formData.sellerEmail}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email /></InputAdornment>
              }}
              type="email"
              disabled={!userInfo.loading}
              required
              helperText={userInfo.loading ? "Bilgiler yükleniyor..." : "Profil bilgilerinizden otomatik alınmıştır"}
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
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
          >
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

export default AcikKasaForm;
