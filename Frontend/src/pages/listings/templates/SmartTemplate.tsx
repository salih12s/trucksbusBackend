import React from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Divider,
  Stack
} from '@mui/material';
import { getCategoryConfig, commonFormatters } from './registry';
import MediaGallery from '../components/MediaGallery';
import { translateField, translateValue } from '../../../utils/fieldTranslations';

type DataType = 'TEXT'|'NUMBER'|'BOOLEAN'|'MULTISELECT'|'CURRENCY';

// Tip normalizasyonları
const toBool = (v: any) => {
  if (typeof v === 'boolean') return v;
  if (v === 1 || v === '1') return true;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return ['true', 'evet', 'yes', 'on', '1'].includes(s);
  }
  return false;
};

const toArray = (v: any): string[] => {
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (v == null) return [];
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (!trimmed) return [];
    try { const parsed = JSON.parse(trimmed); if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String); } catch {}
    return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [String(v)];
};

const formatByType = (dataType: string, value: any, unit?: string) => {
  switch (dataType) {
    case 'NUMBER': {
      const n = Number(value);
      return Number.isNaN(n) ? '' : new Intl.NumberFormat('tr-TR').format(n) + (unit ? ` ${unit}` : '');
    }
    case 'BOOLEAN': return toBool(value) ? 'Evet' : 'Hayır';
    case 'CURRENCY': {
      const n = Number(value);
      return Number.isNaN(n)
        ? ''
        : new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(n);
    }
    case 'MULTISELECT': {
      const arr = toArray(value);
      return arr.length ? arr.map(val => translateValue(val)).join(', ') : '';
    }
    default: return translateValue(value ?? '');
  }
};

const isFilled = (dataType: string | undefined, v: any): boolean => {
  if (v === null || v === undefined) return false;
  if (dataType === 'MULTISELECT') return toArray(v).length > 0;
  if (dataType === 'BOOLEAN') return true; // bool her zaman gösterilebilir
  if (dataType === 'NUMBER' || dataType === 'CURRENCY') return String(v).trim() !== '' && !Number.isNaN(Number(v));
  if (typeof v === 'string') return v.trim() !== '';
  return true;
};

interface SmartTemplateProps {
  base: {
    id: string;
    title: string;
    description?: string;
    price?: number;
    status?: string;
    isApproved?: boolean;
    category: { name: string; slug: string };
    vehicle_type?: { name: string; slug: string };
    brand?: { name: string };
    model?: { name: string };
    variant?: { name: string };
    year?: number;
    km?: number;
    locationText?: string;
    seller: { name: string; phone?: string; email?: string };
    media: Array<{ url: string; width?: number; height?: number; alt?: string; sort?: number; }>;
    createdAt: string;
    views?: number;
    features?: Record<string, string | boolean>; // Backend'den gelen işlenmiş features
  };
  schema: {
    groups: Array<{
      key: string;
      label: string;
      order: number;
      attributes: Array<{
        key: string;
        label: string;
        data_type: DataType | string;
        input_type?: string;
        unit?: string;
        icon?: string;
        order: number;
        is_required?: boolean;
      }>;
    }>;
    flat: Array<{
      key: string;
      label: string;
      data_type: DataType | string;
      input_type?: string;
      unit?: string;
      icon?: string;
      order: number;
      is_required?: boolean;
    }>;
  };
  values: Record<string, any>;
}

