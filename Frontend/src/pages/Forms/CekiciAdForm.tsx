import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { createStandardPayload, validateListingPayload } from '../../services/apiNormalizer';
import { listingService } from '../../services/listingService';
import {
  Box,
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
  FormGroup,
  Stack,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  ArrowForward,
  ArrowBack,
  Upload,
  LocationOn,
  LocalShipping,
  Build,
  AttachMoney,
  Person,
  Phone,
  Email,
  DateRange,
  Speed,
  Palette,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { locationService, City, District } from '../../services/locationService';

// Renk seçenekleri
const colorOptions = [
  'Beyaz', 'Siyah', 'Gri', 'Gümüş', 'Mavi', 'Kırmızı',
  'Yeşil', 'Sarı', 'Turuncu', 'Mor', 'Kahverengi', 'Altın',
  'Bronz', 'Pembe', 'Turkuaz', 'Bordo', 'Lacivert', 'Bej'
];

// Motor gücü seçenekleri (çekiciler için)
const enginePowerOptions = [
  '100 hp ye kadar',
  '101 - 125 hp',
  '126 - 150 hp',
  '151 - 175 hp',
  '176 - 200 hp',
  '201 - 225 hp',
  '226 - 250 hp',
  '251 - 275 hp',
  '276 - 300 hp',
  '301 - 325 hp',
  '326 - 350 hp',
  '351 - 375 hp',
  '376 - 400 hp',
  '401 - 425 hp',
  '426 - 450 hp',
  '451 - 475 hp',
  '476 - 500 hp',
  '501 hp ve üzeri'
];

// Motor hacmi seçenekleri (çekiciler için)
const engineCapacityOptions = [
  "1300 cm3' e kadar",
  '1301 - 1600 cm3',
  '1601 - 1800 cm3',
  '1801 - 2000 cm3',
  '2001 - 2500 cm3',
  '2501 - 3000 cm3',
  '3001 - 3500 cm3',
  '3501 - 4000 cm3',
  '4001 - 4500 cm3',
  '4501 - 5000 cm3',
  '5001 cm3 ve üzeri'
];

// Kabin tipi seçenekleri
const cabinTypeOptions = [
  'Çift Kabin',
  'Yüksek',
  'Normal'
];

const steps = [
  'Araç Bilgileri',
  'Teknik Özellikler',
  'Özellikler',
  'Fotoğraflar',
  'İletişim & Fiyat'
];

const CekiciAdForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { confirm } = useConfirmDialog();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Şehir ve ilçe state'leri
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Fotoğraf yükleme
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    // Temel araç bilgileri
    title: '',
    description: '',
    brand: '',
    model: '',
    variant: '',
    year: new Date().getFullYear(),
    km: '',
    vehicleCondition: 'İkinci El',
    color: '',
    fuelType: 'Dizel',
    transmission: 'Manuel',

    // Çekici spesifik alanlar
    enginePower: '',
    engineCapacity: '',
    cabinType: '',
    bedCount: 'Yok',
    dorseAvailable: 'Yok',
    plateType: 'Türk Plakası',
    plateNumber: '',
    tireCondition: '',
    damageRecord: 'Hayır',
    paintChange: 'Hayır',
    exchange: 'Olabilir',

    // Konum
    city: '',
    district: '',

    // Özellikler (listeye göre defaultlar)
    features: {
      // Güvenlik
      abs: true,
      esp: true,
      asr: false,                 // ASR (çekiş kontrol)
      ebv: false,                 // EBV (fren gücü dağıtımı)
      airBag: true,               // Hava Yastığı (sürücü)
      sideAirbag: false,          // Hava Yastığı (Yan)
      passengerAirbag: false,     // Hava Yastığı (Yolcu)
      centralLock: true,
      alarm: true,
      immobilizer: true,
      laneKeepAssist: false,      // Şerit Koruma Desteği
      cruiseControl: false,       // Hız Sabitleyici
      hillStartAssist: false,     // Yokuş Kalkış Desteği
      adr: true,
      retarder: true,
      pto: true,

      // Sensör & Aydınlatma
      headlightSensor: false,     // Far Sensörü
      headlightWasher: false,     // Far Yıkama Sistemi
      rainSensor: false,          // Yağmur Sensörü
      xenonHeadlight: true,
      fogLight: true,

      // Konfor & İç Mekân
      airCondition: true,         // Klima
      electricWindow: true,
      electricMirror: true,       // Elektrikli Ayna
      powerSteering: true,        // Hidrolik Direksiyon
      leatherSeat: false,         // Deri Döşeme
      heatedSeats: false,         // Isıtmalı Koltuklar
      memorySeats: false,         // Hafızalı Koltuklar
      sunroof: true,
      alloyWheel: true,
      towHook: false,             // Çeki Demiri
      spoiler: false,             // Spoyler
      windDeflector: false,       // Cam rüzgarlığı
      table: false,               // Masa
      flexibleReadingLight: false,// Esnek Okuma Lambası

      // Multimedya & Sürüş Bilgi
      radio: true,                // Radio - Teyp
      cd: true,                   // CD Çalar
      bluetooth: false,
      gps: false,                 // TV / Navigasyon
      tripComputer: false,        // Yol Bilgisayarı

      // Park & Görüntüleme
      camera: false,
      parkingSensor: false,
    },

    warranty: false,

    // İletişim ve fiyat
    price: '',
    sellerName: '',
    sellerPhone: '',
    sellerEmail: '',

    // Görseller
    images: [] as string[]
  });

  // Şehirleri yükle
  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoadingCities(true);
        const citiesData = await locationService.getCities();
        setCities(citiesData);
      } catch (error) {
        console.error('Şehirler yüklenemedi:', error);
        setError('Şehirler yüklenirken bir hata oluştu');
      } finally {
        setLoadingCities(false);
      }
    };

    loadCities();
  }, []);

  // URL'den gelen araç seçim bilgilerini yükle
  useEffect(() => {
    if (location.state) {
      const { selection, brand, model, variant } = location.state as any;

      // Her iki yapıyı da destekle (selection object veya direkt brand/model/variant)
      const brandName = selection?.brand?.name || brand?.name;
      const modelName = selection?.model?.name || model?.name;
      const variantName = selection?.variant?.name || variant?.name;

      if (brandName && modelName && variantName) {
        setFormData(prev => ({
          ...prev,
          brand: brandName,
          model: modelName,
          variant: variantName,
        }));
      }
    }
  }, [location.state]);

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        sellerName: `${user.first_name} ${user.last_name}`,
        sellerPhone: (user as any).phone || '',
        sellerEmail: (user as any).email || '',
        city: (user as any).city || '',
        district: (user as any).district || '',
      }));
    }
  }, [user]);

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
      if (numericValue.length <= 3) {
        formattedValue = `(${numericValue}`;
      } else if (numericValue.length <= 6) {
        formattedValue = `(${numericValue.slice(0, 3)}) ${numericValue.slice(3)}`;
      } else if (numericValue.length <= 8) {
        formattedValue = `(${numericValue.slice(0, 3)}) ${numericValue.slice(3, 6)} ${numericValue.slice(6)}`;
      } else if (numericValue.length <= 10) {
        formattedValue = `(${numericValue.slice(0, 3)}) ${numericValue.slice(3, 6)} ${numericValue.slice(6, 8)} ${numericValue.slice(8)}`;
      } else {
        formattedValue = `(${numericValue.slice(0, 3)}) ${numericValue.slice(3, 6)} ${numericValue.slice(6, 8)} ${numericValue.slice(8, 10)}`;
      }

      setFormData(prev => ({ ...prev, [field]: formattedValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCityChange = async (city: City | null) => {
    if (!city) {
      setFormData(prev => ({ ...prev, city: '', district: '' }));
      setDistricts([]);
      return;
    }

    setFormData(prev => ({ ...prev, city: city.name, district: '' }));

    try {
      setLoadingDistricts(true);
      const districtsData = await locationService.getDistrictsByCity(city.id);
      setDistricts(districtsData);
    } catch (error) {
      console.error('İlçeler yüklenemedi:', error);
      setError('İlçeler yüklenirken bir hata oluştu');
    } finally {
      setLoadingDistricts(false);
    }
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

  const validateStep = (step: number): boolean => {
    let message = '';

    switch (step) {
      case 0: // Araç Bilgileri
        if (!formData.brand || !formData.model || !formData.variant || !formData.year) {
          message = 'Lütfen marka, model, varyant ve yıl bilgilerini doldurun.';
        }
        break;
      case 3: // Fotoğraflar
        if (uploadedImages.length === 0) {
          message = 'En az 1 fotoğraf yüklemelisiniz.';
        }
        break;
      case 4: // İletişim & Fiyat
        if (
          !formData.price.trim() ||
          !formData.city.trim() ||
          !formData.district.trim() ||
          !formData.sellerName.trim() ||
          !formData.sellerPhone.trim()
        ) {
          message = 'Fiyat, konum ve iletişim bilgileri zorunludur.';
        }
        break;
      default:
        return true;
    }

    if (message) {
      setError(message);
      return false;
    }

    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Convert uploaded images to base64 - MinibüsForm uyumlu
      const imageUrls = await Promise.all(
        uploadedImages.map(file => {
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
        year: formData.year,
        km: formData.km.replace(/\./g, ''), // Remove dots from km
        city: formData.city,
        category_id: 'vehicle-category-001', // Vasıta category
        vehicle_type_id: 'cme633w8v0001981ksnpl6dj4', // Çekici vehicle_type_id
        brand_id: null,
        model_id: null,
        variant_id: null,
        city_id: cities.find(city => city.name === formData.city)?.id,
        district_id: districts.find(district => district.name === formData.district)?.id,
        seller_name: formData.sellerName,
        seller_phone: formData.sellerPhone.replace(/[^\d]/g, ''),
        seller_email: formData.sellerEmail,
        images: imageUrls
      }, {
        // Çekici-specific properties
        color: formData.color || "Belirtilmemiş",
        fuel_type: formData.fuelType,
        transmission: formData.transmission,
        vehicle_condition: formData.vehicleCondition,
        is_exchangeable: formData.exchange === 'Evet',
        engine_volume: formData.engineCapacity,
        engine_power: formData.enginePower,
        motor_power: formData.enginePower,
        body_type: formData.cabinType,
        cabin_type: formData.cabinType,
        tire_condition: formData.tireCondition,
        plate_origin: formData.plateType,
        vehicle_plate: formData.plateNumber,
        features: formData.features,
        damage_record: formData.damageRecord,
        paint_change: formData.paintChange,
        warranty: formData.warranty
      });

      // Validate payload - MinibüsForm uyumlu
      const validation = validateListingPayload(standardPayload);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      console.log('Çekici ilanı oluşturuluyor:', standardPayload);

      // Use standardized listing service - MinibüsForm uyumlu
      const response = await listingService.createStandardListing(standardPayload);
      console.log('API Response:', response);
      
      if (response.success) {
        await confirm({
          title: 'Başarılı',
          description: 'Çekici ilanınız başarıyla oluşturuldu! Admin onayından sonra yayınlanacaktır.',
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
        setError('Zorunlu alanları doldurunuz');
      } else if (error.code === 'ECONNREFUSED') {
        setError('Sunucuya bağlanılamıyor. Lütfen backend\'in çalıştığından emin olun.');
      } else if (error.response?.status === 404) {
        setError('API endpoint bulunamadı. URL\'yi kontrol edin.');
      } else if (error.response?.status === 401) {
        setError('Yetkilendirme hatası. Lütfen giriş yapın.');
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'İlan oluşturulurken bir hata oluştu';
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
              <LocalShipping color="primary" />
              Çekici Bilgileri
            </Typography>

            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Örn: 2020 Model Mercedes Actros 1851 LS Çekici"
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Marka"
                value={formData.brand}
                disabled
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LocalShipping /></InputAdornment>,
                }}
              />

              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Model"
                value={formData.model}
                disabled
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LocalShipping /></InputAdornment>,
                }}
              />

              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Varyant"
                value={formData.variant}
                disabled
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LocalShipping /></InputAdornment>,
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                type="number"
                label="Model Yılı"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><DateRange /></InputAdornment>,
                }}
                required
              />

              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Araç Durumu</InputLabel>
                <Select
                  value={formData.vehicleCondition}
                  onChange={(e) => handleInputChange('vehicleCondition', e.target.value)}
                >
                  <MenuItem value="Sıfır">Sıfır</MenuItem>
                  <MenuItem value="İkinci El">İkinci El</MenuItem>
                  <MenuItem value="Hasarlı">Hasarlı</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Kilometre"
                value={formData.km}
                onChange={(e) => handleInputChange('km', e.target.value)}
                placeholder="Örn: 850.000"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Speed /></InputAdornment>,
                }}
              />

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
                  <MenuItem value="Elektrik">Elektrik</MenuItem>
                  <MenuItem value="Hibrit">Hibrit</MenuItem>
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

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Açıklama (Opsiyonel)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Çekicinizin detaylı açıklamasını yazın..."
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
                  value={formData.enginePower}
                  onChange={(e) => handleInputChange('enginePower', e.target.value)}
                >
                  {enginePowerOptions.map(power => (
                    <MenuItem key={power} value={power}>{power}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Motor Hacmi</InputLabel>
                <Select
                  value={formData.engineCapacity}
                  onChange={(e) => handleInputChange('engineCapacity', e.target.value)}
                >
                  {engineCapacityOptions.map(capacity => (
                    <MenuItem key={capacity} value={capacity}>{capacity}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Kabin Tipi</InputLabel>
                <Select
                  value={formData.cabinType}
                  onChange={(e) => handleInputChange('cabinType', e.target.value)}
                >
                  {cabinTypeOptions.map(cabin => (
                    <MenuItem key={cabin} value={cabin}>{cabin}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Yatak</InputLabel>
                <Select
                  value={formData.bedCount}
                  onChange={(e) => handleInputChange('bedCount', e.target.value)}
                >
                  <MenuItem value="Yok">Yok</MenuItem>
                  <MenuItem value="1 Yatak">1 Yatak</MenuItem>
                  <MenuItem value="2 Yatak">2 Yatak</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Dorse</InputLabel>
                <Select
                  value={formData.dorseAvailable}
                  onChange={(e) => handleInputChange('dorseAvailable', e.target.value)}
                >
                  <MenuItem value="Var">Var</MenuItem>
                  <MenuItem value="Yok">Yok</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Plaka/Uyruk</InputLabel>
                <Select
                  value={formData.plateType}
                  onChange={(e) => handleInputChange('plateType', e.target.value)}
                >
                  <MenuItem value="Türk Plakası">Türk Plakası</MenuItem>
                  <MenuItem value="Yabancı Plaka">Yabancı Plaka</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              label="Araç Plakası"
              value={formData.plateNumber}
              onChange={(e) => handleInputChange('plateNumber', e.target.value)}
              placeholder="Örn: 34 ABC 123"
            />

            <TextField
              fullWidth
              label="Lastik Durumu (%)"
              value={formData.tireCondition}
              onChange={(e) => handleInputChange('tireCondition', e.target.value)}
              placeholder="Örn: 85"
              type="number"
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Hasar Kaydı</InputLabel>
                <Select
                  value={formData.damageRecord}
                  onChange={(e) => handleInputChange('damageRecord', e.target.value)}
                >
                  <MenuItem value="Evet">Evet</MenuItem>
                  <MenuItem value="Hayır">Hayır</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Boya Değişimi</InputLabel>
                <Select
                  value={formData.paintChange}
                  onChange={(e) => handleInputChange('paintChange', e.target.value)}
                >
                  <MenuItem value="Evet">Evet</MenuItem>
                  <MenuItem value="Hayır">Hayır</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <FormControl fullWidth>
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
          </Stack>
        );

      case 2: {
        // Özellikler (Güvenlik & Konfor) — YENİLENEN BÖLÜM
        const countSelected = (keys: string[]) =>
          keys.reduce(
            (acc, k) => acc + (formData.features[k as keyof typeof formData.features] ? 1 : 0),
            0
          );

        const GROUPS: {
          title: string;
          color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
          keys: { key: keyof typeof formData.features; label: string }[];
        }[] = [
          {
            title: '🛡️ Güvenlik',
            color: 'error',
            keys: [
              { key: 'abs', label: 'ABS' },
              { key: 'esp', label: 'ESP' },
              { key: 'asr', label: 'ASR (Çekiş Kontrol)' },
              { key: 'ebv', label: 'EBV (Fren Gücü Dağıtımı)' },
              { key: 'airBag', label: 'Hava Yastığı (Sürücü)' },
              { key: 'sideAirbag', label: 'Hava Yastığı (Yan)' },
              { key: 'passengerAirbag', label: 'Hava Yastığı (Yolcu)' },
              { key: 'centralLock', label: 'Merkezi Kilit' },
              { key: 'alarm', label: 'Alarm' },
              { key: 'immobilizer', label: 'Immobilizer' },
              { key: 'laneKeepAssist', label: 'Şerit Koruma Desteği' },
              { key: 'cruiseControl', label: 'Hız Sabitleyici' },
              { key: 'hillStartAssist', label: 'Yokuş Kalkış Desteği' },
              { key: 'adr', label: 'ADR' },
              { key: 'retarder', label: 'Retarder' },
              { key: 'pto', label: 'PTO (Güç Aktarma)' },
            ],
          },
          {
            title: '💡 Sensör & Aydınlatma',
            color: 'warning',
            keys: [
              { key: 'headlightSensor', label: 'Far Sensörü' },
              { key: 'headlightWasher', label: 'Far Yıkama Sistemi' },
              { key: 'rainSensor', label: 'Yağmur Sensörü' },
              { key: 'xenonHeadlight', label: 'Xenon Far' },
              { key: 'fogLight', label: 'Sis Farı' },
            ],
          },
          {
            title: '🏠 Konfor',
            color: 'success',
            keys: [
              { key: 'airCondition', label: 'Klima' },
              { key: 'electricWindow', label: 'Elektrikli Cam' },
              { key: 'electricMirror', label: 'Elektrikli Ayna' },
              { key: 'powerSteering', label: 'Hidrolik Direksiyon' },
              { key: 'leatherSeat', label: 'Deri Döşeme' },
              { key: 'heatedSeats', label: 'Isıtmalı Koltuklar' },
              { key: 'memorySeats', label: 'Hafızalı Koltuklar' },
              { key: 'sunroof', label: 'Sunroof' },
              { key: 'alloyWheel', label: 'Alaşım Jant' },
              { key: 'towHook', label: 'Çeki Demiri' },
              { key: 'spoiler', label: 'Spoyler' },
              { key: 'windDeflector', label: 'Cam Rüzgarlığı' },
              { key: 'table', label: 'Masa' },
              { key: 'flexibleReadingLight', label: 'Esnek Okuma Lambası' },
            ],
          },
          {
            title: '📱 Multimedya & Bilgi',
            color: 'info',
            keys: [
              { key: 'radio', label: 'Radyo / Teyp' },
              { key: 'cd', label: 'CD Çalar' },
              { key: 'bluetooth', label: 'Bluetooth' },
              { key: 'gps', label: 'TV / Navigasyon' },
              { key: 'tripComputer', label: 'Yol Bilgisayarı' },
            ],
          },
          {
            title: '🅿️ Park & Görüntüleme',
            color: 'secondary',
            keys: [
              { key: 'camera', label: 'Geri Görüş Kamerası' },
              { key: 'parkingSensor', label: 'Park Sensörü' },
            ],
          },
        ];

        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Build color="primary" />
              Güvenlik & Konfor Özellikleri
            </Typography>

            {/* Kart Grid: 1 / 2 / 3 sütun */}
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              }}
            >
              {GROUPS.map((group) => (
                <Card key={group.title} elevation={1}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}
                        color={group.color}
                      >
                        {group.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={`${countSelected(group.keys.map(k => k.key as string))}/${group.keys.length}`}
                        color={group.color}
                        variant="outlined"
                      />
                    </Box>

                    <FormGroup
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        columnGap: 1,
                      }}
                    >
                      {group.keys.map(({ key, label }) => (
                        <FormControlLabel
                          key={String(key)}
                          control={
                            <Checkbox
                              size="small"
                              checked={Boolean(formData.features[key])}
                              onChange={(e) => handleFeatureChange(String(key), e.target.checked)}
                            />
                          }
                          label={label}
                          sx={{ m: 0, py: 0.5 }}
                        />
                      ))}
                    </FormGroup>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.warranty}
                  onChange={(e) => handleInputChange('warranty', e.target.checked)}
                />
              }
              label="Garanti var"
            />
          </Stack>
        );
      }

      case 3: // Fotoğraflar
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Upload color="primary" />
              Fotoğraf Yükleme
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Çekicinizin fotoğraflarını yükleyin (Maksimum 15 adet)
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
                onChange={(_, value) => handleCityChange(value)}
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
              onChange={(_, value) => handleInputChange('district', value?.name || '')}
              disabled={!formData.city || loadingDistricts}
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
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email /></InputAdornment>,
              }}
              type="email"
              disabled
              helperText="Kullanıcı profilinden otomatik dolduruldu"
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
    <Box maxWidth="lg" sx={{ py: 4 , ml: 16 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🚛 Çekici İlanı Oluştur
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Chip label="Çekici" color="primary" variant="outlined" />
            {formData.brand && <Chip label={formData.brand} variant="outlined" />}
            {formData.model && <Chip label={formData.model} variant="outlined" />}
            {formData.variant && <Chip label={formData.variant} variant="outlined" />}
          </Box>
        </Box>

        {/* Stepper */}
        <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Form Content */}
        <Paper elevation={2} sx={{ p: { xs: 2, md: 3 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading && <LinearProgress sx={{ mb: 3 }} />}

          {renderStepContent(activeStep)}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              startIcon={<ArrowBack />}
            >
              Geri
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                size="large"
              >
                {loading ? 'Yayınlanıyor...' : 'İlanı Yayınla'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                endIcon={<ArrowForward />}
              >
                İleri
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
  );
};

export default CekiciAdForm;
