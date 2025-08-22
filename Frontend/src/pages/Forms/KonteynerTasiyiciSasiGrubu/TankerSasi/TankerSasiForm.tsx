import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { useConfirmDialog } from '../../../../hooks/useConfirmDialog';
import { locationService, City, District } from '../../../../services/locationService';
import { createStandardPayload } from '../../../../services/apiNormalizer';
import { listingService } from '../../../../services/listingService';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Stack,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  InputAdornment,
  Alert,
  Autocomplete
} from '@mui/material';
import {
  AttachMoney,
  LocationOn,
  Person,
  Phone,
  Email
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

const steps = ['İlan Bilgileri', 'Teknik Özellikler', 'Fotoğraflar', 'İletişim & Fiyat'];

const TankerSasiForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const { confirm } = useConfirmDialog();
  
  // Parse location state
  const selectedBrand = location.state?.brand;
  const selectedModel = location.state?.model;
  const selectedVariant = location.state?.variant;
  
  // Location states
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // İlan Bilgileri
    title: '',
    description: '',
    year: '',
    // Teknik Özellikler
    axleCount: '',
    loadCapacity: '',
    tireCondition: '',
    exchangeable: '',
    // Fotoğraflar
    images: [] as File[],
    // İletişim & Fiyat
    sellerName: user?.first_name + ' ' + user?.last_name || '',
    sellerPhone: user?.phone || '',
    sellerEmail: user?.email || '',
    price: '',
    currency: 'TL',
    city: '',
    district: ''
  });

  // Load cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoadingCities(true);
        const citiesData = await locationService.getCities();
        setCities(citiesData);
      } catch (error) {
        console.error('Error loading cities:', error);
      } finally {
        setLoadingCities(false);
      }
    };

    loadCities();
  }, []);

  // Auto-fill user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        sellerName: `${user.first_name} ${user.last_name}`,
        sellerPhone: user.phone || '',
        sellerEmail: user.email || ''
      }));
    }
  }, [user]);

  // Generic input change handler
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle city change and load districts
  const handleCityChange = async (cityName: string) => {
    setFormData(prev => ({
      ...prev,
      city: cityName,
      district: '' // Reset district when city changes
    }));

    if (cityName) {
      try {
        setLoadingDistricts(true);
        const city = cities.find(c => c.name === cityName);
        if (city) {
          const districtsData = await locationService.getDistrictsByCity(city.id);
          setDistricts(districtsData);
        }
      } catch (error) {
        console.error('Error loading districts:', error);
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    } else {
      setDistricts([]);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    try {
      // Base64 image conversion
      const base64Images = await Promise.all(
        formData.images.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      const selectedCity = cities.find(city => city.name === formData.city);
      const selectedDistrict = districts.find(district => district.name === formData.district);
      
      if (!selectedCity || !selectedDistrict) {
        await confirm({
          title: 'Hata',
          description: 'Lütfen şehir ve ilçe seçimi yapınız.',
          severity: 'error',
          confirmText: 'Tamam',
          cancelText: ''
        });
        return;
      }

      const payload = createStandardPayload({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        images: base64Images,
        seller_name: formData.sellerName,
        seller_phone: formData.sellerPhone,
        seller_email: formData.sellerEmail,
        city: selectedCity.name,
        district: selectedDistrict.name,
        city_id: selectedCity.id,
        district_id: selectedDistrict.id,
        category_id: selectedBrand?.vehicle_types?.categories?.id || "vehicle-category-001",
        brand_id: selectedBrand?.id,
        model_id: selectedModel?.id,
        variant_id: selectedVariant?.id,
        vehicle_type_id: selectedBrand?.vehicle_type_id,
        year: parseInt(formData.year) || 0,
        is_exchangeable: formData.exchangeable === 'evet'
      }, {
        // Şasi properties
        axleCount: formData.axleCount,
        loadCapacity: formData.loadCapacity,
        tireCondition: formData.tireCondition,
        exchangeable: formData.exchangeable
      });

      console.log('Submitting:', payload);
      
      // Use standard listing service
      const response = await listingService.createStandardListing(payload);
      
      if (response.success) {
        console.log('✅ Tanker Şasi ilanı başarıyla oluşturuldu:', response.data);
        await confirm({
          title: 'Başarılı',
          description: 'İlanınız başarıyla oluşturuldu! Admin onayından sonra yayınlanacaktır.',
          severity: 'success',
          confirmText: 'Tamam',
          cancelText: ''
        });
        navigate('/'); // Anasayfaya yönlendir
      } else {
        throw new Error(response.message || 'İlan oluşturulamadı');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      await confirm({
        title: 'Hata',
        description: 'İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
        severity: 'error',
        confirmText: 'Tamam',
        cancelText: ''
      });
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (formData.images.length + acceptedFiles.length <= 15) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...acceptedFiles]
      }));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 15
  });

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Typography variant="h5" gutterBottom>İlan Bilgileri</Typography>
            <TextField
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Açıklama"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={4}
              fullWidth
              required
            />
            <TextField
              label="Üretim Yılı"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
              fullWidth
              required
            />
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="h5" gutterBottom>Teknik Özellikler</Typography>
            <TextField
              label="Dingil Sayısı"
              type="number"
              value={formData.axleCount}
              onChange={(e) => setFormData(prev => ({ ...prev, axleCount: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="İstiap Haddi (t)"
              type="number"
              value={formData.loadCapacity}
              onChange={(e) => setFormData(prev => ({ ...prev, loadCapacity: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Lastik Durumu (%)"
              type="number"
              value={formData.tireCondition}
              onChange={(e) => setFormData(prev => ({ ...prev, tireCondition: e.target.value }))}
              fullWidth
              required
              inputProps={{ min: 0, max: 100 }}
            />
            <FormControl component="fieldset">
              <FormLabel component="legend">Takaslı</FormLabel>
              <RadioGroup
                value={formData.exchangeable}
                onChange={(e) => setFormData(prev => ({ ...prev, exchangeable: e.target.value }))}
                row
              >
                <FormControlLabel value="evet" control={<Radio />} label="Evet" />
                <FormControlLabel value="hayır" control={<Radio />} label="Hayır" />
              </RadioGroup>
            </FormControl>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Typography variant="h5" gutterBottom>Fotoğraflar</Typography>
            <Paper
              {...getRootProps()}
              sx={{
                p: 3,
                border: '2px dashed #ccc',
                borderColor: isDragActive ? 'primary.main' : '#ccc',
                backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <input {...getInputProps()} />
              <Typography>
                {isDragActive
                  ? 'Fotoğrafları buraya bırakın...'
                  : 'Fotoğraf eklemek için tıklayın veya sürükleyip bırakın'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Maksimum 15 fotoğraf yükleyebilirsiniz
              </Typography>
            </Paper>
            
            {formData.images.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Yüklenen Fotoğraflar ({formData.images.length}/15)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.images.map((file, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        style={{ width: 100, height: 100, objectFit: 'cover' }}
                      />
                      <Button
                        size="small"
                        color="error"
                        onClick={() => removeImage(index)}
                        sx={{ position: 'absolute', top: 0, right: 0, minWidth: 'auto' }}
                      >
                        ×
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Stack>
        );

      case 3:
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
                    handleCityChange(value.name);
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
          </Stack>
        );

      default:
        return 'Bilinmeyen adım';
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Tanker Şasi İlanı
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 2, mb: 1 }}>
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

export default TankerSasiForm;
