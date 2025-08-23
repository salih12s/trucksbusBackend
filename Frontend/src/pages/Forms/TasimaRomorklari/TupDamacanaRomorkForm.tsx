import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { listingService } from '../../../services/listingService';
import { createStandardPayload, validateListingPayload } from '../../../services/apiNormalizer';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { locationService, City, District } from '../../../services/locationService';
import { Box, Button, TextField, Typography, Stepper, Step, StepLabel, Card, CardContent, FormControlLabel, Checkbox, FormControl, FormLabel, RadioGroup, Radio, MenuItem, Stack, Chip, InputAdornment, Alert, Autocomplete } from '@mui/material';
import { AttachMoney, Upload, LocationOn, Person, Phone, Email } from '@mui/icons-material';

interface TupDamacanaRomorkFormData {
  title: string; description: string; productionYear: string; hasDamper: boolean; isExchangeable: string; uploadedImages: File[]; price: string; priceType: string; currency: string; sellerPhone: string; sellerName: string; sellerEmail: string; city: string; district: string;
}

const steps = ['İlan Detayları', 'Fotoğraflar', 'İletişim & Fiyat'];

const TupDamacanaRomorkForm: React.FC = () => {
  const { user } = useAuth();
  const { confirm } = useConfirmDialog();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  
  // Brand/Model/Variant states - location.state'den gelecek
  const selectedBrand = location.state?.brand;
  const selectedModel = location.state?.model;
  const selectedVariant = location.state?.variant;
  
  // City/District state
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  
  const [formData, setFormData] = useState<TupDamacanaRomorkFormData>({
    title: '', description: '', productionYear: '', hasDamper: false, isExchangeable: '', uploadedImages: [], price: '', priceType: 'fixed', currency: 'TRY', sellerPhone: '', sellerName: '', sellerEmail: '', city: '', district: ''
  });

  // Load cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoadingCities(true);
        const citiesData = await locationService.getCities();
        setCities(citiesData);
        console.log('🏙️ TupDamacanaRomorkForm: Şehirler yüklendi:', citiesData.length);
      } catch (error) {
        console.error('❌ TupDamacanaRomorkForm: Şehirler yüklenemedi:', error);
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
      console.log('🏘️ TupDamacanaRomorkForm: İlçeler yüklendi:', districtsData.length);
    } catch (error) {
      console.error('❌ TupDamacanaRomorkForm: İlçeler yüklenemedi:', error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Load user data
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
      
      // Eğer user'ın şehri varsa, ilçeleri yükle
      if (user.city) {
        const userCity = cities.find(city => city.name === user.city);
        if (userCity) {
          handleCityChange(userCity.id, userCity.name);
        }
      }
    }
  }, [user, cities]);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleInputChange = (field: keyof TupDamacanaRomorkFormData, value: any) => { setFormData(prev => ({ ...prev, [field]: value })); };
  
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
      console.log('TupDamacanaRomorkForm - Form gönderim başlatıldı');
      console.log('Seçili Brand:', selectedBrand);
      console.log('Seçili Model:', selectedModel);
      console.log('Seçili Variant:', selectedVariant);
      console.log('Form Data:', formData);
      console.log('Cities State:', cities.length);
      console.log('Districts State:', districts.length);
      
      const base64Images = await Promise.all(
        formData.uploadedImages.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      // City ve District'i ID'ye çevir - VasitaRomorkForm ile aynı pattern
      const selectedCity = cities.find(city => city.name === formData.city);
      const selectedDistrict = districts.find(district => district.name === formData.district);
      
      console.log('Form city/district values:', { city: formData.city, district: formData.district });
      console.log('Seçili şehir:', selectedCity);
      console.log('Seçili ilçe:', selectedDistrict);
      
      if (!selectedCity || !selectedDistrict) {
        await confirm({
          title: 'Eksik Bilgi',
          description: 'Lütfen şehir ve ilçe seçimi yapınız.',
          severity: 'warning'
        });
        return;
      }

      // VasitaRomorkForm ile aynı payload pattern kullan
      const payload = createStandardPayload({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        year: parseInt(formData.productionYear),
        city: formData.city,
        district: formData.district,
        city_id: selectedCity.id,
        district_id: selectedDistrict.id,
        category_id: selectedBrand?.vehicle_types?.categories?.id || "vehicle-category-001",
        seller_name: formData.sellerName,
        seller_phone: formData.sellerPhone,
        seller_email: formData.sellerEmail,
        is_exchangeable: formData.isExchangeable === 'evet',
        images: base64Images,
        vehicle_type_id: selectedVariant?.id || selectedBrand?.vehicle_type_id,
        brand_id: selectedBrand?.id,
        model_id: selectedModel?.id,
        variant_id: selectedVariant?.id
      }, {
        hasDamper: formData.hasDamper ? 'Evet' : 'Hayır',
        currency: formData.currency,
        priceType: formData.priceType
      });

      console.log('Payload created with createStandardPayload:', payload);
      console.log('Payload JSON stringify:', JSON.stringify(payload, null, 2));
      console.log('Selected Brand vehicle_types:', selectedBrand?.vehicle_types);
      console.log('Category ID from brand:', selectedBrand?.vehicle_types?.categories?.id);
      console.log('Vehicle type ID:', selectedBrand?.vehicle_type_id);

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
    if (totalFiles > 10) { 
      await confirm({
        title: 'Fotoğraf Limiti',
        description: 'En fazla 10 fotoğraf yükleyebilirsiniz.',
        severity: 'warning'
      });
      return; 
    } 
    setFormData(prev => ({ ...prev, uploadedImages: [...prev.uploadedImages, ...newFiles] })); 
  };
  const removeImage = (index: number) => { setFormData(prev => ({ ...prev, uploadedImages: prev.uploadedImages.filter((_, i) => i !== index) })); };
  const generateYearOptions = () => { const currentYear = new Date().getFullYear(); const years = []; for (let year = currentYear; year >= currentYear - 30; year--) { years.push(year.toString()); } return years; };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: return (<Card><CardContent><Typography variant="h6" gutterBottom>Tüp Damacana Römorku İlan Detayları</Typography><TextField fullWidth label="İlan Başlığı" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} margin="normal" required /><TextField fullWidth label="Açıklama" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} margin="normal" multiline rows={4} required /><TextField select fullWidth label="Üretim Yılı" value={formData.productionYear} onChange={(e) => handleInputChange('productionYear', e.target.value)} margin="normal" required>{generateYearOptions().map((year) => (<MenuItem key={year} value={year}>{year}</MenuItem>))}</TextField><FormControlLabel control={<Checkbox checked={formData.hasDamper} onChange={(e) => handleInputChange('hasDamper', e.target.checked)} />} label="Damper" sx={{ mt: 2, mb: 2 }} /><FormControl component="fieldset" margin="normal" fullWidth><FormLabel component="legend">Takaslı</FormLabel><RadioGroup value={formData.isExchangeable} onChange={(e) => handleInputChange('isExchangeable', e.target.value)} row><FormControlLabel value="evet" control={<Radio />} label="Evet" /><FormControlLabel value="hayır" control={<Radio />} label="Hayır" /></RadioGroup></FormControl></CardContent></Card>);
      case 1: return (<Stack spacing={3}><Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Upload color="primary" />Fotoğraf Yükleme</Typography><Typography variant="body2" color="text.secondary">Aracınızın fotoğraflarını yükleyin (Maksimum 10 adet)</Typography><Card sx={{ border: '2px dashed #ddd', textAlign: 'center', p: 4 }}><CardContent><Upload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} /><Typography variant="h6" gutterBottom>Fotoğraf Yükle</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>JPG, PNG formatında maksimum 5MB boyutunda dosyalar yükleyebilirsiniz</Typography><input accept="image/*" style={{ display: 'none' }} id="image-upload" multiple type="file" onChange={handleImageUpload} /><label htmlFor="image-upload"><Button variant="contained" component="span">Fotoğraf Seç</Button></label></CardContent></Card>{formData.uploadedImages.length > 0 && (<Box><Typography variant="subtitle1" sx={{ mb: 2 }}>Yüklenen Fotoğraflar ({formData.uploadedImages.length}/10)</Typography><Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>{formData.uploadedImages.map((file, index) => (<Box key={index} sx={{ position: 'relative' }}><img src={URL.createObjectURL(file)} alt={`Upload ${index + 1}`} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: index === 0 ? '2px solid #4CAF50' : '1px solid #ddd' }} />{index === 0 && <Chip label="Vitrin" color="success" size="small" sx={{ position: 'absolute', top: 4, left: 4 }} />}<Button size="small" color="error" onClick={() => removeImage(index)} sx={{ position: 'absolute', top: 4, right: 4, minWidth: 24, width: 24, height: 24, p: 0, bgcolor: 'rgba(255,255,255,0.8)' }}>×</Button></Box>))}</Box></Box>)}<Typography variant="body2" color="text.secondary">💡 İpucu: İlk yüklediğiniz fotoğraf vitrin fotoğrafı olarak kullanılacaktır</Typography></Stack>);
      case 2: return (
        <Stack spacing={3}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoney color="primary" />Fiyat ve İletişim Bilgileri
          </Typography>
          
          <TextField
            fullWidth
            label="Fiyat"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            placeholder="Örn: 450.000"
            InputProps={{ startAdornment: <InputAdornment position="start">₺</InputAdornment> }}
            required
          />
          
          {/* Şehir Seçimi */}
          <Autocomplete
            options={cities}
            getOptionLabel={(option) => option.name}
            loading={loadingCities}
            value={cities.find(city => city.name === formData.city) || null}
            onChange={(_event, newValue) => {
              if (newValue) {
                handleCityChange(newValue.id, newValue.name);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="İl"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>
                }}
                required
              />
            )}
          />
          
          {/* İlçe Seçimi */}
          <Autocomplete
            options={districts}
            getOptionLabel={(option) => option.name}
            loading={loadingDistricts}
            disabled={!formData.city || loadingDistricts}
            value={districts.find(district => district.name === formData.district) || null}
            onChange={(_event, newValue) => {
              setFormData(prev => ({ ...prev, district: newValue ? newValue.name : '' }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="İlçe"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>
                }}
                required
                helperText={!formData.city ? "Önce il seçiniz" : ""}
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
              disabled={!!user}
              InputProps={{ startAdornment: <InputAdornment position="start"><Person /></InputAdornment> }}
              required
              helperText={user ? "Kullanıcı bilgilerinizden alınmıştır" : ""}
            />
            <TextField
              sx={{ flex: 1, minWidth: 200 }}
              label="Telefon"
              value={formData.sellerPhone}
              disabled={!!user}
              placeholder="(5XX) XXX XX XX"
              InputProps={{ startAdornment: <InputAdornment position="start"><Phone /></InputAdornment> }}
              required
              helperText={user ? "Kullanıcı bilgilerinizden alınmıştır" : "Telefon numarası zorunludur"}
            />
          </Box>
          
          <TextField
            fullWidth
            label="E-posta"
            value={formData.sellerEmail}
            disabled={!!user}
            InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }}
            type="email"
            required
            helperText={user ? "Kullanıcı bilgilerinizden alınmıştır" : ""}
          />
          
          <Alert severity="info">
            <strong>Önemli:</strong> İlanınız yayına alınmadan önce moderatörlerimiz tarafından incelenecektir. 
            Onay sürecinde e-posta veya telefon ile bilgilendirileceksiniz.
          </Alert>
        </Stack>
      );
      default: return 'Bilinmeyen adım';
    }
  };

  const getFormTitle = (): string => {
    if (selectedBrand && selectedModel && selectedVariant) {
      return `${selectedBrand.name} ${selectedModel.name} ${selectedVariant.name} İlan Ver`;
    }
    return "Tüp Damacana Römorku İlanı Ver";
  };

  return (<Box sx={{ width: '100%', p: 3 }}><Typography variant="h4" component="h1" gutterBottom>{getFormTitle()}</Typography><Stepper activeStep={activeStep} sx={{ mb: 4 }}>{steps.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}</Stepper><Box sx={{ mb: 4 }}>{renderStepContent(activeStep)}</Box><Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}><Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>Geri</Button><Box sx={{ flex: '1 1 auto' }} />{activeStep === steps.length - 1 ? (<Button onClick={handleSubmit} variant="contained">İlanı Yayınla</Button>) : (<Button onClick={handleNext} variant="contained">İleri</Button>)}</Box></Box>);
};

export default TupDamacanaRomorkForm;
