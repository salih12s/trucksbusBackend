import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { listingService } from '../../../services/listingService';
import { createStandardPayload, validateListingPayload } from '../../../services/apiNormalizer';
import { locationService, City, District } from '../../../services/locationService';
import { Box, Button, TextField, Typography, Stepper, Step, StepLabel, Card, CardContent, FormControl, FormLabel, RadioGroup, Radio, MenuItem, Stack, Chip, InputAdornment, Alert, FormControlLabel, Autocomplete } from '@mui/material';
import { AttachMoney, Upload, LocationOn, Person, Phone, Email } from '@mui/icons-material';

interface OzelAmacliRomorkFormData {
  title: string;
  description: string;
  productionYear: string;
  type: string;
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

const OzelAmacliRomorkForm: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { confirm } = useConfirmDialog();
  
  // Brand/Model/Variant states - location.state'den gelecek
  const selectedVariant = location.state?.variant;
  const selectedModel = location.state?.model;
  const selectedBrand = location.state?.brand;
  
  const [activeStep, setActiveStep] = useState(0);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  
  const [formData, setFormData] = useState<OzelAmacliRomorkFormData>({
    title: '',
    description: '',
    productionYear: '',
    type: '',
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

  // Load cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const citiesData = await locationService.getCities();
        setCities(citiesData);
      } catch (error) {
        console.error('Şehirler yüklenirken hata:', error);
      } finally {
        setLoadingCities(false);
      }
    };
    
    loadCities();
  }, []);

  // Load districts when city changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (!formData.city) {
        setDistricts([]);
        return;
      }
      
      const selectedCity = cities.find(city => city.name === formData.city);
      if (!selectedCity) return;

      setLoadingDistricts(true);
      try {
        const districtsData = await locationService.getDistrictsByCity(selectedCity.id);
        setDistricts(districtsData);
      } catch (error) {
        console.error('İlçeler yüklenirken hata:', error);
      } finally {
        setLoadingDistricts(false);
      }
    };
    
    loadDistricts();
  }, [formData.city, cities]);

  const typeOptions = [
    'Seçiniz',
    'Cenaze Hizmeti',
    'Deniz Araçları',
    'Gezici Büfe',
    'Gezici Hizmetler',
    'İlkyardım Sedyesi',
    'Mobil Ev Taşıma',
    'Nakliye Asansörlü',
    'Reklam Platformu',
    'Sahneli & Kulisli',
    'Stantlı'
  ];

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleInputChange = (field: keyof OzelAmacliRomorkFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.price) {
      await confirm({
        title: 'Eksik Bilgi',
        description: 'Lütfen tüm gerekli alanları doldurun.',
        severity: 'warning'
      });
      return;
    }
    
    try {
      const base64Images = await Promise.all(
        formData.uploadedImages.map((file) => {
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
        await confirm({
          title: 'Eksik Bilgi',
          description: 'Lütfen şehir ve ilçe seçimi yapınız.',
          severity: 'warning'
        });
        return;
      }

      const payload = createStandardPayload({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        year: parseInt(formData.productionYear),
        city: formData.city,
        city_id: selectedCity.id,
        district_id: selectedDistrict.id,
        category_id: selectedBrand?.vehicle_types?.categories?.id || "vehicle-category-001",
        seller_name: formData.sellerName,
        seller_phone: formData.sellerPhone,
        seller_email: formData.sellerEmail,
        is_exchangeable: formData.isExchangeable === 'yes',
        images: base64Images,
        // Brand/Model/Variant bilgileri
        brand_id: selectedBrand?.id || "default-brand-id",
        model_id: selectedModel?.id || "default-model-id", 
        variant_id: selectedVariant?.id || null,
        vehicle_type_id: selectedBrand?.vehicle_type_id || selectedModel?.brands?.vehicle_type_id || "default-vehicle-type-id"
      }, {
        type: formData.type,
        currency: formData.currency,
        priceType: formData.priceType
      });

      const validationResult = validateListingPayload(payload);
      if (!validationResult.isValid) {
        await confirm({
          title: 'Doğrulama Hatası',
          description: `Veri doğrulama hatası: ${validationResult.errors.join(', ')}`,
          severity: 'error'
        });
        return;
      }

      const response = await listingService.createStandardListing(payload);
      
      if (response.success) {
        await confirm({
          title: 'Başarılı',
          description: 'İlanınız başarıyla oluşturuldu! Admin onayından sonra yayınlanacaktır.',
          severity: 'success'
        });
      } else {
        throw new Error(response.message || 'İlan oluşturulamadı');
      }
    } catch (err: any) {
      await confirm({
        title: 'Hata',
        description: err.message || 'İlan oluşturulurken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files);
    const totalFiles = formData.uploadedImages.length + newFiles.length;
    
    if (totalFiles > 15) {
      await confirm({
        title: 'Fotoğraf Limiti',
        description: 'En fazla 15 fotoğraf yükleyebilirsiniz.',
        severity: 'warning'
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

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Özel Amaçlı Römork İlan Detayları
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

              <TextField
                select
                fullWidth
                label="Tipi"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                margin="normal"
                required
              >
                {typeOptions.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>

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
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Fiyat"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="Örn: 450.000"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>
                }}
                required
              />
              <Autocomplete
                sx={{ flex: 1, minWidth: 200 }}
                options={cities}
                getOptionLabel={(option) => option.name}
                value={cities.find(city => city.name === formData.city) || null}
                onChange={(event, newValue) => {
                  handleInputChange('city', newValue?.name || '');
                  handleInputChange('district', ''); // Reset district when city changes
                }}
                loading={loadingCities}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="İl"
                    placeholder="Şehir seçin"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>
                    }}
                    required
                  />
                )}
              />
            </Box>

            <Autocomplete
              fullWidth
              options={districts}
              getOptionLabel={(option) => option.name}
              value={districts.find(district => district.name === formData.district) || null}
              onChange={(event, newValue) => {
                handleInputChange('district', newValue?.name || '');
              }}
              loading={loadingDistricts}
              disabled={!formData.city}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="İlçe"
                  placeholder={formData.city ? "İlçe seçin" : "Önce şehir seçin"}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>
                  }}
                  required
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
                  startAdornment: <InputAdornment position="start"><Person /></InputAdornment>
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
                  startAdornment: <InputAdornment position="start"><Phone /></InputAdornment>
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
                startAdornment: <InputAdornment position="start"><Email /></InputAdornment>
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
        Özel Amaçlı Römork İlanı Ver
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
          >
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

export default OzelAmacliRomorkForm;
