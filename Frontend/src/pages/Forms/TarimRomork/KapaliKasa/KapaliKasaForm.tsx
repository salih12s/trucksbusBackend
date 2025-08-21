import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  InputLabel,
  Select,
  MenuItem,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Alert
} from '@mui/material';
import {
  Upload,
  AttachMoney,
  LocationOn,
  Person,
  Phone,
  Email
} from '@mui/icons-material';

const steps = ['İlan Bilgileri', 'Fotoğraflar', 'İletişim & Fiyat'];

const KapaliKasaForm: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // İlan Bilgileri
    title: '',
    description: '',
    productionYear: '',
    hasDamper: false,
    exchangeable: '',
    // Fotoğraflar
    images: [] as File[],
    // İletişim & Fiyat
    contactName: '',
    phone: '',
    email: '',
    price: '',
    city: '',
    district: ''
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = () => {
    console.log('Form Data:', formData);
    navigate('/');
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Üretim yılları (son 30 yıl)
  const currentYear = new Date().getFullYear();
  const productionYears = Array.from({ length: 30 }, (_, i) => currentYear - i);

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
            <FormControl fullWidth required>
              <InputLabel>Üretim Yılı</InputLabel>
              <Select
                value={formData.productionYear}
                label="Üretim Yılı"
                onChange={(e) => setFormData(prev => ({ ...prev, productionYear: e.target.value }))}
              >
                {productionYears.map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.hasDamper}
                  onChange={(e) => setFormData(prev => ({ ...prev, hasDamper: e.target.checked }))}
                />
              }
              label="Damper"
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
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (formData.images.length + files.length <= 15) {
                      setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, ...files]
                      }));
                    }
                  }}
                />
                <label htmlFor="image-upload">
                  <Button variant="contained" component="span">
                    Fotoğraf Seç
                  </Button>
                </label>
              </CardContent>
            </Card>

            {/* Yüklenen fotoğrafları göster */}
            {formData.images.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Yüklenen Fotoğraflar ({formData.images.length}/15)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {formData.images.map((file, index) => (
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
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="Örn: 450.000"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                }}
                required
              />

              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="İl"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>,
                }}
                required
              />
            </Box>

            <TextField
              fullWidth
              label="İlçe"
              value={formData.district}
              onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
              placeholder="İlçe seçin"
              InputProps={{
                startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>,
              }}
            />

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              📞 İletişim Bilgileri
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Ad Soyad"
                value={formData.contactName}
                onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Person /></InputAdornment>,
                }}
                required
              />

              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                label="Telefon"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(5XX) XXX XX XX"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Phone /></InputAdornment>,
                }}
                required
                error={!formData.phone}
                helperText={!formData.phone ? "Telefon numarası zorunludur" : ""}
              />
            </Box>

            <TextField
              fullWidth
              label="E-posta"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
        return 'Bilinmeyen adım';
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Kapalı Kasa Tarım Römorku İlanı
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

export default KapaliKasaForm;
