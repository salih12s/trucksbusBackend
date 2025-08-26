// SmartTemplate - Dynamic template system for listing details
import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Stack,
  Chip,
  Avatar,
  Button,
  IconButton,
  Card,
  CardContent,
  Divider,
  Grid,
  Badge
} from '@mui/material';
import {
  Phone,
  Email,
  LocationOn,
  Visibility,
  CalendarToday,
  Share,
  Check as CheckIcon,
  FavoriteBorder,
  Report
} from '@mui/icons-material';
import { formatTRY } from '../../../utils/format';
import { translateField, translateValue } from '../../../utils/fieldTranslations';
import { getCategoryConfig } from './registry';
import ImageCarousel from '../components/ImageCarousel';
import SpecGroup from '../components/SpecGroup';

interface ListingBase {
  id: string;
  title: string;
  description?: string;
  price: number;
  status: string;
  isApproved: boolean;
  views: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  vehicle_type: {
    id: string;
    name: string;
    slug: string;
  };
  brand?: {
    id: string;
    name: string;
  };
  model?: {
    id: string;
    name: string;
  };
  variant?: {
    id: string;
    name: string;
  };
  year?: number;
  km?: number;
  locationText: string;
  createdAt: string;
  updatedAt: string;
  seller: {
    name: string;
    phone?: string;
    email?: string;
  };
  media: Array<{
    url: string;
    alt: string;
    sort: number;
  }>;
  features: Record<string, any>;
  listing_properties?: Array<{
    key: string;
    value: string;
    type: string;
  }>;
}

interface SchemaGroup {
  key: string;
  label: string;
  order: number;
  attributes: Array<{
    key: string;
    label: string;
    data_type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'ENUM' | 'MULTISELECT' | 'STRING';
    is_required: boolean;
    order: number;
  }>;
}

interface Schema {
  groups: SchemaGroup[];
  flat: Array<{
    key: string;
    label: string;
    data_type: string;
    is_required: boolean;
    order: number;
  }>;
}

interface SmartTemplateProps {
  base: ListingBase;
  values: Record<string, any>;
  schema: Schema;
}

