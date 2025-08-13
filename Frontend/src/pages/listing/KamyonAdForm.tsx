import React, { useState, useEffect } from 'react';
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
  Chip,
  InputAdornment,
  Card,
  CardContent,
  LinearProgress,
  Autocomplete,
  Stack,
} from '@mui/material';
import {
  ArrowForward,
  Upload,
  LocationOn,
  LocalShipping,
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
import { locationService, City, District } from '../../services/locationService';
import UserHeader from '../../components/layout/UserHeader';

// Renk seçenekleri
const colorOptions = [
  'Bej', 'Beyaz', 'Bordo', 'Gri', 'Gümüş Gri', 'Kahverengi', 'Kırmızı',
  'Lacivert', 'Mavi', 'Mor', 'Pembe', 'Sarı', 'Siyah', 'Turkuaz', 'Turuncu', 'Yeşil'
];

// Motor Gücü seçenekleri
const motorPowerOptions = [
  '100 hp\'ye kadar', '101 - 125 hp', '126 - 150 hp', '151 - 175 hp', 
  '176 - 200 hp', '201 - 225 hp', '226 - 250 hp', '251 - 275 hp',
  '276 - 300 hp', '301 - 325 hp', '326 - 350 hp', '351 - 375 hp',
  '376 - 400 hp', '401 - 425 hp', '426 - 450 hp', '451 - 475 hp',
  '476 - 500 hp'
];

// Üst Yapı seçenekleri
const bodyTypeOptions = [
  'Açık Kasa', 'Ahşap Damper', 'Ahşap Kasa', 'Ambulans', 'Cenaze Aracı',
  'Çöp Kamyonu', 'Fiber Kasa', 'Frigorifik', 'Hardox Damper', 'Havuz Damper',
  'Kapalı Kasa', 'Lowbed', 'Merdivenli İtfaiye Aracı', 'Meşrubat Kasası',
  'Saç Damper', 'Saç Kasa', 'Şasi', 'Tanker', 'Temizlik Kamyonu', 'Tenteli Kasa'
];

// Taşıma Kapasitesi seçenekleri
const carryingCapacityOptions = [
  '0 - 1.500', '1.501 - 3.000', '3.001 - 3.500', '3.501 - 5.000',
  '5.001 - 10.000', '10.001 - 20.000', '20.001 - 30.000', '30.001 - 40.000'
];

// Çekiş Türü seçenekleri
const driveTypeOptions = [
  '4x2', '4x4', '6x2', '6x4', '6x6', '8x2', '8x2x2', '8x2x4', '8x4x4', '8x8x4'
];

// Kabin Türü seçenekleri
const cabinTypeOptions = [
  'Tek Kabin', 'Çift Kabin', 'Yüksek Kabin', 'Normal Kabin'
];

const steps = [
  'Araç Bilgileri',
  'Teknik Özellikler', 
  'Konfor & Güvenlik',
  'Fotoğraflar',
  'İletişim & Fiyat'
];

const KamyonAdForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Location state'den gelen varyant bilgilerini al
  const selectedVariant = location.state?.selectedVariant;
  const selectedModel = location.state?.selectedModel;
  const selectedBrand = location.state?.selectedBrand;
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [error, setError] = useState('');
  
  // State for cities and districts from API
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  
  // Ana form verisi
  const [formData, setFormData] = useState({
    // Temel Bilgiler
    title: '',
    description: '',
    price: '',
    city: '',
    district: '',
    
    // Araç Bilgileri  
    brand: '',
    model: '',
    variant: '',
    year: new Date().getFullYear(),
    vehicleCondition: 'İkinci El',
    km: '',
    fuelType: 'Dizel',
    transmission: 'Manuel',
    color: '',
    
    // Kamyon Özel Alanları
    motorPower: '', // Motor Gücü
    bodyType: '', // Üst Yapı
    carryingCapacity: '', // Taşıma Kapasitesi (KG)
    cabinType: '', // Kabin Türü
    tireCondition: '', // Lastik Durumu (%)
    driveType: '', // Çekiş Türü
    plateOrigin: 'Türk Plakası', // Plaka/Uyruk
    vehiclePlate: '', // Araç Plakası
    
    // Konfor Özellikleri
    features: {
      // Güvenlik
      abs: false, // ABS
      adr: false, // ADR
      alarm: false, // Alarm
      asr: false, // ASR
      ebv: false, // EBV
      esp: false, // ESP
      havaPastigiSurucu: false, // Hava Yastığı (Sürücü)
      havaPastigiYolcu: false, // Hava Yastığı (Yolcu)
      immobilizer: false, // Immobilizer
      merkeziKilit: false, // Merkezi Kilit
      retarder: false, // Retarder
      yokusKalkisDestegi: false, // Yokuş Kalkış Desteği
      yanHavaYastigi: false, // Yan Hava Yastığı
      
      // İç Donanım
      cdCalar: false, // CD Çalar
      deriDoseme: false, // Deri Döşeme
      elektrikliAynalar: false, // Elektrikli Aynalar
      elektrikliCam: false, // Elektrikli Cam
      esnekOkumaLambasi: false, // Esnek Okuma Lambası
      havaliKoltuk: false, // Havalı Koltuk
      hizSabitleyici: false, // Hız Sabitleyici
      hidrotikDireksiyon: false, // Hidrotik Direksiyon
      isitmalıKoltuklar: false, // Isıtmalı Koltuklar
      klima: false, // Klima
      masa: false, // Masa
      radioTeyp: false, // Radio - Teyp
      startStop: false, // Start & Stop
      tvNavigasyon: false, // TV / Navigasyon
      yolBilgisayari: false, // Yol Bilgisayarı
      
      // Dış Donanım
      alasimJant: false, // Alaşım Jant
      camRuzgarligi: false, // Cam Rüzgarlığı
      cekiDemiri: false, // Çeki Demiri
      far: false, // Far (Sis)
      farSensoru: false, // Far Sensörü
      farYikamaSistemi: false, // Far Yıkama Sistemi
      aynalarElektrikli: false, // Aynalar (Elektrikli)
      aynalarKatlanir: false, // Aynalar (Katlanır)
      spoyler: false, // Spoyler
      sunroof: false, // Sunroof
      xenonFar: false, // Xenon Far
      yagmurSensoru: false, // Yağmur Sensörü
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

  // Cities'i yükle
  useEffect(() => {
    const loadCities = async () => {
      try {
        console.log('🏙️ KamyonAdForm: Şehirler yükleniyor...');
        setLoadingCities(true);
        const citiesData = await locationService.getCities();
        console.log('🏙️ KamyonAdForm: Şehirler yüklendi:', citiesData);
        setCities(citiesData);
      } catch (error) {
        console.error('❌ KamyonAdForm: Şehirler yüklenemedi:', error);
        setError('Şehirler yüklenirken bir hata oluştu');
      } finally {
        setLoadingCities(false);
      }
    };

    loadCities();
  }, []);

  // Location state'den gelen varyant bilgilerini kontrol et
  useEffect(() => {
    // Location state'den gelen seçim bilgilerini kontrol et
    const selection = location.state?.selection;
    const directVariant = location.state?.variant;
    const directModel = location.state?.model;
    const directBrand = location.state?.brand;
    
    console.log('🚛 KamyonAdForm: Location state:', location.state);
    console.log('🚛 KamyonAdForm: Selection:', selection);
    
    if (selection) {
      // Selection object'den bilgileri al
      if (selection.brand && selection.model && selection.variant) {
        console.log('✅ Selection bilgileri alındı:', {
          brand: selection.brand.name,
          model: selection.model.name,
          variant: selection.variant.name
        });
        
        setFormData(prev => ({
          ...prev,
          brand: selection.brand.name,
          model: selection.model.name,
          variant: selection.variant.name
        }));
      }
    } else if (directBrand && directModel && directVariant) {
      // Direct props'dan bilgileri al
      console.log('✅ Direct props bilgileri alındı:', {
        brand: directBrand.name,
        model: directModel.name,
        variant: directVariant.name
      });
      
      setFormData(prev => ({
        ...prev,
        brand: directBrand.name,
        model: directModel.name,
        variant: directVariant.name
      }));
    } else if (selectedVariant && selectedModel && selectedBrand) {
      // Fallback: selectedVariant state'den al
      console.log('✅ State bilgileri alındı:', {
        brand: selectedBrand.name,
        model: selectedModel.name,
        variant: selectedVariant.name
      });
      
      setFormData(prev => ({
        ...prev,
        brand: selectedBrand.name,
        model: selectedModel.name,
        variant: selectedVariant.name
      }));
    } else {
      console.log('⚠️ Araç bilgileri bulunamadı');
    }
  }, [location.state, selectedVariant, selectedModel, selectedBrand]);

  // City değişikliğinde districts yükle
  const handleCityChange = async (cityId: string, cityName: string) => {
    console.log('🏙️ KamyonAdForm: Şehir değişti:', cityName);
    setFormData(prev => ({
      ...prev,
      city: cityName,
      district: ''
    }));
    
    if (cityId) {
      try {
        console.log('🏘️ KamyonAdForm: İlçeler yükleniyor...');
        setLoadingDistricts(true);
        const districtsData = await locationService.getDistrictsByCity(cityId);
        console.log('🏘️ KamyonAdForm: İlçeler yüklendi:', districtsData);
        setDistricts(districtsData);
      } catch (error) {
        console.error('❌ KamyonAdForm: İlçeler yüklenemedi:', error);
        setError('İlçeler yüklenirken bir hata oluştu');
      } finally {
        setLoadingDistricts(false);
      }
    } else {
      setDistricts([]);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    // Kilometre formatını düzelt
    if (field === 'km' && typeof value === 'string') {
      const numericValue = value.replace(/[^\d]/g, '');
      if (numericValue === '') {
        setFormData(prev => ({ ...prev, [field]: '' }));
        return;
      }
      const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      setFormData(prev => ({ ...prev, [field]: formattedValue }));
      return;
    }

    // Fiyat formatını düzelt
    if (field === 'price' && typeof value === 'string') {
      const numericValue = value.replace(/[^\d]/g, '');
      if (numericValue === '') {
        setFormData(prev => ({ ...prev, [field]: '' }));
        return;
      }
      const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      setFormData(prev => ({ ...prev, [field]: formattedValue }));
      return;
    }

    // Telefon formatını düzelt
    if (field === 'sellerPhone' && typeof value === 'string') {
      const numericValue = value.replace(/[^\d]/g, '');
      if (numericValue === '') {
        setFormData(prev => ({ ...prev, [field]: '' }));
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
      setFormData(prev => ({ ...prev, [field]: formattedValue }));
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
      features: { ...prev.features, [feature]: checked }
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setUploadedImages(prev => [...prev, ...files].slice(0, 15)); // Max 15 foto
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files.map(file => URL.createObjectURL(file))].slice(0, 15)
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
    setError(''); // Önceki hataları temizle
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

      console.log('KamyonAdForm: İlan gönderiliyor...', formData);
      
      // Burada API çağrısı yapılacak
      // const response = await adAPI.createListing(listingData);
      
      // Geçici olarak başarılı mesaj göster
      alert('Kamyon ilanı başarıyla oluşturuldu!');
      navigate('/dashboard');

    } catch (error) {
      console.error('İlan oluşturma hatası:', error);
      setError('İlan oluşturulurken bir hata oluştu');
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
              <LocalShipping color="primary" />
              Araç Bilgileri
            </Typography>
            
            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Örn: Satılık Ford Cargo Kamyon"
              required
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Marka"
                value={formData.brand}
                disabled
                placeholder="Ford, Mercedes, vb."
              />

              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Model"
                value={formData.model}
                disabled
                placeholder="Cargo, Atego, vb."
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Varyant"
                value={formData.variant}
                disabled
                placeholder="2530 D, 1833, vb."
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
              placeholder="Kamyonunuz hakkında detaylı bilgi verin..."
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
                <InputLabel>Motor Gücü</InputLabel>
                <Select
                  value={formData.motorPower}
                  onChange={(e) => handleInputChange('motorPower', e.target.value)}
                >
                  {motorPowerOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Üst Yapı</InputLabel>
                <Select
                  value={formData.bodyType}
                  onChange={(e) => handleInputChange('bodyType', e.target.value)}
                >
                  {bodyTypeOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Taşıma Kapasitesi (KG)</InputLabel>
                <Select
                  value={formData.carryingCapacity}
                  onChange={(e) => handleInputChange('carryingCapacity', e.target.value)}
                >
                  {carryingCapacityOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Kabin</InputLabel>
                <Select
                  value={formData.cabinType}
                  onChange={(e) => handleInputChange('cabinType', e.target.value)}
                >
                  {cabinTypeOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Lastik Durumu (%)"
                value={formData.tireCondition}
                onChange={(e) => handleInputChange('tireCondition', e.target.value)}
                placeholder="Örn: 85"
                type="number"
              />

              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Çekiş Türü</InputLabel>
                <Select
                  value={formData.driveType}
                  onChange={(e) => handleInputChange('driveType', e.target.value)}
                >
                  {driveTypeOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ flex: 1, minWidth: 200 }}>
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

              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Plaka/Uyruk</InputLabel>
                <Select
                  value={formData.plateOrigin}
                  onChange={(e) => handleInputChange('plateOrigin', e.target.value)}
                >
                  <MenuItem value="Türk Plakası">Türk Plakası</MenuItem>
                  <MenuItem value="Yabancı Plaka">Yabancı Plaka</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              label="Araç Plakası"
              value={formData.vehiclePlate}
              onChange={(e) => handleInputChange('vehiclePlate', e.target.value)}
              placeholder="Örn: 34 ABC 123"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.exchange === 'Evet'}
                  onChange={(e) => handleInputChange('exchange', e.target.checked ? 'Evet' : 'Hayır')}
                />
              }
              label="Takaslı"
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
              Kamyonunuzda bulunan özellikleri seçin
            </Typography>

            {/* Güvenlik */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                🛡️ Güvenlik
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  { key: 'abs', label: 'ABS' },
                  { key: 'adr', label: 'ADR' },
                  { key: 'alarm', label: 'Alarm' },
                  { key: 'asr', label: 'ASR' },
                  { key: 'ebv', label: 'EBV' },
                  { key: 'esp', label: 'ESP' },
                  { key: 'havaPastigiSurucu', label: 'Hava Yastığı (Sürücü)' },
                  { key: 'havaPastigiYolcu', label: 'Hava Yastığı (Yolcu)' },
                  { key: 'immobilizer', label: 'Immobilizer' },
                  { key: 'merkeziKilit', label: 'Merkezi Kilit' },
                  { key: 'retarder', label: 'Retarder' },
                  { key: 'yokusKalkisDestegi', label: 'Yokuş Kalkış Desteği' },
                  { key: 'yanHavaYastigi', label: 'Yan Hava Yastığı' },
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

            {/* İç Donanım */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                🏠 İç Donanım
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  { key: 'cdCalar', label: 'CD Çalar' },
                  { key: 'deriDoseme', label: 'Deri Döşeme' },
                  { key: 'elektrikliAynalar', label: 'Elektrikli Aynalar' },
                  { key: 'elektrikliCam', label: 'Elektrikli Cam' },
                  { key: 'esnekOkumaLambasi', label: 'Esnek Okuma Lambası' },
                  { key: 'havaliKoltuk', label: 'Havalı Koltuk' },
                  { key: 'hizSabitleyici', label: 'Hız Sabitleyici' },
                  { key: 'hidrotikDireksiyon', label: 'Hidrotik Direksiyon' },
                  { key: 'isitmalıKoltuklar', label: 'Isıtmalı Koltuklar' },
                  { key: 'klima', label: 'Klima' },
                  { key: 'masa', label: 'Masa' },
                  { key: 'radioTeyp', label: 'Radio - Teyp' },
                  { key: 'startStop', label: 'Start & Stop' },
                  { key: 'tvNavigasyon', label: 'TV / Navigasyon' },
                  { key: 'yolBilgisayari', label: 'Yol Bilgisayarı' },
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

            {/* Dış Donanım */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                🌟 Dış Donanım
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  { key: 'alasimJant', label: 'Alaşım Jant' },
                  { key: 'camRuzgarligi', label: 'Cam Rüzgarlığı' },
                  { key: 'cekiDemiri', label: 'Çeki Demiri' },
                  { key: 'far', label: 'Far (Sis)' },
                  { key: 'farSensoru', label: 'Far Sensörü' },
                  { key: 'farYikamaSistemi', label: 'Far Yıkama Sistemi' },
                  { key: 'aynalarElektrikli', label: 'Aynalar (Elektrikli)' },
                  { key: 'aynalarKatlanir', label: 'Aynalar (Katlanır)' },
                  { key: 'spoyler', label: 'Spoyler' },
                  { key: 'sunroof', label: 'Sunroof' },
                  { key: 'xenonFar', label: 'Xenon Far' },
                  { key: 'yagmurSensoru', label: 'Yağmur Sensörü' },
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
              Kamyonunuzun fotoğraflarını yükleyin (Maksimum 15 adet)
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
                  Yüklenen Fotoğraflar ({uploadedImages.length}/15)
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
                placeholder="Örn: 850.000"
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
      <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            🚛 Kamyon & Kamyonet İlanı Oluştur
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Chip label="Kamyon & Kamyonet" color="primary" variant="outlined" />
            {formData.brand && <Chip label={formData.brand} variant="outlined" />}
            {formData.model && <Chip label={formData.model} variant="outlined" />}
            {formData.variant && <Chip label={formData.variant} variant="outlined" />}
          </Box>
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
                onClick={handleBack}
                disabled={loading}
              >
                Geri
              </Button>
            )}

            {activeStep === steps.length - 1 ? (
              <Button
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

export default KamyonAdForm;
