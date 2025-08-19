import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
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
  LinearProgress,
  Autocomplete,
  Stack,
  Chip,
} from '@mui/material';
import {
  ArrowForward,
  Upload,
  LocationOn,
  DirectionsBus,
  Speed,
  DateRange,
  Build,
  Palette,
  AttachMoney,
  Person,
  Phone,
  Email,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import UserHeader from '../../components/layout/UserHeader';
import { locationService, City, District } from '../../services/locationService';

// Renk seçenekleri
const colorOptions = [
  'Bej', 'Beyaz', 'Bordo', 'Gri', 'Gümüş Gri', 'Kahverengi', 'Kırmızı',
  'Lacivert', 'Mavi', 'Mor', 'Pembe', 'Sarı', 'Siyah', 'Turkuaz', 'Turuncu', 'Yeşil'
];

// Motor gücü seçenekleri (HP)
const enginePowerOptions = [
  '100 hp\'ye kadar', '101 - 125 hp', '126 - 150 hp', '151 - 175 hp',
  '176 - 200 hp', '201 - 225 hp', '226 - 250 hp', '251 - 275 hp',
  '276 - 300 hp', '301 - 325 hp', '326 - 350 hp', '351 - 375 hp',
  '376 - 400 hp', '401 - 425 hp', '426 - 450 hp', '451 - 475 hp',
  '476 - 500 hp', '501 hp ve üzeri'
];

// Motor hacmi seçenekleri (cm³)
const engineCapacityOptions = [
  '1300 cm³\'e kadar', '1301 - 1600 cm³', '1601 - 1800 cm³', '1801 - 2000 cm³',
  '2001 - 2500 cm³', '2501 - 3000 cm³', '3001 - 3500 cm³', '3501 - 4000 cm³',
  '4001 - 4500 cm³', '4501 - 5000 cm³', '5001 cm³ ve üzeri'
];

const steps = [
  'Araç Bilgileri',
  'Teknik Özellikler', 
  'Konfor & Güvenlik',
  'Fotoğraflar',
  'İletişim & Fiyat'
];

const MinibusAdForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [error, setError] = useState('');
  
  // Brand/Model/Variant states - location.state'den gelecek
  const selectedVariant = location.state?.variant;
  const selectedModel = location.state?.model;
  const selectedBrand = location.state?.brand;
  
  // Ana form verisi
  const [formData, setFormData] = useState({
    // Temel Bilgiler
    title: '',
    description: '',
    price: '',
    city: '',
    district: '',
    
    // Araç Bilgileri  
    brand: selectedBrand?.name || '',
    model: selectedModel?.name || '',
    variant: selectedVariant?.name || '',
    year: new Date().getFullYear(),
    vehicleCondition: 'İkinci El',
    km: '',
    fuelType: 'Dizel',
    transmission: 'Manuel',
    enginePower: '',
    engineCapacity: '',
    color: '',
    
    // Minibüs Özel Alanları
    seatCount: '17+1', // Koltuk sayısı
    pullType: 'Arkadan', // Çekiş
    airConditioning: false, // Klima
    chassisType: 'Orta', // Şasi tipi
    roofType: 'Normal Tavan', // Tavan tipi
    
    // Konfor Özellikleri
    features: {
      abs: false,
      esp: false,
      airBag: false,
      centralLock: false,
      electricWindow: false,
      electricMirror: false,
      powerSteering: false,
      airCondition: false,
      heater: false,
      radio: false,
      cd: false,
      bluetooth: false,
      gps: false,
      camera: false,
      parkingSensor: false,
      xenonHeadlight: false,
      fogLight: false,
      sunroof: false,
      alloyWheel: false,
      leatherSeat: false,
      alarm: false,
      headlightJant: false,
      asr: false,
      cdPlayer: false,
      chainIron: false,
      leatherUpholstery: false,
      electricMirrors: false,
      headlight: false,
      farSensor: false,
      farWashingSystem: false,
      airBagDriver: false,
      airBagPassenger: false,
      speedControl: false,
      hydrolic: false,
      immobilizer: false,
      heatedSeats: false,
      climate: false,
      centralLock2: false,
      readingLamp: false,
      automaticGlass: false,
      automaticDoor: false,
      parkSensor: false,
      radioTape: false,
      spoiler: false,
      sunroof2: false,
      tourismPackage: false,
      tvNavigation: false,
      xenonHeadlight2: false,
      rainSensor: false,
      sideAirBag: false,
      hotColdSupport: false,
      fuelConsumptionComputer: false,
      refrigerator: false,
    },
    
    // Diğer
    damageRecord: 'Hayır',
    paintChange: 'Hayır',
    exchange: 'Olabilir',
    warranty: false,
    
    // Medya
    images: [] as string[],
    
    // İletişim
    sellerName: '',
    sellerPhone: '',
    sellerEmail: '',
  });

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
        console.log('🏙️ MinibusAdForm: Şehirler yüklendi:', citiesData.length);
      } catch (error) {
        console.error('❌ MinibusAdForm: Şehirler yüklenemedi:', error);
      } finally {
        setLoadingCities(false);
      }
    };
    
    loadCities();
  }, []);

  // Load districts when city changes
  const handleCityChange = async (cityId: string, cityName: string) => {
    try {
      setLoadingDistricts(true);
      setFormData(prev => ({ ...prev, city: cityName, district: '' }));
      
      const districtsData = await locationService.getDistrictsByCity(cityId);
      setDistricts(districtsData);
      console.log('🏘️ MinibusAdForm: İlçeler yüklendi:', districtsData.length);
    } catch (error) {
      console.error('❌ MinibusAdForm: İlçeler yüklenemedi:', error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  useEffect(() => {
    // Location state'den gelen varyant bilgilerini kontrol et
    if (selectedVariant && selectedModel && selectedBrand) {
      console.log('Variant bilgileri alındı:', {
        brand: selectedBrand,
        model: selectedModel,
        variant: selectedVariant
      });
      
      // Brand, model, variant bilgilerini form'a aktar
      setFormData(prev => ({
        ...prev,
        brand: selectedBrand.name,
        model: selectedModel.name,
        variant: selectedVariant.name
      }));
    }
  }, [selectedVariant, selectedModel, selectedBrand]);

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

  const handleInputChange = (field: string, value: string | number | boolean) => {
    // Kilometre formatını düzelt
    if (field === 'km' && typeof value === 'string') {
      const numericValue = value.replace(/[^\d]/g, '');
      
      if (numericValue === '') {
        setFormData(prev => ({
          ...prev,
          [field]: ''
        }));
        return;
      }
      
      const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue
      }));
      return;
    }

    // Fiyat formatını düzelt
    if (field === 'price' && typeof value === 'string') {
      const numericValue = value.replace(/[^\d]/g, '');
      
      if (numericValue === '') {
        setFormData(prev => ({
          ...prev,
          [field]: ''
        }));
        return;
      }
      
      const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue
      }));
      return;
    }

    // Telefon formatını düzelt
    if (field === 'sellerPhone' && typeof value === 'string') {
      const numericValue = value.replace(/[^\d]/g, '');
      
      if (numericValue === '') {
        setFormData(prev => ({
          ...prev,
          [field]: ''
        }));
        return;
      }
      
      let formattedValue = numericValue;
      if (numericValue.length >= 1) {
        if (numericValue.length <= 3) {
          formattedValue = `(${numericValue}`;
        } else if (numericValue.length <= 6) {
          formattedValue = `(${numericValue.slice(0, 3)}) ${numericValue.slice(3)}`;
        } else if (numericValue.length <= 8) {
          formattedValue = `(${numericValue.slice(0, 3)}) ${numericValue.slice(3, 6)} ${numericValue.slice(6)}`;
        } else if (numericValue.length <= 10) {
          formattedValue = `(${numericValue.slice(0, 3)}) ${numericValue.slice(3, 6)} ${numericValue.slice(6, 8)} ${numericValue.slice(8, 10)}`;
        } else {
          const truncated = numericValue.slice(0, 10);
          formattedValue = `(${truncated.slice(0, 3)}) ${truncated.slice(3, 6)} ${truncated.slice(6, 8)} ${truncated.slice(8, 10)}`;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue
      }));
      return;
    }
    
    // İl değiştiğinde ilçeleri yükle (mock data)
    if (field === 'city' && typeof value === 'string') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        district: ''
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: checked
      }
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setUploadedImages(prev => [...prev, ...files].slice(0, 10));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files.map(file => URL.createObjectURL(file))].slice(0, 10)
      }));
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Form adımı validation'u
  const validateStep = (step: number): { isValid: boolean; message?: string } => {
    switch (step) {
      case 0: // Araç Bilgileri
        if (!formData.title.trim()) {
          return { isValid: false, message: 'İlan başlığı gerekli' };
        }
        if (!formData.brand) {
          return { isValid: false, message: 'Marka seçimi gerekli' };
        }
        if (!formData.model) {
          return { isValid: false, message: 'Model seçimi gerekli' };
        }
        if (!formData.year) {
          return { isValid: false, message: 'Model yılı gerekli' };
        }
        if (!formData.vehicleCondition) {
          return { isValid: false, message: 'Araç durumu seçimi gerekli' };
        }
        return { isValid: true };
      
      case 1: // Teknik Özellikler
        if (!formData.fuelType) {
          return { isValid: false, message: 'Yakıt türü seçimi gerekli' };
        }
        if (!formData.transmission) {
          return { isValid: false, message: 'Vites türü seçimi gerekli' };
        }
        return { isValid: true };
      
      case 2: // Konfor & Güvenlik - Opsiyonel adım
        return { isValid: true };
      
      case 3: // Fotoğraflar
        if (uploadedImages.length === 0) {
          return { isValid: false, message: 'En az 1 fotoğraf yüklenmeli' };
        }
        return { isValid: true };
      
      case 4: // İletişim & Fiyat
        if (!formData.price.trim()) {
          return { isValid: false, message: 'Fiyat gerekli' };
        }
        if (!formData.city.trim()) {
          return { isValid: false, message: 'İl seçimi gerekli' };
        }
        if (!formData.district.trim()) {
          return { isValid: false, message: 'İlçe seçimi gerekli' };
        }
        if (!formData.sellerName.trim()) {
          return { isValid: false, message: 'Ad soyad gerekli' };
        }
        if (!formData.sellerPhone.trim()) {
          return { isValid: false, message: 'Telefon numarası gerekli' };
        }
        return { isValid: true };
      
      default:
        return { isValid: true };
    }
  };

  const handleNext = () => {
    const validation = validateStep(activeStep);
    if (!validation.isValid) {
      setError(validation.message || 'Lütfen tüm zorunlu alanları doldurun');
      return;
    }
    setError('');
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Form validasyonu
      if (!formData.title || !formData.price || !formData.city) {
        setError('Zorunlu alanları doldurunuz');
        return;
      }

      // Real API call to create listing using form data
      console.log('İlan oluşturuluyor:', formData);
      
      // Convert uploaded images to data URLs for backend
      const imageUrls = await Promise.all(
        uploadedImages.map(file => {
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
        year: Number(formData.year),
        km: Number(formData.km.replace(/\./g, '')) || 0, // Remove dots from km
        category_id: selectedBrand?.vehicle_types?.categories?.id || "vehicle-category-001", // Real category ID from selection chain
        vehicle_type_id: selectedBrand?.vehicle_type_id || selectedModel?.brands?.vehicle_type_id || "cme633w8v0001981ksnpl6dj8", // Real vehicle type ID from brand
        brand_id: selectedBrand?.id || "brand-minibus-fiat", // Real brand ID from selection
        model_id: selectedModel?.id || "fiat-ulysse-1755240605513", // Real model ID from selection
        variant_id: selectedVariant?.id || null, // Real variant ID from selection
        city_id: cities.find(city => city.name === formData.city)?.id || "city-01", // Real city ID from form
        district_id: districts.find(district => district.name === formData.district)?.id || "district-01-1219", // Real district ID from form
        seller_name: formData.sellerName,
        seller_phone: formData.sellerPhone.replace(/[^\d]/g, ''), // Remove formatting from phone
        seller_email: formData.sellerEmail,
        color: formData.color || "Belirtilmemiş",
        fuel_type: formData.fuelType,
        transmission: formData.transmission,
        vehicle_condition: formData.vehicleCondition,
        is_exchangeable: formData.exchange === 'Evet',
        images: imageUrls // Send actual image data URLs
      };

      console.log('Gönderilecek veri:', listingData);
      console.log('Selection context:', {
        selectedBrand,
        selectedModel, 
        selectedVariant
      });
      console.log('İstek URL:', `${api.defaults.baseURL}/listings`);
      console.log('İstek başlıyor...');

      const response = await api.post('/listings', listingData);
      console.log('API Response:', response.data);
      console.log('İstek başarılı!');
      
      if (response.data.success) {
        alert('İlanınız başarıyla oluşturuldu! Admin onayından sonra yayınlanacaktır.');
        navigate('/');
      }

    } catch (error: any) {
      console.error('İlan oluşturma hatası:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      console.error('Request config:', error.config);
      
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

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Araç Bilgileri
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsBus color="primary" />
              Araç Bilgileri
            </Typography>
            
            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Örn: Satılık Ford Transit 17+1 Koltuk Minibüs"
              required
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Marka"
                value={formData.brand}
                InputProps={{ readOnly: true }}
                disabled
              />

              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Model"
                value={formData.model}
                InputProps={{ readOnly: true }}
                disabled
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Varyant"
                value={formData.variant}
                InputProps={{ readOnly: true }}
                disabled
              />

              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                type="number"
                label="Model Yılı"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><DateRange /></InputAdornment>,
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Araç Durumu</InputLabel>
                <Select
                  value={formData.vehicleCondition}
                  onChange={(e) => handleInputChange('vehicleCondition', e.target.value)}
                >
                  <MenuItem value="Sıfır">Sıfır</MenuItem>
                  <MenuItem value="İkinci El">İkinci El</MenuItem>
                  <MenuItem value="Yurtdışından İthal Sıfır">Yurtdışından İthal Sıfır</MenuItem>
                </Select>
              </FormControl>

              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Kilometre"
                value={formData.km}
                onChange={(e) => handleInputChange('km', e.target.value)}
                placeholder="Örn: 150.000"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Speed /></InputAdornment>,
                }}
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Açıklama (Opsiyonel)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Aracınız hakkında detaylı bilgi verin..."
            />
          </Stack>
        );

      case 1: // Teknik Özellikler
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Build color="primary" />
              Teknik Özellikler
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Koltuk Sayısı</InputLabel>
                <Select
                  value={formData.seatCount}
                  onChange={(e) => handleInputChange('seatCount', e.target.value)}
                >
                  <MenuItem value="8+1">8+1</MenuItem>
                  <MenuItem value="9+1">9+1</MenuItem>
                  <MenuItem value="10+1">10+1</MenuItem>
                  <MenuItem value="11+1">11+1</MenuItem>
                  <MenuItem value="12+1">12+1</MenuItem>
                  <MenuItem value="13+1">13+1</MenuItem>
                  <MenuItem value="14+1">14+1</MenuItem>
                  <MenuItem value="15+1">15+1</MenuItem>
                  <MenuItem value="16+1">16+1</MenuItem>
                  <MenuItem value="17+1">17+1</MenuItem>
                  <MenuItem value="19+1">19+1</MenuItem>
                  <MenuItem value="20+1">20+1</MenuItem>
                  <MenuItem value="21+1">21+1</MenuItem>
                  <MenuItem value="23+1">23+1</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Çekiş</InputLabel>
                <Select
                  value={formData.pullType}
                  onChange={(e) => handleInputChange('pullType', e.target.value)}
                >
                  <MenuItem value="Önden">Önden</MenuItem>
                  <MenuItem value="Arkadan">Arkadan</MenuItem>
                  <MenuItem value="4x4">4x4</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Şasi Tipi</InputLabel>
                <Select
                  value={formData.chassisType}
                  onChange={(e) => handleInputChange('chassisType', e.target.value)}
                >
                  <MenuItem value="Kısa">Kısa</MenuItem>
                  <MenuItem value="Orta">Orta</MenuItem>
                  <MenuItem value="Uzun">Uzun</MenuItem>
                  <MenuItem value="Ekstra Uzun">Ekstra Uzun</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Tavan Tipi</InputLabel>
                <Select
                  value={formData.roofType}
                  onChange={(e) => handleInputChange('roofType', e.target.value)}
                >
                  <MenuItem value="Normal Tavan">Normal Tavan</MenuItem>
                  <MenuItem value="Yüksek Tavan">Yüksek Tavan</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Yakıt Tipi</InputLabel>
                <Select
                  value={formData.fuelType}
                  onChange={(e) => handleInputChange('fuelType', e.target.value)}
                >
                  <MenuItem value="Dizel">Dizel</MenuItem>
                  <MenuItem value="Benzin">Benzin</MenuItem>
                  <MenuItem value="LPG">LPG</MenuItem>
                  <MenuItem value="Benzin+LPG">Benzin+LPG</MenuItem>
                  <MenuItem value="Hybrid">Hybrid</MenuItem>
                  <MenuItem value="Elektrik">Elektrik</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Vites</InputLabel>
                <Select
                  value={formData.transmission}
                  onChange={(e) => handleInputChange('transmission', e.target.value)}
                >
                  <MenuItem value="Manuel">Manuel</MenuItem>
                  <MenuItem value="Otomatik">Otomatik</MenuItem>
                  <MenuItem value="Yarı Otomatik">Yarı Otomatik</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Motor Gücü</InputLabel>
                <Select
                  value={formData.enginePower}
                  onChange={(e) => handleInputChange('enginePower', e.target.value)}
                >
                  {enginePowerOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Motor Hacmi</InputLabel>
                <Select
                  value={formData.engineCapacity}
                  onChange={(e) => handleInputChange('engineCapacity', e.target.value)}
                >
                  {engineCapacityOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Renk</InputLabel>
              <Select
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                startAdornment={<InputAdornment position="start"><Palette /></InputAdornment>}
              >
                {colorOptions.map((color) => (
                  <MenuItem key={color} value={color}>{color}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.airConditioning}
                  onChange={(e) => handleInputChange('airConditioning', e.target.checked)}
                />
              }
              label="Klima Var"
            />
          </Stack>
        );

      case 2: // Konfor & Güvenlik
        return (
          <Stack spacing={3}>
            <Typography variant="h6">
              Konfor ve Güvenlik Özellikleri
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aracınızda bulunan özellikleri seçin
            </Typography>

            {/* Güvenlik Özellikleri */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                🛡️ Güvenlik
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  { key: 'abs', label: 'ABS' },
                  { key: 'esp', label: 'ESP' },
                  { key: 'airBag', label: 'Hava Yastığı (Sürücü)' },
                  { key: 'airBagPassenger', label: 'Hava Yastığı (Yolcu)' },
                  { key: 'sideAirBag', label: 'Yan Hava Yastığı' },
                  { key: 'centralLock', label: 'Merkezi Kilit' },
                  { key: 'alarm', label: 'Alarm' },
                  { key: 'asr', label: 'ASR' },
                  { key: 'immobilizer', label: 'İmmobilizer' },
                ].map((feature) => (
                  <FormControlLabel
                    key={feature.key}
                    control={
                      <Checkbox
                        checked={formData.features[feature.key as keyof typeof formData.features]}
                        onChange={(e) => handleFeatureChange(feature.key, e.target.checked)}
                      />
                    }
                    label={feature.label}
                  />
                ))}
              </Box>
            </Box>

            {/* Konfor Özellikleri */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                🏠 Konfor
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  { key: 'electricWindow', label: 'Elektrikli Cam' },
                  { key: 'electricMirrors', label: 'Elektrikli Aynalar' },
                  { key: 'powerSteering', label: 'Hidrolik Direksiyon' },
                  { key: 'airCondition', label: 'Klima' },
                  { key: 'heater', label: 'Kalorifer' },
                  { key: 'leatherSeat', label: 'Deri Koltuk' },
                  { key: 'leatherUpholstery', label: 'Deri Döşeme' },
                  { key: 'heatedSeats', label: 'Isıtmalı Koltuklar' },
                  { key: 'automaticGlass', label: 'Otomatik Cam' },
                  { key: 'automaticDoor', label: 'Otomatik Kapı' },
                  { key: 'speedControl', label: 'Hız Sabitleyici' },
                  { key: 'readingLamp', label: 'Okul Aracı' },
                ].map((feature) => (
                  <FormControlLabel
                    key={feature.key}
                    control={
                      <Checkbox
                        checked={formData.features[feature.key as keyof typeof formData.features]}
                        onChange={(e) => handleFeatureChange(feature.key, e.target.checked)}
                      />
                    }
                    label={feature.label}
                  />
                ))}
              </Box>
            </Box>

            {/* Multimedya */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                📻 Multimedya
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  { key: 'radio', label: 'Radyo' },
                  { key: 'cdPlayer', label: 'CD Çalar' },
                  { key: 'radioTape', label: 'Radio - Teyp' },
                  { key: 'bluetooth', label: 'Bluetooth' },
                  { key: 'gps', label: 'GPS Navigasyon' },
                  { key: 'tvNavigation', label: 'TV / Navigasyon' },
                ].map((feature) => (
                  <FormControlLabel
                    key={feature.key}
                    control={
                      <Checkbox
                        checked={formData.features[feature.key as keyof typeof formData.features]}
                        onChange={(e) => handleFeatureChange(feature.key, e.target.checked)}
                      />
                    }
                    label={feature.label}
                  />
                ))}
              </Box>
            </Box>

            {/* Dış Görünüm */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                🚗 Dış Görünüm
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  { key: 'headlightJant', label: 'Alaşım Jant' },
                  { key: 'farSensor', label: 'Far Sensörü' },
                  { key: 'headlight', label: 'Far (Sis)' },
                  { key: 'xenonHeadlight2', label: 'Xenon Far' },
                  { key: 'farWashingSystem', label: 'Far Yıkama Sistemi' },
                  { key: 'spoiler', label: 'Spoyler' },
                  { key: 'sunroof2', label: 'Sunroof' },
                  { key: 'tourismPackage', label: 'Turizm Paketli' },
                  { key: 'rainSensor', label: 'Yağmur Sensörü' },
                ].map((feature) => (
                  <FormControlLabel
                    key={feature.key}
                    control={
                      <Checkbox
                        checked={formData.features[feature.key as keyof typeof formData.features]}
                        onChange={(e) => handleFeatureChange(feature.key, e.target.checked)}
                      />
                    }
                    label={feature.label}
                  />
                ))}
              </Box>
            </Box>

            {/* Diğer */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                🔧 Diğer
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  { key: 'parkSensor', label: 'Park Sensörü' },
                  { key: 'camera', label: 'Yokış Kalkış Desteği' },
                  { key: 'fuelConsumptionComputer', label: 'Yol Bilgisayarı' },
                  { key: 'hotColdSupport', label: 'Soğutucu / Frigo' },
                  { key: 'chainIron', label: 'Çeki Demiri' },
                ].map((feature) => (
                  <FormControlLabel
                    key={feature.key}
                    control={
                      <Checkbox
                        checked={formData.features[feature.key as keyof typeof formData.features]}
                        onChange={(e) => handleFeatureChange(feature.key, e.target.checked)}
                      />
                    }
                    label={feature.label}
                  />
                ))}
              </Box>
            </Box>

            {/* Diğer Bilgiler */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                ℹ️ Diğer Bilgiler
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl sx={{ flex: 1, minWidth: 150 }}>
                  <InputLabel>Hasar Kaydı</InputLabel>
                  <Select
                    value={formData.damageRecord}
                    onChange={(e) => handleInputChange('damageRecord', e.target.value)}
                  >
                    <MenuItem value="Hayır">Hayır</MenuItem>
                    <MenuItem value="Evet">Evet</MenuItem>
                  </Select>
                </FormControl>

                <FormControl sx={{ flex: 1, minWidth: 150 }}>
                  <InputLabel>Boya Değişimi</InputLabel>
                  <Select
                    value={formData.paintChange}
                    onChange={(e) => handleInputChange('paintChange', e.target.value)}
                  >
                    <MenuItem value="Hayır">Hayır</MenuItem>
                    <MenuItem value="Evet">Evet</MenuItem>
                  </Select>
                </FormControl>

                <FormControl sx={{ flex: 1, minWidth: 150 }}>
                  <InputLabel>Takas</InputLabel>
                  <Select
                    value={formData.exchange}
                    onChange={(e) => handleInputChange('exchange', e.target.value)}
                  >
                    <MenuItem value="Evet">Evet</MenuItem>
                    <MenuItem value="Hayır">Hayır</MenuItem>
                    <MenuItem value="Olabilir">Olabilir</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <FormControlLabel
                sx={{ mt: 2 }}
                control={
                  <Checkbox
                    checked={formData.warranty}
                    onChange={(e) => handleInputChange('warranty', e.target.checked)}
                  />
                }
                label="Garanti Kapsamında"
              />
            </Box>
          </Stack>
        );

      case 3: // Fotoğraflar
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
            {uploadedImages.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Yüklenen Fotoğraflar ({uploadedImages.length}/10)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {uploadedImages.map((file, index) => (
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

      case 4: // İletişim & Fiyat
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <UserHeader />
      
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4, mt: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
             Minibüs & Midibüs İlanı Oluştur
          </Typography>
          {selectedVariant && (
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              {selectedBrand?.name} {selectedModel?.name} {selectedVariant?.name}
            </Typography>
          )}
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

export default MinibusAdForm;
