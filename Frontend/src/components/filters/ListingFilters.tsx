import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  IconButton,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  Close,
} from '@mui/icons-material';
import { api } from '../../services/api';

export interface FilterValues {
  search?: string;
  category?: string;
  brand?: string;
  model?: string;
  city?: string;
  district?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  kmMin?: number;
  kmMax?: number;
  isCorporate?: boolean;
}

interface FilterData {
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
  models: Array<{ id: string; name: string }>;
  cities: Array<{ id: string; name: string }>;
  districts: Array<{ id: string; name: string }>;
}

interface ListingFiltersProps {
  onFiltersChange: (filters: FilterValues) => void;
  initialFilters?: FilterValues;
  loading?: boolean;
}

const ListingFilters: React.FC<ListingFiltersProps> = ({
  onFiltersChange,
  initialFilters = {},
  loading = false,
}) => {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [filterData, setFilterData] = useState<FilterData>({
    categories: [],
    brands: [],
    models: [],
    cities: [],
    districts: [],
  });

  // API'lerden verileri yükle
  useEffect(() => {
    loadFilterData();
  }, []);

  // Brand değiştiğinde model yükle
  useEffect(() => {
    if (filters.brand) {
      loadModels(filters.brand);
    } else {
      setFilterData(prev => ({ ...prev, models: [] }));
      setFilters(prev => ({ ...prev, model: undefined }));
    }
  }, [filters.brand]);

  // City değiştiğinde district yükle
  useEffect(() => {
    if (filters.city) {
      loadDistricts(filters.city);
    } else {
      setFilterData(prev => ({ ...prev, districts: [] }));
      setFilters(prev => ({ ...prev, district: undefined }));
    }
  }, [filters.city]);

  const loadFilterData = async () => {
    try {
      console.log('🔄 Loading filter data...');
      
      // Kategorileri yükle (vehicle types)
      const categoriesRes = await api.get('/categories/vehicle-types');
      console.log('📋 Categories loaded:', categoriesRes.data);
      
      // Markaları yükle
      const brandsRes = await api.get('/categories/brands');
      console.log('🚛 Brands loaded:', brandsRes.data);
      
      // Şehirleri yükle
      const citiesRes = await api.get('/locations/cities');
      console.log('🏙️ Cities loaded:', citiesRes.data);

      setFilterData({
        categories: categoriesRes.data?.data || [],
        brands: brandsRes.data?.data || [],
        models: [],
        cities: citiesRes.data?.data || [],
        districts: [],
      });
    } catch (error) {
      console.error('❌ Filter data yüklenemedi:', error);
    }
  };

  const loadModels = async (brandId: string) => {
    try {
      console.log('🔄 Loading models for brand:', brandId);
      const response = await api.get(`/categories/models?brand_id=${brandId}`);
      console.log('🚗 Models loaded:', response.data);
      setFilterData(prev => ({ ...prev, models: response.data?.data || [] }));
    } catch (error) {
      console.error('❌ Model listesi yüklenemedi:', error);
    }
  };

  const loadDistricts = async (cityId: string) => {
    try {
      console.log('🔄 Loading districts for city:', cityId);
      const response = await api.get(`/locations/districts?city_id=${cityId}`);
      console.log('🏘️ Districts loaded:', response.data);
      setFilterData(prev => ({ ...prev, districts: response.data?.data || [] }));
    } catch (error) {
      console.error('❌ İlçe listesi yüklenemedi:', error);
    }
  };

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleQuickSearch = () => {
    onFiltersChange(filters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(filters);
    setOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).filter(key => 
      filters[key as keyof FilterValues] !== undefined && 
      filters[key as keyof FilterValues] !== '' &&
      filters[key as keyof FilterValues] !== null
    ).length;
  };

  // Kategori isimlerini Türkçeye çevir
  const getCategoryDisplayName = (categoryKey: string): string => {
    const categoryNames: Record<string, string> = {
      'cekici': 'Çekici',
      'dorse': 'Dorse',
      'kamyon': 'Kamyon & Kamyonet',
      'romork': 'Römork',
      'minibus': 'Minibüs & Midibüs',
      'otobus': 'Otobüs',
      'karoser': 'Karoser & Üst Yapı',
      'yedek_parca': 'Yedek Parça',
      'diger': 'Diğer',
    };
    return categoryNames[categoryKey] || categoryKey;
  };

  // Yıllar listesi oluştur
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 30 }, (_, i) => currentYear - i);
  };

  return (
    <>
      {/* Kompakt Arama Çubuğu */}
      <Box sx={{ mb: 2, p: 1.5, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="İlan ara... (marka, model, açıklama)"
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleQuickSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: 'grey.50' }}
          />
          
          <Button
            variant="contained"
            size="small"
            onClick={handleQuickSearch}
            disabled={loading}
            startIcon={<Search fontSize="small" />}
            sx={{ minWidth: 80, py: 1 }}
          >
            Ara
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            onClick={() => setOpen(true)}
            startIcon={<FilterList fontSize="small" />}
            sx={{ 
              minWidth: 100,
              py: 1,
              position: 'relative',
            }}
          >
            Filtrele
            {getActiveFilterCount() > 0 && (
              <Chip
                label={getActiveFilterCount()}
                size="small"
                color="primary"
                sx={{ 
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  minWidth: 18,
                  height: 18,
                  fontSize: '0.7rem'
                }}
              />
            )}
          </Button>
        </Box>

        {/* Aktif Filtreler */}
        {getActiveFilterCount() > 0 && (
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Aktif Filtreler:
            </Typography>
            {Object.entries(filters).map(([key, value]) => (
              value && (
                <Chip
                  key={key}
                  label={`${key}: ${value}`}
                  size="small"
                  onDelete={() => handleFilterChange(key as keyof FilterValues, undefined)}
                  color="primary"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 22 }}
                />
              )
            ))}
            <Button
              size="small"
              onClick={handleClearFilters}
              startIcon={<Clear fontSize="small" />}
              color="error"
              sx={{ fontSize: '0.7rem', minHeight: 22 }}
            >
              Temizle
            </Button>
          </Box>
        )}
      </Box>

      {/* Detaylı Filtreler Modal */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Detaylı Filtreleme</Typography>
          <IconButton onClick={() => setOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Kategori ve Marka */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Kategori ve Marka
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    label="Kategori"
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    {filterData.categories.map((category) => (
                      <MenuItem key={category.id} value={category.name}>
                        {getCategoryDisplayName(category.name)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Marka</InputLabel>
                  <Select
                    value={filters.brand || ''}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    label="Marka"
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    {filterData.brands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Model</InputLabel>
                  <Select
                    value={filters.model || ''}
                    onChange={(e) => handleFilterChange('model', e.target.value)}
                    label="Model"
                    disabled={!filters.brand}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    {filterData.models.map((model) => (
                      <MenuItem key={model.id} value={model.id}>
                        {model.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Divider />

            {/* Konum */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Konum
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Şehir</InputLabel>
                  <Select
                    value={filters.city || ''}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    label="Şehir"
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    {filterData.cities.map((city) => (
                      <MenuItem key={city.id} value={city.id}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>İlçe</InputLabel>
                  <Select
                    value={filters.district || ''}
                    onChange={(e) => handleFilterChange('district', e.target.value)}
                    label="İlçe"
                    disabled={!filters.city}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    {filterData.districts.map((district) => (
                      <MenuItem key={district.id} value={district.id}>
                        {district.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Divider />

            {/* Fiyat ve Yıl */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Fiyat ve Yıl
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Min Fiyat (₺)"
                  type="number"
                  value={filters.priceMin || ''}
                  onChange={(e) => handleFilterChange('priceMin', Number(e.target.value) || undefined)}
                  sx={{ width: 150 }}
                />
                <TextField
                  label="Max Fiyat (₺)"
                  type="number"
                  value={filters.priceMax || ''}
                  onChange={(e) => handleFilterChange('priceMax', Number(e.target.value) || undefined)}
                  sx={{ width: 150 }}
                />
                
                <FormControl sx={{ width: 120 }}>
                  <InputLabel>Min Yıl</InputLabel>
                  <Select
                    value={filters.yearMin || ''}
                    onChange={(e) => handleFilterChange('yearMin', Number(e.target.value) || undefined)}
                    label="Min Yıl"
                  >
                    <MenuItem value="">Seçin</MenuItem>
                    {generateYears().map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl sx={{ width: 120 }}>
                  <InputLabel>Max Yıl</InputLabel>
                  <Select
                    value={filters.yearMax || ''}
                    onChange={(e) => handleFilterChange('yearMax', Number(e.target.value) || undefined)}
                    label="Max Yıl"
                  >
                    <MenuItem value="">Seçin</MenuItem>
                    {generateYears().map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Divider />

            {/* Kilometre */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Kilometre
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Min KM"
                  type="number"
                  value={filters.kmMin || ''}
                  onChange={(e) => handleFilterChange('kmMin', Number(e.target.value) || undefined)}
                  sx={{ width: 150 }}
                />
                <TextField
                  label="Max KM"
                  type="number"
                  value={filters.kmMax || ''}
                  onChange={(e) => handleFilterChange('kmMax', Number(e.target.value) || undefined)}
                  sx={{ width: 150 }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleClearFilters}
            startIcon={<Clear />}
            color="error"
          >
            Temizle
          </Button>
          <Button
            onClick={() => setOpen(false)}
            color="inherit"
          >
            İptal
          </Button>
          <Button
            onClick={handleApplyFilters}
            variant="contained"
            startIcon={<Search />}
            disabled={loading}
          >
            Filtreleri Uygula
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ListingFilters;
