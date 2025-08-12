import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  ArrowBack,
  ArrowForward,
  Check,
  PhotoCamera,
} from '@mui/icons-material';
import { Category } from '@/types';

const steps = ['Kategori Seçimi', 'İlan Bilgileri', 'Fotoğraflar', 'Önizleme'];

const CreateListing: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    description: '',
    price: '',
    location: '',
    brand: '',
    model: '',
    year: '',
    kilometer: '',
    fuelType: '',
    transmission: '',
    condition: '',
    features: [] as string[],
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    // Mock categories
    const mockCategories: Category[] = [
      { id: '1', name: 'Kamyon', slug: 'kamyon', createdAt: new Date() },
      { id: '2', name: 'Otobüs', slug: 'otobus', createdAt: new Date() },
      { id: '3', name: 'Minibüs', slug: 'minibus', createdAt: new Date() },
      { id: '4', name: 'Çekici', slug: 'cekici', createdAt: new Date() },
      { id: '5', name: 'Dorse', slug: 'dorse', createdAt: new Date() },
    ];
    setCategories(mockCategories);
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + images.length > 10) {
      alert('Maksimum 10 fotoğraf yükleyebilirsiniz');
      return;
    }

    setImages(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};

    switch (step) {
      case 0:
        if (!formData.categoryId) newErrors.categoryId = 'Kategori seçimi zorunludur';
        break;
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Başlık zorunludur';
        if (!formData.description.trim()) newErrors.description = 'Açıklama zorunludur';
        if (!formData.price || isNaN(Number(formData.price))) newErrors.price = 'Geçerli bir fiyat girin';
        if (!formData.location.trim()) newErrors.location = 'Konum zorunludur';
        break;
      case 2:
        if (images.length === 0) newErrors.images = 'En az 1 fotoğraf yüklemelisiniz';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('İlanınız başarıyla oluşturuldu! Onay için admin paneline gönderildi.');
      navigate('/');
    } catch (error) {
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              İlan Kategorisi Seçin
            </Typography>
            <FormControl fullWidth error={!!errors.categoryId}>
              <InputLabel>Kategori</InputLabel>
              <Select
                value={formData.categoryId}
                label="Kategori"
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {errors.categoryId && <Typography color="error" variant="body2">{errors.categoryId}</Typography>}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              İlan Bilgilerini Girin
            </Typography>
            
            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              placeholder="Örn: 2018 Mercedes Actros 2545"
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Açıklama"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
              placeholder="Aracın durumu, özellikleri ve diğer detayları..."
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Fiyat (TL)"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                error={!!errors.price}
                helperText={errors.price}
              />
              
              <TextField
                label="Konum"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                error={!!errors.location}
                helperText={errors.location}
                placeholder="İl, İlçe"
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Marka"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="Mercedes, Volvo, MAN..."
              />
              
              <TextField
                label="Model"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="Actros, FH, TGX..."
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Yıl"
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
              />
              
              <TextField
                label="Kilometre"
                type="number"
                value={formData.kilometer}
                onChange={(e) => handleInputChange('kilometer', e.target.value)}
              />
              
              <TextField
                select
                label="Yakıt Tipi"
                value={formData.fuelType}
                onChange={(e) => handleInputChange('fuelType', e.target.value)}
              >
                <MenuItem value="dizel">Dizel</MenuItem>
                <MenuItem value="benzin">Benzin</MenuItem>
                <MenuItem value="lpg">LPG</MenuItem>
                <MenuItem value="elektrik">Elektrik</MenuItem>
              </TextField>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Fotoğraflar Ekleyin
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Maksimum 10 fotoğraf yükleyebilirsiniz. İlk fotoğraf kapak fotoğrafı olacaktır.
            </Typography>

            <Box sx={{ mb: 3 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                multiple
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCamera />}
                  sx={{ mb: 2 }}
                >
                  Fotoğraf Seç
                </Button>
              </label>
            </Box>

            {errors.images && <Typography color="error" variant="body2" sx={{ mb: 2 }}>{errors.images}</Typography>}

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2 }}>
              {imagePreviews.map((preview, index) => (
                <Card key={index} sx={{ position: 'relative' }}>
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    style={{ width: '100%', height: 120, objectFit: 'cover' }}
                  />
                  <IconButton
                    sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.8)' }}
                    size="small"
                    onClick={() => removeImage(index)}
                  >
                    <Delete color="error" />
                  </IconButton>
                  {index === 0 && (
                    <Chip
                      label="Kapak"
                      size="small"
                      color="primary"
                      sx={{ position: 'absolute', bottom: 5, left: 5 }}
                    />
                  )}
                </Card>
              ))}
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              İlan Önizleme
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {formData.title}
                </Typography>
                <Typography variant="h4" color="success.main" fontWeight="bold" sx={{ mb: 2 }}>
                  {Number(formData.price).toLocaleString('tr-TR')} TL
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {formData.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip label={`📍 ${formData.location}`} />
                  {formData.brand && <Chip label={`🚛 ${formData.brand} ${formData.model}`} />}
                  {formData.year && <Chip label={`📅 ${formData.year}`} />}
                  {formData.kilometer && <Chip label={`🛣️ ${Number(formData.kilometer).toLocaleString()} km`} />}
                  {formData.fuelType && <Chip label={`⛽ ${formData.fuelType}`} />}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {imagePreviews.length} fotoğraf eklendi
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Geri Dön
      </Button>

      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Yeni İlan Oluştur
      </Typography>

      <Paper sx={{ p: 4, mt: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {loading && <LinearProgress sx={{ mb: 3 }} />}

        <Box sx={{ minHeight: 400 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
          >
            Geri
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={<Check />}
            >
              {loading ? 'İlan Oluşturuluyor...' : 'İlanı Yayınla'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
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

export default CreateListing;
