import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Stepper, Step, StepLabel, Card, CardContent, MenuItem, Stack, Chip, InputAdornment, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Checkbox, FormGroup, Autocomplete, Alert } from '@mui/material';
import { AttachMoney, Upload, LocationOn, Person, Phone, Email, DirectionsCar, Build, Security } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { locationService, City, District } from '../../../services/locationService';
import { api } from '../../../services/api';

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
}

const steps = ['İlan Detayları', 'Araç Bilgileri', 'Detaylı Bilgi', 'Fotoğraflar', 'İletişim & Fiyat'];

const TekliAracForm: React.FC = () => {
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

  // Load cities
  useEffect(() => {
    const loadCities = async () => {
      try {
        const citiesData = await locationService.getCities();
        setCities(citiesData);
      } catch (error) {
        console.error('Error loading cities:', error);
      }
    };
    loadCities();
  }, []);

  // Load districts when city changes
  useEffect(() => {
    if (formData.city) {
      const loadDistricts = async () => {
        try {
          const selectedCity = cities.find(c => c.name === formData.city);
          if (selectedCity) {
            const districtsData = await locationService.getDistrictsByCity(selectedCity.id);
            setDistricts(districtsData);
          }
        } catch (error) {
          console.error('Error loading districts:', error);
        }
      };
      loadDistricts();
    } else {
      setDistricts([]);
      setFormData(prev => ({ ...prev, district: '' }));
    }
  }, [formData.city, cities]);

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
    try {
      if (!validateStep(4)) return;
      
      // Prepare form data for submission
      const listingData = {
        ...formData,
        category: 'Oto Kurtarıcı & Taşıyıcı',
        subcategory: 'Tekli Araç',
        images: formData.uploadedImages
      };

      console.log('Submitting form data:', listingData);
      
      // Make API call
      const response = await api.post('/listings', listingData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data.success) {
        // Success - show admin approval message and navigate home
        alert('İlanınız başarıyla oluşturuldu! Admin onayından sonra yayınlanacaktır.');
        navigate('/');
      } else {
        setSubmitError(response.data.message || 'İlan oluşturulamadı');
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setSubmitError(
        error.response?.data?.message || 
        'İlan gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    }
  };

  const handleInputChange = (field: keyof TekliAracFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (submitError) setSubmitError('');
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
                  handleInputChange('city', newValue ? newValue.name : '');
                }}
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
                handleInputChange('district', newValue ? newValue.name : '');
              }}
              disabled={!formData.city}
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

export default TekliAracForm;
