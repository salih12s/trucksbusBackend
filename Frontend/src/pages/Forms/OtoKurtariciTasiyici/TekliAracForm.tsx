import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Stepper, Step, StepLabel, Card, CardContent, MenuItem, Stack, Chip, InputAdornment, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Checkbox, FormGroup, Autocomplete, Alert } from '@mui/material';
import { AttachMoney, Upload, LocationOn, Person, Phone, Email, DirectionsCar, Build, Security } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { locationService, City, District } from '../../../services/locationService';
import { categoryService } from '../../../services/categoryService';
import { createStandardPayload, validateListingPayload } from '../../../services/apiNormalizer';
import { listingService } from '../../../services/listingService';


interface TekliAracFormData {
  // 1. Sayfa - İlan Detayları
  title: string;
  description: string;
  modelYear: string;

  // 2. Sayfa - Araç Bilgileri
  vehicleBrand: string;
  km: string;
  engineVolume: string;
  maxPowerHP: string;
  maxTorqueNm: string;
  fuelType: string;
  platformLength: string;
  platformWidth: string;
  heavyCommercialTransport: boolean;
  loadCapacity: string;
  licensePlate: string;
  isExchangeable: string;

  // 3. Sayfa - Detaylı Bilgi
  towingEquipment: string[];
  safetyFeatures: string[];
  vehicleEquipment: string[];

  // 4. Sayfa - Fotoğraflar
  uploadedImages: File[];

  // 5. Sayfa - İletişim & Fiyat
  price: string;
  priceType: string;
  currency: string;
  sellerPhone: string;
  sellerName: string;
  sellerEmail: string;
  city: string;
  district: string;

  // Backend için gerekli ID'ler - MinibüsForm uyumlu
  category_id?: string | number;
  vehicle_type_id?: string | number;
  brand_id?: string;
  model_id?: string;
  variant_id?: string;
  city_id?: string;
  district_id?: string;
}

const steps = ['İlan Detayları', 'Araç Bilgileri', 'Detaylı Bilgi', 'Fotoğraflar', 'İletişim & Fiyat'];