const SmartTemplate: React.FC<SmartTemplateProps> = ({ base, schema, values }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // ✅ Aliases (geri uyum)
  const KEY_ALIASES: Record<string, string> = {
    uzunluk: 'length',
    genislik: 'width',
    lastikDurumu: 'tireCondition',
    sogutucu: 'coolingUnit',
    takasli: 'exchangeable',
    exchange: 'exchangeable',
    fuelType: 'fuel_type',
    yakit: 'fuel_type',
    vites: 'transmission'
  };

  const valuesWithAliases = React.useMemo(() => {
    const out: Record<string, any> = { ...values };
    Object.entries(KEY_ALIASES).forEach(([alias, canonical]) => {
      if (out[alias] != null && out[canonical] == null) out[canonical] = out[alias];
    });
    return out;
  }, [values]);

  // ✅ Kategori config
  const config = getCategoryConfig(base.category.slug, base.vehicle_type?.slug);

  // ✅ schema.groups + schema.flat → tek map
  const flatAttrsMap = React.useMemo(() => {
    const g = (schema?.groups ?? []).flatMap((gr) => gr.attributes ?? []);
    const f = schema?.flat ?? [];
    const all = [...g, ...f];
    const map: Record<string, any> = {};
    all.forEach((attr) => { if (!map[attr.key]) map[attr.key] = attr; });
    return map;
  }, [schema]);

  // ✅ Öncelikli alanlar
  const priorityData = (config.priorityFields || [])
    .map((key) => flatAttrsMap[key])
    .filter(Boolean)
    .map((attr: any) => ({ ...attr, value: valuesWithAliases[attr.key] }))
    .filter((attr: any) => isFilled(String(attr.data_type), attr.value));

  // ✅ Config grupları
  const organizedGroups = Object.entries(config.fieldGroups || {})
    .map(([groupKey, groupCfg]: any) => {
      const fields = (groupCfg.fields || [])
        .map((key: string) => flatAttrsMap[key])
        .filter(Boolean)
        .map((attr: any) => ({ ...attr, value: valuesWithAliases[attr.key] }))
        .filter((attr: any) => isFilled(String(attr.data_type), attr.value));
      return fields.length ? { ...groupCfg, key: groupKey, fields } : null;
    })
    .filter(Boolean)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  // ✅ Kalan tüm alanlar
  const placedKeys = new Set<string>([
    ...priorityData.map((a: any) => a.key),
    ...organizedGroups.flatMap((g: any) => g.fields.map((a: any) => a.key)),
  ]);
  const leftover = Object.values(flatAttrsMap)
    .filter((attr: any) => !placedKeys.has(attr.key))
    .map((attr: any) => ({ ...attr, value: valuesWithAliases[attr.key] }))
    .filter((attr: any) => isFilled(String(attr.data_type), attr.value))
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  const formatFieldValue = (field: any, value: any) => {
    const custom = (config as any).fieldFormatters?.[field.key];
    if (typeof custom === 'function') return custom(value);
    return formatByType(String(field.data_type), value, field.unit);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      {/* Hero Section */}
      <Card sx={{ mb: 4, borderRadius: 3, overflow: 'hidden', background: `linear-gradient(135deg, ${config.heroColor}15 0%, ${config.heroColor}08 100%)`, boxShadow: 2 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack direction="row" spacing={2} alignItems="flex-start" mb={2}>
            {(() => { const Icon = config.icon as any; return <Icon sx={{ color: config.heroColor, fontSize: 40, flexShrink: 0 }} />; })()}
            <Box flex={1} minWidth={0}>
              <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' }, wordBreak: 'break-word' }}>
                {base.title}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                {config.badge && (
                  <Chip label={config.badge} sx={{ bgcolor: config.heroColor, color: 'white', fontWeight: 'bold' }} />
                )}
                {base.brand && <Chip label={base.brand.name} variant="outlined" />}
                {base.year && <Chip label={base.year} variant="outlined" />}
                {base.locationText && <Chip label={base.locationText} variant="outlined" />}
              </Stack>

              {/* Priority Fields */}
              {priorityData.length > 0 && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2, mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: `1px solid ${config.heroColor}20` }}>
                  {priorityData.map((field: any) => (
                    <Box key={field.key} textAlign="center">
                      <Typography variant="body2" color="text.secondary">{translateField(field.key) || field.label}</Typography>
                      <Typography variant="h6" fontWeight="bold" color={config.heroColor}>
                        {formatFieldValue(field, field.value)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Fiyat */}
            {typeof base.price === 'number' && !Number.isNaN(base.price) && (
              <Box textAlign="right" sx={{ alignSelf: 'flex-start' }}>
                <Typography variant="h4" fontWeight="bold" color={config.heroColor} sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {commonFormatters.currency(base.price)}
                </Typography>
                <Typography variant="body2" color="text.secondary">Satış Fiyatı</Typography>
                {!base.isApproved && (
                  <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                    ⏳ Onay Bekliyor
                  </Typography>
                )}
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: { xs: 3, sm: 4 }, alignItems: 'start' }}>
        {/* Sol */}
        <Box sx={{ minWidth: 0 }}>
          {/* Media */}
          {Array.isArray(base.media) && base.media.length > 0 ? (
            <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 2 }}>
              <MediaGallery items={base.media} aspectRatio={isMobile ? '1/1' : '4/3'} />
            </Card>
          ) : (
            <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 2 }}>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'grey.500', bgcolor: 'grey.50' }}>
                <Typography variant="h6">Görsel Bulunamadı</Typography>
              </Box>
            </Card>
          )}

          {/* Açıklama */}
          {base.description && (
            <Card sx={{ mb: 4, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Açıklama</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{base.description}</Typography>
              </CardContent>
            </Card>
          )}

          {/* Config Grupları */}
          {organizedGroups.map((group: any) => (
            <Card key={group.key} sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  {group.icon && (() => { const GIcon = group.icon as any; return <GIcon sx={{ color: config.heroColor }} />; })()}
                  <Typography variant="h6" color={config.heroColor}>{group.label}</Typography>
                </Stack>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  {group.fields.map((field: any) => (
                    <Box key={field.key}>
                      <Typography variant="body2" color="text.secondary">{translateField(field.key) || field.label}</Typography>
                      <Typography variant="body1" fontWeight="medium">{formatFieldValue(field, field.value)}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}

          {/* Özellikler (Features) */}
          {base.features && Object.keys(base.features).length > 0 && (
            <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
              <CardContent sx={{ p: 0 }}>
                {/* Header */}
                <Box sx={{ 
                  p: 3, 
                  background: `linear-gradient(135deg, ${config.heroColor}20 0%, ${config.heroColor}10 100%)`,
                  borderBottom: `1px solid ${config.heroColor}15`
                }}>
                  <Typography variant="h6" color={config.heroColor} sx={{ 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    ✨ Özellikler
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Bu aracın sahip olduğu özellikler
                  </Typography>
                </Box>

                {/* Features Grid */}
                <Box sx={{ p: 3 }}>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
                    gap: 2 
                  }}>
                    {Object.entries(base.features).map(([key, value]) => {
                      // Değer kontrolü - sadece true olan checkbox'ları göster
                      const isValidFeature = value === true || value === 'true' || (typeof value === 'string' && value !== 'false' && value.trim() !== '');
                      if (!isValidFeature) return null;
                      
                      // Icon belirleme
                      const getFeatureIcon = (featureKey: string) => {
                        const iconMap: { [key: string]: string } = {
                          // Güvenlik
                          'abs': '🛡️',
                          'airbag': '🎈',
                          'esp': '🛡️',
                          'immobilizer': '🔒',
                          'centralLocking': '🔐',
                          
                          // Konfor
                          'airConditioning': '❄️',
                          'heater': '🔥',
                          'sunroof': '☀️',
                          'electricWindows': '⚡',
                          'electricMirrors': '🪞',
                          'cruiseControl': '🎯',
                          'bluetooth': '📶',
                          
                          // Ses Sistemi
                          'radio': '📻',
                          'cdPlayer': '💿',
                          'radioTape': '📼',
                          'gps': '🗺️',
                          'tvNavigation': '📺',
                          
                          // Dış Görünüm
                          'fogLights': '💡',
                          'xenonLights': '💎',
                          'ledLights': '✨',
                          'alloyWheels': '⚙️',
                          
                          // Diğer
                          'parkingSensor': '📍',
                          'reverseCamera': '📹',
                          'startStop': '🔄',
                          'keylessEntry': '🗝️'
                        };
                        return iconMap[featureKey] || '🔧';
                      };

                      const translatedKey = translateField(key) || key;
                      const displayValue = (value === true || value === 'true') ? 'Var' : String(value);

                      return (
                        <Box 
                          key={key} 
                          sx={{
                            p: 2,
                            border: `1px solid ${config.heroColor}20`,
                            borderRadius: 2,
                            backgroundColor: 'background.paper',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 4px 12px ${config.heroColor}25`,
                              borderColor: `${config.heroColor}40`
                            }
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="center">
                            {/* Icon */}
                            <Box sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              backgroundColor: `${config.heroColor}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '18px'
                            }}>
                              {getFeatureIcon(key)}
                            </Box>
                            
                            {/* Text */}
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography 
                                variant="body2" 
                                fontWeight="medium" 
                                color="text.primary"
                                sx={{ 
                                  fontSize: '14px',
                                  lineHeight: 1.2,
                                  wordBreak: 'break-word'
                                }}
                              >
                                {translatedKey}
                              </Typography>
                              {displayValue !== 'Var' && (
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary"
                                  sx={{ fontSize: '12px' }}
                                >
                                  {displayValue}
                                </Typography>
                              )}
                            </Box>

                            {/* Checkmark */}
                            <Box sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              backgroundColor: config.heroColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '12px'
                            }}>
                              ✓
                            </Box>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Feature sayısı */}
                  <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${config.heroColor}15` }}>
                    <Typography variant="caption" color="text.secondary" sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: 1 
                    }}>
                      📋 Toplam {Object.entries(base.features).filter(([, value]) => {
                        return value === true || value === 'true' || (typeof value === 'string' && value !== 'false' && value.trim() !== '');
                      }).length} özellik
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Kalan Tüm Özellikler */}
          {leftover.length > 0 && (
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" color={config.heroColor} sx={{ mb: 2 }}>Diğer Özellikler</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  {leftover.map((field: any) => (
                    <Box key={field.key}>
                      <Typography variant="body2" color="text.secondary">{translateField(field.key) || field.label}</Typography>
                      <Typography variant="body1" fontWeight="medium">{formatFieldValue(field, field.value)}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Sağ – Satıcı & Meta */}
        <Box sx={{ minWidth: 0 }}>
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2, position: isMobile ? 'static' : 'sticky', top: isMobile ? 'auto' : 24 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Satıcı Bilgileri</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" fontWeight="medium" mb={1} sx={{ wordBreak: 'break-word' }}>{base.seller.name}</Typography>
              {base.seller.phone && (<Typography variant="body2" color="text.secondary" mb={1} sx={{ wordBreak: 'break-all' }}>📞 {base.seller.phone}</Typography>)}
              {base.seller.email && (<Typography variant="body2" color="text.secondary" mb={2} sx={{ wordBreak: 'break-all' }}>✉️ {base.seller.email}</Typography>)}

              <Stack spacing={1}>
                <button style={{ width: '100%', padding: '12px', backgroundColor: config.heroColor, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Ara</button>
                <button style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', color: config.heroColor, border: `2px solid ${config.heroColor}`, borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Mesaj Gönder</button>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>İlan Bilgileri</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">İlan Tarihi</Typography>
                  <Typography variant="body1">{new Date(base.createdAt).toLocaleDateString('tr-TR')}</Typography>
                </Box>
                {typeof base.views === 'number' && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Görüntülenme</Typography>
                    <Typography variant="body1">{base.views.toLocaleString('tr-TR')}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="body2" color="text.secondary">Kategori</Typography>
                  <Typography variant="body1">{base.category.name}</Typography>
                </Box>
                {base.vehicle_type && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Araç Türü</Typography>
                    <Typography variant="body1">{base.vehicle_type.name}</Typography>
                  </Box>
                )}
                {base.brand && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Marka</Typography>
                    <Typography variant="body1">{base.brand.name}</Typography>
                  </Box>
                )}
                {base.locationText && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Konum</Typography>
                    <Typography variant="body1">{base.locationText}</Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default SmartTemplate;