import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Stepper, Step, StepLabel, Card, CardContent, MenuItem, Stack, Chip, InputAdornment, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Checkbox, FormGroup, Autocomplete, Alert } from '@mui/material';
import { AttachMoney, Upload, LocationOn, Person, Phone, Email, DirectionsCar, Build, Security } from '@mui/icons-material';
import { locationService, City, District } from '../../../services/locationService';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../../services/api';

interface CokluAracFormData {
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
  maxVehicleCapacity: string; // Yeni eklenen
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
}

const steps = ['İlan Detayları', 'Araç Bilgileri', 'Detaylı Bilgi', 'Fotoğraflar', 'İletişim & Fiyat'];

const CokluAracForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Brand/Model/Variant states from navigation
  const selectedVariant = location.state?.variant;
  const selectedModel = location.state?.model;
  const selectedBrand = location.state?.brand;
  const [formData, setFormData] = useState<CokluAracFormData>({
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
    maxVehicleCapacity: '', // Yeni eklenen
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

  // Form step validation
  const validateStep = (step: number): { isValid: boolean; message?: string } => {
    switch (step) {
      case 0: // İlan Detayları
        if (!formData.title.trim()) {
          return { isValid: false, message: 'İlan başlığı gerekli' };
        }
        if (!formData.modelYear) {
          return { isValid: false, message: 'Model yılı gerekli' };
        }
        return { isValid: true };
      
      case 1: // Araç Bilgileri
        if (!formData.vehicleBrand) {
          return { isValid: false, message: 'Araç markası gerekli' };
        }
        if (!formData.fuelType) {
          return { isValid: false, message: 'Yakıt türü gerekli' };
        }
        if (!formData.maxVehicleCapacity) {
          return { isValid: false, message: 'Maksimum araç kapasitesi gerekli' };
        }
        return { isValid: true };
      
      case 2: // Detaylı Bilgi - Optional
        return { isValid: true };
      
      case 3: // Fotoğraflar
        if (formData.uploadedImages.length === 0) {
          return { isValid: false, message: 'En az 1 fotoğraf yüklenmeli' };
        }
        return { isValid: true };
      
      case 4: // İletişim & Fiyat
        if (!formData.price) {
          return { isValid: false, message: 'Fiyat gerekli' };
        }
        if (!formData.city) {
          return { isValid: false, message: 'İl seçimi gerekli' };
        }
        if (!formData.district) {
          return { isValid: false, message: 'İlçe seçimi gerekli' };
        }
        if (!formData.sellerPhone) {
          return { isValid: false, message: 'Telefon numarası gerekli' };
        }
        return { isValid: true };
      
      default:
        return { isValid: true };
    }
  };

  // State for cities and districts from API
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Load cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoadingCities(true);
        const citiesData = await locationService.getCities();
        setCities(citiesData);
        console.log('🏙️ CokluAracForm: Şehirler yüklendi:', citiesData.length);
      } catch (error) {
        console.error('❌ CokluAracForm: Şehirler yüklenemedi:', error);
      } finally {
        setLoadingCities(false);
      }
    };
    
    loadCities();
  }, []);

  // Populate user data when user is available
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

  // Populate brand/model/variant data from navigation
  useEffect(() => {
    if (selectedVariant && selectedModel && selectedBrand) {
      setFormData(prev => ({
        ...prev,
        // Additional data can be set here if needed
      }));
    }
  }, [selectedVariant, selectedModel, selectedBrand]);

  // Load districts when city changes
  const handleCityChange = async (cityId: string, cityName: string) => {
    try {
      setLoadingDistricts(true);
      setFormData(prev => ({ ...prev, city: cityName, district: '' }));
      
      const districtsData = await locationService.getDistrictsByCity(cityId);
      setDistricts(districtsData);
      console.log('🏘️ CokluAracForm: İlçeler yüklendi:', districtsData.length);
    } catch (error) {
      console.error('❌ CokluAracForm: İlçeler yüklenemedi:', error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleNext = () => {
    const validation = validateStep(activeStep);
    if (!validation.isValid) {
      setError(validation.message || 'Lütfen tüm zorunlu alanları doldurun');
      return;
    }
    setError(''); // Clear previous errors
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Form validation
      if (!formData.title || !formData.price || !formData.city) {
        setError('Zorunlu alanları doldurunuz');
        return;
      }

      // Convert uploaded images to data URLs for backend
      const imageUrls = await Promise.all(
        formData.uploadedImages.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      const listingData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price.replace(/\./g, '')), // Remove dots from price
        year: Number(formData.modelYear),
        km: Number(formData.km?.replace(/\./g, '')) || 0, // Remove dots from km
        category_id: selectedBrand?.vehicle_types?.categories?.id || "vehicle-category-001",
        vehicle_type_id: "cme633w8v0001981ksnpl6dj5", // Oto Kurtarıcı & Taşıyıcı vehicle_type_id
        brand_id: selectedBrand?.id || null,
        model_id: selectedModel?.id || null,
        variant_id: selectedVariant?.id || null,
        city_id: cities.find(city => city.name === formData.city)?.id || null,
        district_id: districts.find(district => district.name === formData.district)?.id || null,
        seller_name: formData.sellerName,
        seller_phone: formData.sellerPhone.replace(/[^\d]/g, ''),
        seller_email: formData.sellerEmail,
        color: 'Belirtilmemiş',
        fuel_type: formData.fuelType,
        transmission: 'Manuel',
        vehicle_condition: 'İyi',
        is_exchangeable: formData.isExchangeable === 'yes',
        images: imageUrls,
        safetyFeatures: formData.safetyFeatures, // safetyFeatures'ı ana objede gönder
        properties: {
          vehicleBrand: formData.vehicleBrand,
          engineVolume: formData.engineVolume,
          maxPowerHP: formData.maxPowerHP,
          maxTorqueNm: formData.maxTorqueNm,
          platformLength: formData.platformLength,
          platformWidth: formData.platformWidth,
          maxVehicleCapacity: formData.maxVehicleCapacity,
          loadCapacity: formData.loadCapacity,
          licensePlate: formData.licensePlate,
          towingEquipment: formData.towingEquipment,
          vehicleEquipment: formData.vehicleEquipment,
          priceType: formData.priceType,
          currency: formData.currency
        }
      };

      console.log('Çoklu Araç ilanı oluşturuluyor:', listingData);

      const response = await api.post('/listings', listingData);
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        alert('İlanınız başarıyla oluşturuldu! Admin onayından sonra yayınlanacaktır.');
        navigate('/');
      }

    } catch (error: any) {
      console.error('İlan oluşturma hatası:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.code === 'ECONNREFUSED') {
        setError('Sunucuya bağlanılamıyor. Lütfen backend\'in çalıştığından emin olun.');
      } else if (error.response?.status === 404) {
        setError('API endpoint bulunamadı. URL\'yi kontrol edin.');
      } else if (error.response?.status === 401) {
        setError('Yetkilendirme hatası. Lütfen giriş yapın.');
      } else {
        const errorMessage = error.response?.data?.message || 'İlan oluşturulurken bir hata oluştu';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (field: keyof CokluAracFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    const totalFiles = formData.uploadedImages.length + newFiles.length;
    if (totalFiles > 15) {
      alert('En fazla 15 fotoğraf yükleyebilirsiniz.');
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

  // Çoklu Araç için farklı marka listesi (attachmentlardan)
  const vehicleBrands = [
    'BMC', 'DAF', 'Dodge', 'Fiat', 'Ford', 'Gazelle', 'Hino', 'Hyundai',
    'Isuzu', 'Iveco', 'Kia', 'MAN', 'Mercedes', 'Mitsubishi', 'Otokar Atlas',
    'Özdemirsan', 'Renault', 'Scania', 'Tırkon', 'Volvo', 'Diğer'
  ];

  const engineVolumeOptions = [
    '2000 - 2500', '2501 - 3000', '3001 - 3500', '3501 - 4000',
    '4001 - 4500', '4501 - 5000', '5001 - 5500'
  ];

  const fuelTypeOptions = ['Benzinli', 'Benzin + LPG', 'Dizel', 'Dizel + LPG'];

  // Çekici Ekipmanı seçenekleri
  const towingEquipmentOptions = [
    'Kayar Platform', 'Makara', 'Çift Kat', 'Gözlük'
  ];

  // Güvenlik Özellikleri seçenekleri
  const safetyFeaturesOptions = ['Piston Ayak', 'Takoz', 'Sabitleme Halatı'];

  // Araç Donanımları seçenekleri
  const vehicleEquipmentOptions = [
    'Hidrolik Direksiyon', 'ABS', 'Hava Yastığı', 'Tepe Lambası',
    'Takograf', 'Havalı Fren', 'Motor Freni', 'Alarm', 'Merkezi Kilit', 'GPS'
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
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                İlan Detayları
              </Typography>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="İlan Başlığı"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  helperText="İlanınız için açıklayıcı bir başlık yazın"
                />
                
                <TextField
                  fullWidth
                  label="İlan Açıklaması"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  helperText="Aracınız hakkında detaylı bilgi verin"
                />

                <TextField
                  fullWidth
                  select
                  label="Model Yılı"
                  value={formData.modelYear}
                  onChange={(e) => handleInputChange('modelYear', e.target.value)}
                  required
                >
                  {generateYearOptions().map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                Araç Bilgileri
              </Typography>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  select
                  label="Araç Markası"
                  value={formData.vehicleBrand}
                  onChange={(e) => handleInputChange('vehicleBrand', e.target.value)}
                  required
                >
                  {vehicleBrands.map((brand) => (
                    <MenuItem key={brand} value={brand}>
                      {brand}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  label="Kilometre"
                  value={formData.km}
                  onChange={(e) => handleInputChange('km', e.target.value)}
                  required
                  InputProps={{
                    endAdornment: <InputAdornment position="end">km</InputAdornment>,
                  }}
                />

                <TextField
                  fullWidth
                  select
                  label="Motor Hacmi"
                  value={formData.engineVolume}
                  onChange={(e) => handleInputChange('engineVolume', e.target.value)}
                  required
                >
                  {engineVolumeOptions.map((volume) => (
                    <MenuItem key={volume} value={volume}>
                      {volume} cc
                    </MenuItem>
                  ))}
                </TextField>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Maksimum Güç"
                    value={formData.maxPowerHP}
                    onChange={(e) => handleInputChange('maxPowerHP', e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">HP</InputAdornment>,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Maksimum Tork"
                    value={formData.maxTorqueNm}
                    onChange={(e) => handleInputChange('maxTorqueNm', e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">Nm</InputAdornment>,
                    }}
                  />
                </Stack>

                <TextField
                  fullWidth
                  select
                  label="Yakıt Türü"
                  value={formData.fuelType}
                  onChange={(e) => handleInputChange('fuelType', e.target.value)}
                  required
                >
                  {fuelTypeOptions.map((fuel) => (
                    <MenuItem key={fuel} value={fuel}>
                      {fuel}
                    </MenuItem>
                  ))}
                </TextField>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Platform Uzunluğu"
                    value={formData.platformLength}
                    onChange={(e) => handleInputChange('platformLength', e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">m</InputAdornment>,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Platform Genişliği"
                    value={formData.platformWidth}
                    onChange={(e) => handleInputChange('platformWidth', e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">m</InputAdornment>,
                    }}
                  />
                </Stack>

                <TextField
                  fullWidth
                  label="Maksimum Araç Kapasitesi"
                  value={formData.maxVehicleCapacity}
                  onChange={(e) => handleInputChange('maxVehicleCapacity', e.target.value)}
                  required
                  helperText="Aynı anda taşınabilecek maksimum araç sayısı"
                />

                <TextField
                  fullWidth
                  label="Yük Kapasitesi"
                  value={formData.loadCapacity}
                  onChange={(e) => handleInputChange('loadCapacity', e.target.value)}
                  required
                  InputProps={{
                    endAdornment: <InputAdornment position="end">ton</InputAdornment>,
                  }}
                />

                <TextField
                  fullWidth
                  label="Plaka"
                  value={formData.licensePlate}
                  onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                  placeholder="34 ABC 123"
                />

                <FormControl>
                  <FormLabel component="legend">Takasa Uygun mu?</FormLabel>
                  <RadioGroup
                    value={formData.isExchangeable}
                    onChange={(e) => handleInputChange('isExchangeable', e.target.value)}
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="Evet" />
                    <FormControlLabel value="no" control={<Radio />} label="Hayır" />
                  </RadioGroup>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                Detaylı Bilgi
              </Typography>
              <Stack spacing={4}>
                {/* Çekici Ekipmanı */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Build /> Çekici Ekipmanı
                  </Typography>
                  <FormGroup>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
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
                        />
                      ))}
                    </Stack>
                  </FormGroup>
                </Box>

                {/* Güvenlik Özellikleri */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security /> Güvenlik Özellikleri
                  </Typography>
                  <FormGroup>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
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
                        />
                      ))}
                    </Stack>
                  </FormGroup>
                </Box>

                {/* Araç Donanımları */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsCar /> Araç Donanımları
                  </Typography>
                  <FormGroup>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
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
                        />
                      ))}
                    </Stack>
                  </FormGroup>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Stack spacing={3}>
                    
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
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold', textAlign: 'center' }}>
        Oto Kurtarıcı & Taşıyıcı - Çoklu Araç İlanı
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent(activeStep)}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
        <Button
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
          variant="outlined"
        >
          Geri
        </Button>
        
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'İlan Yayınlanıyor...' : 'İlanı Yayınla'}
          </Button>
        ) : (
          <Button 
            variant="contained" 
            onClick={handleNext}
            disabled={loading}
          >
            İleri
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default CokluAracForm;