const TekliAracForm: React.FC = () => {
  const { confirm } = useConfirmDialog();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<TekliAracFormData>({
    title: '',
    description: '',
    modelYear: '',
    vehicleBrand: '',
    km: '',
    engineVolume: '',
    maxPowerHP: '',
    maxTorqueNm: '',
    fuelType: '',
    platformLength: '',
    platformWidth: '',
    heavyCommercialTransport: false,
    loadCapacity: '',
    licensePlate: '',
    isExchangeable: '',
    towingEquipment: [],
    safetyFeatures: [],
    vehicleEquipment: [],
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

  const { user } = useAuth();
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [submitError, setSubmitError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  

  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Load categories and find "Oto Kurtarıcı & Taşıyıcı" category
  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        console.log('🔍 Loading categories...');
        const categories = await categoryService.getCategories();
        console.log('📋 Available categories:', categories.map(c => c.name));
        
        // "Vasıta" kategorisini bulalım
        const targetCategory = categories.find(cat => cat.name === 'Vasıta');
        
        if (targetCategory) {
          console.log('📋 Found category:', targetCategory.name, 'ID:', targetCategory.id);
          
          // Get vehicle types for this category
          const vehicleTypes = await categoryService.getVehicleTypesByCategory(targetCategory.id);
          console.log('🚗 Available vehicle types:', vehicleTypes.map(v => v.name));
          
          const tekliAracType = vehicleTypes.find(type => 
            type.name === 'Oto Kurtarıcı & Taşıyıcı'
          );
          
          if (tekliAracType) {
            console.log('🚗 Found vehicle type:', tekliAracType.name, 'ID:', tekliAracType.id);
            
            // Update form data with IDs
            setFormData(prev => ({
              ...prev,
              category_id: targetCategory.id,
              vehicle_type_id: tekliAracType.id
            }));
            
            console.log('✅ Form updated with category_id:', targetCategory.id, 'vehicle_type_id:', tekliAracType.id);
          } else {
            console.warn('⚠️ Tekli Araç vehicle type not found');
          }
        } else {
          console.warn('⚠️ Vasıta category not found');
        }
      } catch (error) {
        console.error('❌ Error loading category data:', error);
        setSubmitError('Kategori bilgileri yüklenemedi');
      }
    };
    
    loadCategoryData();
  }, []);

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        sellerName: `${user.first_name} ${user.last_name}`,
        sellerEmail: user.email || ''
      }));
    }
  }, [user]);

  // Load cities on component mount - MinibüsForm uyumlu
  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoadingCities(true);
        const citiesData = await locationService.getCities();
        setCities(citiesData);
        console.log('🏙️ TekliAracForm: Şehirler yüklendi:', citiesData.length);
      } catch (error) {
        console.error('❌ TekliAracForm: Şehirler yüklenemedi:', error);
      } finally {
        setLoadingCities(false);
      }
    };
    
    loadCities();
  }, []);

  // Load districts when city changes - MinibüsForm uyumlu
  const handleCityChange = async (cityId: string, cityName: string) => {
    try {
      setLoadingDistricts(true);
      setFormData(prev => ({ ...prev, city: cityName, district: '', city_id: cityId }));
      
      const districtsData = await locationService.getDistrictsByCity(cityId);
      setDistricts(districtsData);
      console.log('🏘️ TekliAracForm: İlçeler yüklendi:', districtsData.length);
    } catch (error) {
      console.error('❌ TekliAracForm: İlçeler yüklenemedi:', error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };
  const handleBack = () => setActiveStep((prev) => prev - 1);
  
  const validateStep = (step: number): boolean => {
    setSubmitError('');
    
    switch (step) {
      case 0: // İlan Detayları
        if (!formData.title.trim()) {
          setSubmitError('İlan başlığı zorunludur');
          return false;
        }
        if (!formData.description.trim()) {
          setSubmitError('İlan açıklaması zorunludur');
          return false;
        }
        if (!formData.modelYear) {
          setSubmitError('Model yılı zorunludur');
          return false;
        }
        break;
      case 1: // Araç Bilgileri
        if (!formData.vehicleBrand.trim()) {
          setSubmitError('Araç markası zorunludur');
          return false;
        }
        if (!formData.km) {
          setSubmitError('KM bilgisi zorunludur');
          return false;
        }
        if (!formData.fuelType) {
          setSubmitError('Yakıt türü zorunludur');
          return false;
        }
        break;
      case 4: // İletişim & Fiyat
        if (!formData.price) {
          setSubmitError('Fiyat bilgisi zorunludur');
          return false;
        }
        if (!formData.sellerPhone.trim()) {
          setSubmitError('Telefon numarası zorunludur');
          return false;
        }
        if (!formData.city) {
          setSubmitError('İl seçimi zorunludur');
          return false;
        }
        if (!formData.district) {
          setSubmitError('İlçe seçimi zorunludur');
          return false;
        }
        break;
    }
    return true;
  };

 
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Kategori/araç tipi kesin dolu olsun
      if (!formData.category_id || !formData.vehicle_type_id) {
        setSubmitError('Sistemsel: kategori/araç tipi atanamadı. Lütfen sayfayı yenileyin.');
        setIsSubmitting(false);
        return;
      }
      
      // Convert uploaded images to base64 - MinibüsForm uyumlu
      const imageUrls = await Promise.all(
        formData.uploadedImages.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      // Create standardized payload - MinibüsForm uyumlu
      const standardPayload = createStandardPayload({
        title: formData.title,
        description: formData.description,
        price: formData.price.replace(/\./g, ''), // Remove dots from price
        year: formData.modelYear,
        km: formData.km.replace(/\./g, ''), // Remove dots from km
        city: formData.city,
        category_id: formData.category_id,
        vehicle_type_id: formData.vehicle_type_id,
        brand_id: formData.brand_id || null,
        model_id: formData.model_id || null,
        variant_id: formData.variant_id || null,
        city_id: formData.city_id,
        district_id: formData.district_id,
        seller_name: formData.sellerName,
        seller_phone: formData.sellerPhone.replace(/[^\d]/g, ''),
        seller_email: formData.sellerEmail,
        images: imageUrls,
        safetyFeatures: formData.safetyFeatures // Array olarak gönder
      }, {
        // Oto Kurtarıcı-specific properties
        engineVolume: formData.engineVolume,
        vehicleBrand: formData.vehicleBrand,
        licensePlate: formData.licensePlate,
        platformWidth: formData.platformWidth,
        platformLength: formData.platformLength,
        maxTorqueNm: formData.maxTorqueNm,
        maxPowerHP: formData.maxPowerHP,
        currency: formData.currency,
        loadCapacity: formData.loadCapacity,
        vehicleEquipment: formData.vehicleEquipment.join(', '),
        priceType: formData.priceType,
        towingEquipment: formData.towingEquipment.join(', '),
        isExchangeable: formData.isExchangeable,
        heavyCommercialTransport: formData.heavyCommercialTransport,
        fuel_type: formData.fuelType,
        color: "Belirtilmemiş",
        vehicle_condition: "İkinci El",
        transmission: "Manuel"
      });

      // Validate payload - MinibüsForm uyumlu
      const validation = validateListingPayload(standardPayload);
      if (!validation.isValid) {
        setSubmitError(validation.errors.join(', '));
        return;
      }

      console.log('Oto Kurtarıcı ilanı oluşturuluyor:', standardPayload);

      // Use standardized listing service - MinibüsForm uyumlu
      const response = await listingService.createStandardListing(standardPayload);
      console.log('API Response:', response);
      
      if (response.success) {
        await confirm({
          title: 'Başarılı',
          description: 'Oto Kurtarıcı ilanınız başarıyla oluşturuldu! Admin onayından sonra yayınlanacaktır.',
          severity: 'success',
          confirmText: 'Tamam',
          cancelText: ''
        });
        navigate('/user/my-listings');
      } else {
        throw new Error(response.message || 'İlan oluşturulamadı');
      }

    } catch (error: any) {
      console.error('İlan oluşturma hatası:', error);
      
      if (error.message.includes('Zorunlu alanları doldurunuz') || error.message.includes('zorunludur')) {
        setSubmitError('Zorunlu alanları doldurunuz');
      } else if (error.code === 'ECONNREFUSED') {
        setSubmitError('Sunucuya bağlanılamıyor. Lütfen backend\'in çalıştığından emin olun.');
      } else if (error.response?.status === 404) {
        setSubmitError('API endpoint bulunamadı. URL\'yi kontrol edin.');
      } else if (error.response?.status === 401) {
        setSubmitError('Yetkilendirme hatası. Lütfen giriş yapın.');
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'İlan oluşturulurken bir hata oluştu';
        setSubmitError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof TekliAracFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (submitError) setSubmitError('');
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    const totalFiles = formData.uploadedImages.length + newFiles.length;
    if (totalFiles > 15) {
      await confirm({
        title: 'Uyarı',
        description: 'En fazla 15 fotoğraf yükleyebilirsiniz.',
        severity: 'warning',
        confirmText: 'Tamam',
        cancelText: ''
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

  const vehicleBrands = [
    'Bedford', 'BMC', 'Chevrolet', 'Chrysler', 'Citroën', 'DAF', 'Dodge', 'Fiat', 'Ford',
    'Gazelle', 'Hino', 'Hyundai', 'Isuzu', 'Iveco', 'JAC', 'Kia', 'Liebherr', 'MAN',
    'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Opel', 'Otokar', 'Peugeot', 'Renault',
    'Scania', 'Tata', 'Volkswagen', 'Volvo', 'Diğer'
  ];

  const engineVolumeOptions = [
    '2000 - 2500', '2501 - 3000', '3001 - 3500', '3501 - 4000',
    '4001 - 4500', '4501 - 5000', '5001 - 5500'
  ];

  const fuelTypeOptions = ['Benzinli', 'Benzin + LPG', 'Dizel', 'Dizel + LPG'];

  const towingEquipmentOptions = [
    'Kayar Platform', 'Palet', 'Rampa', 'Makara', 'Vinç', 'Ahtapot Vinç',
    'Gözlük', 'Hi-Up'
  ];

  const safetyFeaturesOptions = ['Piston Ayak', 'Takoz', 'Sabitleme Halatı'];

  const vehicleEquipmentOptions = [
    'Hidrolik Direksiyon', 'ABS', 'Hava Yastığı', 'Tepe Lambası', 'Takograf',
    'Havalı Fren', 'Motor Freni', 'Alarm', 'Merkezi Kilit', 'GPS'
  ];

  const handleCheckboxChange = (field: 'towingEquipment' | 'safetyFeatures' | 'vehicleEquipment', value: string) => {
    const currentValues = formData[field] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    handleInputChange(field, newValues);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                İlan Detayları
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
                label="Model Yılı"
                value={formData.modelYear}
                onChange={(e) => handleInputChange('modelYear', e.target.value)}
                margin="normal"
                required
              >
                {generateYearOptions().map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DirectionsCar color="primary" />
                Araç Bilgileri
              </Typography>
              
              <TextField
                select
                fullWidth
                label="Araç Markası"
                value={formData.vehicleBrand}
                onChange={(e) => handleInputChange('vehicleBrand', e.target.value)}
                margin="normal"
                required
              >
                {vehicleBrands.map((brand) => (
                  <MenuItem key={brand} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  fullWidth
                  label="KM"
                  value={formData.km}
                  onChange={(e) => handleInputChange('km', e.target.value)}
                  type="number"
                  required
                />
                
                <TextField
                  select
                  fullWidth
                  label="Motor Hacmi"
                  value={formData.engineVolume}
                  onChange={(e) => handleInputChange('engineVolume', e.target.value)}
                  required
                >
                  {engineVolumeOptions.map((volume) => (
                    <MenuItem key={volume} value={volume}>
                      {volume}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  fullWidth
                  label="Maksimum Güç (HP)"
                  value={formData.maxPowerHP}
                  onChange={(e) => handleInputChange('maxPowerHP', e.target.value)}
                  type="number"
                  required
                />
                
                <TextField
                  fullWidth
                  label="Maksimum Tork (Nm)"
                  value={formData.maxTorqueNm}
                  onChange={(e) => handleInputChange('maxTorqueNm', e.target.value)}
                  type="number"
                  required
                />
              </Box>

              <TextField
                select
                fullWidth
                label="Yakıt Tipi"
                value={formData.fuelType}
                onChange={(e) => handleInputChange('fuelType', e.target.value)}
                margin="normal"
                required
              >
                {fuelTypeOptions.map((fuel) => (
                  <MenuItem key={fuel} value={fuel}>
                    {fuel}
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  fullWidth
                  label="Platform Uzunluğu (m)"
                  value={formData.platformLength}
                  onChange={(e) => handleInputChange('platformLength', e.target.value)}
                  type="number"
                  inputProps={{ step: 0.1 }}
                  required
                />
                
                <TextField
                  fullWidth
                  label="Platform Genişliği (m)"
                  value={formData.platformWidth}
                  onChange={(e) => handleInputChange('platformWidth', e.target.value)}
                  type="number"
                  inputProps={{ step: 0.1 }}
                  required
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.heavyCommercialTransport}
                      onChange={(e) => handleInputChange('heavyCommercialTransport', e.target.checked)}
                    />
                  }
                  label="Ağır Ticari Taşıma"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  fullWidth
                  label="İstiap Haddi (t)"
                  value={formData.loadCapacity}
                  onChange={(e) => handleInputChange('loadCapacity', e.target.value)}
                  type="number"
                  inputProps={{ step: 0.1 }}
                  required
                />
                
                <TextField
                  fullWidth
                  label="Araç Plakası"
                  value={formData.licensePlate}
                  onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                  placeholder="34 ABC 123"
                  required
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

      case 2:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Build color="primary" />
                Detaylı Bilgi
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Çekici Ekipmanı
                </Typography>
                <FormGroup>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {towingEquipmentOptions.map((equipment) => (
                      <FormControlLabel
                        key={equipment}
                        control={
                          <Checkbox
                            checked={formData.towingEquipment.includes(equipment)}
                            onChange={() => handleCheckboxChange('towingEquipment', equipment)}
                          />
                        }
                        label={equipment}
                        sx={{ minWidth: '200px' }}
                      />
                    ))}
                  </Box>
                </FormGroup>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                  <Security sx={{ mr: 1 }} />
                  Güvenlik Özellikleri
                </Typography>
                <FormGroup>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {safetyFeaturesOptions.map((feature) => (
                      <FormControlLabel
                        key={feature}
                        control={
                          <Checkbox
                            checked={formData.safetyFeatures.includes(feature)}
                            onChange={() => handleCheckboxChange('safetyFeatures', feature)}
                          />
                        }
                        label={feature}
                        sx={{ minWidth: '200px' }}
                      />
                    ))}
                  </Box>
                </FormGroup>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Araç Donanımları
                </Typography>
                <FormGroup>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {vehicleEquipmentOptions.map((equipment) => (
                      <FormControlLabel
                        key={equipment}
                        control={
                          <Checkbox
                            checked={formData.vehicleEquipment.includes(equipment)}
                            onChange={() => handleCheckboxChange('vehicleEquipment', equipment)}
                          />
                        }
                        label={equipment}
                        sx={{ minWidth: '200px' }}
                      />
                    ))}
                  </Box>
                </FormGroup>
              </Box>
            </CardContent>
          </Card>
        );

      case 3:
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

      case 4:
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
                onChange={(_, newValue) => {
                  if (newValue) {
                    handleCityChange(newValue.id, newValue.name);
                  } else {
                    setFormData(prev => ({ ...prev, city: '', district: '', city_id: '', district_id: '' }));
                    setDistricts([]);
                  }
                }}
                loading={loadingCities}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="İl"
                    placeholder="İl seçin"
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>
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
              onChange={(_, newValue) => {
                setFormData(prev => ({ 
                  ...prev, 
                  district: newValue ? newValue.name : '',
                  district_id: newValue ? newValue.id : ''
                }));
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
                    startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>
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
                  startAdornment: <InputAdornment position="start"><Person /></InputAdornment>
                }}
                disabled
                helperText="Kullanıcı profilinden otomatik dolduruldu"
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
              disabled
              helperText="Kullanıcı profilinden otomatik dolduruldu"
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
        Tekli Araç İlanı Ver
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

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

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
            {isSubmitting ? 'İlan Gönderiliyor...' : 'İlanı Yayınla'}
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

export default TekliAracForm;