const SmartTemplate: React.FC<SmartTemplateProps> = ({ base, values, schema }) => {
  // Get template configuration based on category and vehicle type
  const categorySlug = base.category?.slug || 'default';
  const vehicleTypeSlug = base.vehicle_type?.slug || 'default';
  const templateConfig = getCategoryConfig(categorySlug, vehicleTypeSlug);

  // Debug: Check if we're receiving properties data
  console.log('🔍 SmartTemplate Props Debug:', {
    baseId: base.id,
    baseTitle: base.title,
    hasValues: !!values,
    valuesKeys: Object.keys(values || {}),
    values: values,
    hasSchemaGroups: !!schema.groups?.length,
    schemaGroupsCount: schema.groups?.length || 0,
    hasBaseFeatures: !!base.features,
    baseFeatures: base.features
  });

  // Detailed values debug
  console.log('📊 Values Object Details:', JSON.stringify(values, null, 2));
  console.log('📋 Schema Object Details:', JSON.stringify(schema, null, 2));
  console.log('🎯 Base Features Details:', JSON.stringify(base.features, null, 2));

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: base.title,
        text: `${base.title} - ${formatTRY(base.price)}`,
        url: window.location.href
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
        {/* Left Column - Main Content */}
        <Box>
          {/* Header */}
          <Box mb={3}>
            <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between" mb={2}>
              <Box flex={1}>
                <Typography variant="h4" component="h1" gutterBottom>
                  {base.title}
                </Typography>
                
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <Chip
                    label={base.category?.name}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={base.vehicle_type?.name}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                  {base.brand && (
                    <Chip
                      label={base.brand.name}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {base.model && (
                    <Chip
                      label={base.model.name}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>

              <Stack direction="row" spacing={1}>
                <IconButton onClick={handleShare} size="small">
                  <Share />
                </IconButton>
                <IconButton size="small">
                  <FavoriteBorder />
                </IconButton>
                <IconButton size="small" color="error">
                  <Report />
                </IconButton>
              </Stack>
            </Stack>

            {/* Basic Info */}
            <Stack direction="row" spacing={3} flexWrap="wrap" mb={3}>
              {base.year && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Model Yılı
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {base.year}
                  </Typography>
                </Box>
              )}
              {base.km && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Kilometre
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {base.km.toLocaleString('tr-TR')} km
                  </Typography>
                </Box>
              )}
            </Stack>

            {/* Location & Status */}
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              {base.locationText && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {base.locationText}
                  </Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={1} alignItems="center">
                <Visibility fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {base.views || 0} görüntülenme
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {new Date(base.createdAt).toLocaleDateString('tr-TR')}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Price & Actions */}
          <Box textAlign={{ xs: 'left', md: 'right' }}>
            <Typography variant="h3" color="primary.main" fontWeight="bold" gutterBottom>
              {formatTRY(base.price)}
            </Typography>
          </Box>

          {/* Image Gallery */}
          <ImageCarousel images={base.media} />

          {/* Description */}
          {base.description && (
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>
                İlan Açıklaması
              </Typography>
              <Paper sx={{ p: 3 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {base.description}
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Technical Specifications */}
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Teknik Özellikler
            </Typography>
            
            <SpecGroup
              groups={schema.groups
                .filter(group => group.key !== 'features') // Features'ı ayrı göstereceğiz
                .map(group => ({
                  ...group,
                  attributes: group.attributes
                    .filter(attr => {
                      // Sadece checkbox olmayan özellikleri göster
                      const value = values[attr.key];
                      return value !== undefined && 
                             value !== null && 
                             value !== '' && 
                             !(value === 'true' || value === 'false') && // String true/false değil
                             !(typeof value === 'boolean'); // Boolean değil
                    })
                    .map(attr => ({
                      ...attr,
                      data_type: attr.data_type as 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'ENUM' | 'MULTISELECT'
                    }))
              })).filter(group => group.attributes.length > 0)}
              values={values}
            />
          </Box>

          {/* Features/Checkbox Properties */}
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Özellikler
            </Typography>
            
            {(() => {
              // Checkbox değerlerini filtrele - base.features objesi ve true/false string değerleri
              console.log('🔍 Filtering checkboxes from:', { 
                baseFeatures: base.features, 
                valuesWithTrueFalse: Object.entries(values).filter(([k,v]) => v === 'true' || v === 'false' || v === true || v === false)
              });

              const checkboxValues: Array<[string, boolean]> = [];
              const allFeatures: Array<{ key: string; label: string; value: string; isSelected: boolean; category: string }> = [];

              // Helper function to categorize features
              function getCategoryForFeature(key: string): string {
                const safetyFeatures = ['abs', 'esp', 'asr', 'alarm', 'immobilizer', 'retarder', 'havaPastigiSurucu', 'havaPastigiYolcu', 'yanHavaYastigi', 'merkeziKilit', 'ebv', 'adr', 'yokusKalkisDestegi'];
                const comfortFeatures = ['klima', 'elektrikliCam', 'elektrikliAynalar', 'radioTeyp', 'cdCalar', 'tvNavigasyon', 'hizSabitleyici', 'hidrolikDireksiyon', 'isitmalıKoltuklar', 'havaliKoltuk', 'masa', 'deriDoseme', 'esnekOkumaLambasi', 'yolBilgisayari', 'startStop'];
                const exteriorFeatures = ['alasimJant', 'sunroof', 'spoyler', 'camRuzgarligi', 'cekiDemiri', 'hafizaliKoltuklar'];
                const sensorFeatures = ['farSensoru', 'yagmurSensoru', 'sisFari', 'xenonFar', 'farYikamaSistemi', 'parkSensoru', 'geriGorusKamerasi'];
                
                const lowerKey = key.toLowerCase();
                
                if (safetyFeatures.some(sf => lowerKey.includes(sf))) return 'Güvenlik';
                if (comfortFeatures.some(cf => lowerKey.includes(cf))) return 'Konfor';
                if (exteriorFeatures.some(ef => lowerKey.includes(ef))) return 'Dış Donanım';
                if (sensorFeatures.some(sf => lowerKey.includes(sf))) return 'Sensör & Aydınlatma';
                
                return 'Diğer';
              }

              // 1. base.features'dan checkbox'ları al (backend'den gelen processed features)
              if (base.features && typeof base.features === 'object') {
                Object.entries(base.features).forEach(([key, value]) => {
                  const label = translateField(key);
                  allFeatures.push({
                    key,
                    label,
                    value: 'Var',
                    isSelected: Boolean(value),
                    category: getCategoryForFeature(key)
                  });
                  checkboxValues.push([key, Boolean(value)]);
                });
              }

              // 2. base.listing_properties'den BOOLEAN type olanları al
              if (base.listing_properties && Array.isArray(base.listing_properties)) {
                base.listing_properties.forEach((prop: any) => {
                  if (prop.type === 'BOOLEAN' || prop.value === 'Var' || prop.value === 'Yok' || prop.value === 'Evet' || prop.value === 'Hayır') {
                    const isSelected = prop.value === 'Var' || prop.value === 'Evet' || prop.value === 'true';
                    const label = translateField(prop.key) || prop.key;
                    
                    // Duplicate kontrolü
                    if (!allFeatures.some(f => f.key === prop.key)) {
                      allFeatures.push({
                        key: prop.key,
                        label,
                        value: prop.value,
                        isSelected,
                        category: getCategoryForFeature(prop.key)
                      });
                      checkboxValues.push([prop.key, isSelected]);
                    }
                  }
                });
              }

              // 2. values'dan true/false string değerleri de checkbox olarak ekle
              Object.entries(values).forEach(([key, value]) => {
                // Sadece true/false string değerli olanları checkbox olarak kabul et
                if ((value === 'true' || value === 'false') && !checkboxValues.some(([k]) => k === key)) {
                  checkboxValues.push([key, value === 'true']);
                }
              });

              console.log('🎯 Final checkbox values:', checkboxValues);
              console.log('🎨 All features with categories:', allFeatures);

              // Kategorize edilmiş features
              const categorizedFeatures = allFeatures.reduce((acc, feature) => {
                if (feature.isSelected) {
                  if (!acc[feature.category]) {
                    acc[feature.category] = [];
                  }
                  acc[feature.category].push(feature.label);
                }
                return acc;
              }, {} as Record<string, string[]>);

              console.log('📊 Categorized features:', categorizedFeatures);

              if (Object.keys(categorizedFeatures).length === 0) {
                return (
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      Bu ilan için özel özellik bilgisi bulunmamaktadır.
                    </Typography>
                  </Paper>
                );
              }

              return (
                <Paper sx={{ p: 3 }}>
                  {Object.entries(categorizedFeatures).map(([category, features]) => (
                    <Box key={category} mb={3}>
                      <Typography 
                        variant="subtitle1" 
                        color="primary" 
                        gutterBottom
                        sx={{ 
                          fontWeight: 600,
                          borderBottom: '2px solid',
                          borderColor: 'primary.main',
                          pb: 0.5,
                          mb: 2
                        }}
                      >
                        {category}
                      </Typography>
                      <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: '1fr 1fr'
                        },
                        gap: 1.5
                      }}>
                        {features.map((feature, index) => (
                          <Stack key={`${category}-${index}`} direction="row" spacing={1} alignItems="center">
                            <CheckIcon color="success" fontSize="small" />
                            <Typography variant="body2" color="text.primary">
                              {feature}
                            </Typography>
                          </Stack>
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Paper>
              );
            })()}
          </Box>
        </Box>

        {/* Right Column - Seller Info */}
        <Box>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Satıcı Bilgileri
            </Typography>
            
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 48, height: 48 }}>
                  {base.seller.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {base.seller.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Bireysel Satıcı
                  </Typography>
                </Box>
              </Stack>

              {base.seller.phone && (
                <Button
                  variant="contained"
                  startIcon={<Phone />}
                  fullWidth
                  href={`tel:${base.seller.phone}`}
                  size="large"
                >
                  Telefon Numarasını Göster
                </Button>
              )}

              {base.seller.email && (
                <Button
                  variant="outlined"
                  startIcon={<Email />}
                  fullWidth
                  href={`mailto:${base.seller.email}`}
                >
                  Mesaj Gönder
                </Button>
              )}
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default SmartTemplate;
