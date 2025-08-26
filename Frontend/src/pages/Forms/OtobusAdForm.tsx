import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useEditListing } from '../../hooks/useEditListing';
import { createStandardPayload, validateListingPayload } from '../../services/apiNormalizer';
import { listingService } from '../../services/listingService';
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
  ArrowBack,
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
import { locationService, City, District } from '../../services/locationService';

// Renk seçenekleri
const colorOptions = [
  'Bej', 'Beyaz', 'Bordo', 'Gri', 'Gümüş Gri', 'Kahverengi', 'Kırmızı',
  'Lacivert', 'Mavi', 'Mor', 'Pembe', 'Sarı', 'Siyah', 'Turkuaz', 'Turuncu', 'Yeşil'
];

// Koltuk düzeni seçenekleri
const seatLayoutOptions = ['2+1', '2+2'];

// Koltuk arkası ekran seçenekleri
const screenOptions = ['Yok', '7', '9', '10'];

// Vites sayısı seçenekleri
const gearCountOptions = ['6+1', '8+1', '12+1', 'Diğer'];

const steps = [
  'Araç Bilgileri',
  'Teknik Özellikler', 
  'Konfor & Güvenlik',
  'Fotoğraflar',
  'İletişim & Fiyat'
];

const OtobusAdForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedBrand = location.state?.brand;
  const selectedModel = location.state?.model;
  const selectedVariant = location.state?.variant;
  const { confirm } = useConfirmDialog();
  const { isEditMode, editData, editLoading, fillFormWithEditData } = useEditListing();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
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
    
    // Otobüs Özel Alanları
    passengerCapacity: '', // Yolcu Kapasitesi
    seatLayout: '2+1', // Koltuk Düzeni
    seatBackScreen: 'Yok', // Koltuk Arkası Ekran
    gearType: 'Manuel', // Vites
    gearCount: '6+1', // Vites Sayısı
    tireCondition: '', // Lastik Durumu (%)
    fuelCapacity: '', // Yakıt Hacmi (Litre)
    plateOrigin: 'Türk Plakası', // Plaka/Uyruk
    vehiclePlate: '', // Araç Plakası
    
    // Konfor Özellikleri
    features: {
      // Detaylı Bilgi
      threeG: false, // 3G
      abs: false, // ABS
      vehiclePhone: false, // Araç Telefonu
      asr: false, // ASR
      refrigerator: false, // Buzdolabı
      heatedDriverGlass: false, // Isıtmalı Sürücü Camı
      personalSoundSystem: false, // Kişisel Ses Sistemi
      airCondition: false, // Klima
      kitchen: false, // Mutfak
      retarder: false, // Retarder
      driverCabin: false, // Sürücü Kabini
      television: false, // Televizyon
      toilet: false, // Tuvalet
      satellite: false, // Uydu
      wifi: false, // Wi-fi
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

  // İlleri yükle
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
      const { selection, brand, model, variant } = location.state;
      
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
        sellerPhone: user.phone || '',
        sellerEmail: user.email,
        city: user.city || '',
        district: user.district || '',
      }));
    }
  }, [user]);

  // Edit modu için veri yükle
  useEffect(() => {
    if (isEditMode && editData && !editLoading) {
      fillFormWithEditData(setFormData);
    }
  }, [isEditMode, editData, editLoading]);

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
        if (!formData.price.trim() || !formData.city.trim() || !formData.district.trim() || 
            !formData.sellerName.trim() || !formData.sellerPhone.trim()) {
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
        vehicle_type_id: selectedBrand?.vehicle_type_id || 'cme633w8v0001981ksnpl6dj9', // Otobüs vehicle_type_id
        brand_id: selectedBrand?.id,
        model_id: selectedModel?.id,
        variant_id: selectedVariant?.id,
        city_id: cities.find(city => city.name === formData.city)?.id,
        district_id: districts.find(district => district.name === formData.district)?.id,
        seller_name: formData.sellerName,
        seller_phone: formData.sellerPhone.replace(/[^\d]/g, ''),
        seller_email: formData.sellerEmail,
        images: imageUrls,
        features: formData.features  // Features'ı ana objede gönder
      }, {
        // Otobüs-specific properties
        color: formData.color || "Belirtilmemiş",
        fuel_type: formData.fuelType,
        transmission: formData.transmission,
        vehicle_condition: formData.vehicleCondition,
        is_exchangeable: formData.exchange === 'Evet',
        passenger_capacity: formData.passengerCapacity,
        seat_layout: formData.seatLayout,
        seat_back_screen: formData.seatBackScreen,
        gear_type: formData.gearType,
        gear_count: formData.gearCount,
        fuel_capacity: formData.fuelCapacity,
        tire_condition: formData.tireCondition,
        plate_origin: formData.plateOrigin,
        vehicle_plate: formData.vehiclePlate,
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

      // Edit mode or create mode handling
      if (isEditMode && editData) {
        console.log('Otobüs ilanı güncelleniyor:', standardPayload);
        const response = await listingService.updateStandardListing(editData.id, standardPayload);
        
        if (response.success) {
          await confirm({
            title: 'Başarılı',
            description: 'Otobüs ilanınız başarıyla güncellendi! Admin onayından sonra yeniden yayınlanacaktır.',
            severity: 'success',
            confirmText: 'Tamam',
            cancelText: ''
          });
          navigate('/user/my-listings');
        } else {
          throw new Error(response.message || 'İlan güncellenemedi');
        }
      } else {
        console.log('Otobüs ilanı oluşturuluyor:', standardPayload);
        const response = await listingService.createStandardListing(standardPayload);
        
        if (response.success) {
          await confirm({
            title: 'Başarılı',
            description: 'Otobüs ilanınız başarıyla oluşturuldu! Admin onayından sonra yayınlanacaktır.',
            severity: 'success',
            confirmText: 'Tamam',
            cancelText: ''
          });
          navigate('/user/my-listings');
        } else {
          throw new Error(response.message || 'İlan oluşturulamadı');
        }
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
        const errorMessage = error.response?.data?.message || error.message || 
          `İlan ${isEditMode ? 'güncellenirken' : 'oluşturulurken'} bir hata oluştu`;
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
              placeholder="Örn: Satılık Mercedes Travego Otobüs"
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Marka"
                value={formData.brand}
                disabled
                InputProps={{
                  startAdornment: <InputAdornment position="start"><DirectionsBus /></InputAdornment>,
                }}
              />

              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Model"
                value={formData.model}
                disabled
                InputProps={{
                  startAdornment: <InputAdornment position="start"><DirectionsBus /></InputAdornment>,
                }}
              />

              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Varyant"
                value={formData.variant}
                disabled
                InputProps={{
                  startAdornment: <InputAdornment position="start"><DirectionsBus /></InputAdornment>,
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
              placeholder="Otobüsünüz hakkında detaylı bilgi verin..."
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
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Yolcu Kapasitesi"
                value={formData.passengerCapacity}
                onChange={(e) => handleInputChange('passengerCapacity', e.target.value)}
                placeholder="Örn: 50"
                type="number"
              />

              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Koltuk Düzeni</InputLabel>
                <Select
                  value={formData.seatLayout}
                  onChange={(e) => handleInputChange('seatLayout', e.target.value)}
                >
                  {seatLayoutOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Koltuk Arkası Ekran</InputLabel>
                <Select
                  value={formData.seatBackScreen}
                  onChange={(e) => handleInputChange('seatBackScreen', e.target.value)}
                >
                  {screenOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Vites</InputLabel>
                <Select
                  value={formData.gearType}
                  onChange={(e) => handleInputChange('gearType', e.target.value)}
                >
                  <MenuItem value="Manuel">Manuel</MenuItem>
                  <MenuItem value="Otomatik">Otomatik</MenuItem>
                  <MenuItem value="Yarı Otomatik">Yarı Otomatik</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Vites Sayısı</InputLabel>
                <Select
                  value={formData.gearCount}
                  onChange={(e) => handleInputChange('gearCount', e.target.value)}
                >
                  {gearCountOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Lastik Durumu (%)"
                value={formData.tireCondition}
                onChange={(e) => handleInputChange('tireCondition', e.target.value)}
                placeholder="Örn: 85"
                type="number"
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Yakıt Hacmi (Litre)"
                value={formData.fuelCapacity}
                onChange={(e) => handleInputChange('fuelCapacity', e.target.value)}
                placeholder="Örn: 300"
                type="number"
              />

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
          </Stack>
        );

      case 2: // Konfor & Güvenlik
        return (
          <Stack spacing={3}>
            <Typography variant="h6">
              Konfor ve Güvenlik Özellikleri
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Otobüsünüzde bulunan özellikleri seçin
            </Typography>

            {/* Detaylı Bilgi */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                📋 Detaylı Bilgi
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  { key: 'threeG', label: '3G' },
                  { key: 'abs', label: 'ABS' },
                  { key: 'vehiclePhone', label: 'Araç Telefonu' },
                  { key: 'asr', label: 'ASR' },
                  { key: 'refrigerator', label: 'Buzdolabı' },
                  { key: 'heatedDriverGlass', label: 'Isıtmalı Sürücü Camı' },
                  { key: 'personalSoundSystem', label: 'Kişisel Ses Sistemi' },
                  { key: 'airCondition', label: 'Klima' },
                  { key: 'kitchen', label: 'Mutfak' },
                  { key: 'retarder', label: 'Retarder' },
                  { key: 'driverCabin', label: 'Sürücü Kabini' },
                  { key: 'television', label: 'Televizyon' },
                  { key: 'toilet', label: 'Tuvalet' },
                  { key: 'satellite', label: 'Uydu' },
                  { key: 'wifi', label: 'Wi-fi' },
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
              Otobüsünüzün fotoğraflarını yükleyin (Maksimum 15 adet)
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🚌 Otobüs İlanı Oluştur
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Chip label="Otobüs" color="primary" variant="outlined" />
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
      </Container>
  );
};

export default OtobusAdForm;
