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
  Paper
} from '@mui/material';
import { useDropzone } from 'react-dropzone';

const steps = ['İlan Bilgileri', 'Teknik Özellikler', 'Fotoğraflar', 'İletişim & Fiyat'];

const PlatformSasiForm: React.FC = () => {
  const navigate = useNavigate();
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
    contactName: '',
    phone: '',
    email: '',
    price: '',
    currency: 'TL',
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
            <Typography variant="h5" gutterBottom>İletişim & Fiyat</Typography>
            <TextField
              label="İletişim Kişisi"
              value={formData.contactName}
              onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Telefon"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="E-posta"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Fiyat"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                fullWidth
                required
              />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Para Birimi</InputLabel>
                <Select
                  value={formData.currency}
                  label="Para Birimi"
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                >
                  <MenuItem value="TL">TL</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="Şehir"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="İlçe"
              value={formData.district}
              onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
              fullWidth
              required
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
        Platform Şasi İlanı
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

export default PlatformSasiForm;
