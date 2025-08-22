import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Paper,
  Chip,
  Stack,
  Avatar,
  IconButton,
  ImageList,
  ImageListItem,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Badge,
  CircularProgress,
} from '@mui/material';
import {
  Close,
  Person,
  Email,
  Phone,
  Business,
  LocationOn,
  Category,
  DirectionsCar,
  DateRange,
  CheckCircle,
  Cancel,
  Warning,
  Info,
  Image as ImageIcon,
} from '@mui/icons-material';
import { formatTRY, formatDateTR } from '../../utils/format';
import { AdminListing, useAdminListingDetail } from '../../hooks/admin/useAdminListings';
import { translatePropertyName, translatePropertyValue } from '../../utils/propertyTranslation';

interface AdminListingDetailModalProps {
  open: boolean;
  onClose: () => void;
  listingId: string | null;
  onApprove?: (id: string) => void;
  onReject?: (listing: AdminListing) => void;
}

const AdminListingDetailModal: React.FC<AdminListingDetailModalProps> = ({
  open,
  onClose,
  listingId,
  onApprove,
  onReject,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Dinamik olarak ilan detayını çek
  const { data: listing, isLoading, error } = useAdminListingDetail(
    listingId || '', 
    { enabled: open && !!listingId }
  );

  // Debug için console.log
  useEffect(() => {
    if (open && listingId) {
      console.log('🔍 Modal açıldı, ilan ID:', listingId);
    }
    if (listing) {
      console.log('✅ İlan detayları yüklendi:', listing);
      console.log('📝 Açıklama:', listing.description);
      console.log('🏷️ Özellikler (listing_properties):', listing.listing_properties);
      console.log('🎯 Features:', listing.features);
      console.log('🎯 Features type:', typeof listing.features);
      console.log('🖼️ Görseller RAW:', listing.listing_images);
      console.log('🖼️ Görseller length:', listing.listing_images?.length);
      console.log('🖼️ Görseller type:', typeof listing.listing_images);
      console.log('🖼️ Görseller JSON:', JSON.stringify(listing.listing_images, null, 2));
      console.log('🖼️ First image:', listing.listing_images?.[0]);
      
      // Eğer görseller string ise parse dene
      if (typeof listing.listing_images === 'string') {
        try {
          const parsed = JSON.parse(listing.listing_images);
          console.log('✅ Parsed images from string:', parsed);
        } catch (error) {
          console.error('❌ Failed to parse images string:', error);
        }
      }
    }
    if (error) {
      console.error('❌ İlan detayları yüklenirken hata:', error);
    }
  }, [open, listingId, listing, error]);

  // Loading durumu
  if (open && isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            İlan detayları yükleniyor...
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  // Error durumu
  if (open && error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Hata</DialogTitle>
        <DialogContent>
          <Alert severity="error">
            İlan detayları yüklenirken bir hata oluştu: {error.message}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Kapat</Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (!listing) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PENDING': return 'warning';
      case 'INACTIVE': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle />;
      case 'PENDING': return <Warning />;
      case 'INACTIVE': return <Cancel />;
      default: return <Info />;
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh', maxHeight: '90vh' }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h5" component="div" gutterBottom>
                Admin İlan İncelemesi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                İlan ID: #{listing.id} • Kategori: {listing.categories?.name} • 
                Kullanıcı: {listing.users?.first_name} {listing.users?.last_name}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip 
                icon={getStatusIcon(listing.status)}
                label={listing.status}
                color={getStatusColor(listing.status)}
                variant="filled"
              />
              <IconButton onClick={onClose} size="small">
                <Close />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', gap: 2, p: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Sol Taraf - Temel Bilgiler */}
            <Box sx={{ flex: 2 }}>
              {/* İlan Başlığı ve Fiyat */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {listing.title}
                  </Typography>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {formatTRY(listing.price)}
                  </Typography>
                </Stack>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Kategori ve Marka Bilgileri */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Category fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">Kategori:</Typography>
                    </Stack>
                    <Typography variant="body1">{listing.categories?.name || 'Belirtilmemiş'}</Typography>
                  </Box>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <DirectionsCar fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">Marka/Model:</Typography>
                    </Stack>
                    <Typography variant="body1">
                      {listing.brands?.name || 'Belirtilmemiş'} {listing.models?.name || ''}
                    </Typography>
                  </Box>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">Lokasyon:</Typography>
                    </Stack>
                    <Typography variant="body1">
                      {listing.cities?.name || 'Belirtilmemiş'}{listing.districts?.name ? `, ${listing.districts.name}` : ''}
                    </Typography>
                  </Box>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <DateRange fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">Oluşturma Tarihi:</Typography>
                    </Stack>
                    <Typography variant="body1">{formatDateTR(listing.created_at)}</Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Araç Teknik Bilgileri */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Araç Teknik Bilgileri
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                  {listing.year && (
                    <Box>
                      <Typography variant="body2" color="textSecondary">Yıl:</Typography>
                      <Typography variant="body1" fontWeight="medium">{listing.year}</Typography>
                    </Box>
                  )}
                  {listing.km && (
                    <Box>
                      <Typography variant="body2" color="textSecondary">KM:</Typography>
                      <Typography variant="body1" fontWeight="medium">{listing.km.toLocaleString()}</Typography>
                    </Box>
                  )}
                  {listing.fuel_type && (
                    <Box>
                      <Typography variant="body2" color="textSecondary">Yakıt Tipi:</Typography>
                      <Typography variant="body1" fontWeight="medium">{translatePropertyValue(listing.fuel_type)}</Typography>
                    </Box>
                  )}
                  {listing.transmission && (
                    <Box>
                      <Typography variant="body2" color="textSecondary">Vites:</Typography>
                      <Typography variant="body1" fontWeight="medium">{translatePropertyValue(listing.transmission)}</Typography>
                    </Box>
                  )}
                  {listing.engine_power && (
                    <Box>
                      <Typography variant="body2" color="textSecondary">Motor Gücü:</Typography>
                      <Typography variant="body1" fontWeight="medium">{listing.engine_power}</Typography>
                    </Box>
                  )}
                  {listing.engine_volume && (
                    <Box>
                      <Typography variant="body2" color="textSecondary">Motor Hacmi:</Typography>
                      <Typography variant="body1" fontWeight="medium">{listing.engine_volume}</Typography>
                    </Box>
                  )}
                  {listing.color && (
                    <Box>
                      <Typography variant="body2" color="textSecondary">Renk:</Typography>
                      <Typography variant="body1" fontWeight="medium">{translatePropertyValue(listing.color)}</Typography>
                    </Box>
                  )}
                  {listing.vehicle_condition && (
                    <Box>
                      <Typography variant="body2" color="textSecondary">Araç Durumu:</Typography>
                      <Typography variant="body1" fontWeight="medium">{translatePropertyValue(listing.vehicle_condition)}</Typography>
                    </Box>
                  )}
                  {listing.plate_origin && (
                    <Box>
                      <Typography variant="body2" color="textSecondary">Plaka/Uyruk:</Typography>
                      <Typography variant="body1" fontWeight="medium">{listing.plate_origin}</Typography>
                    </Box>
                  )}
                </Box>

                {/* Kamyon Özel Alanları */}
                {(listing.body_type || listing.carrying_capacity || listing.cabin_type || listing.tire_condition || listing.drive_type) && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      Kamyon Özel Bilgileri
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                      {listing.body_type && (
                        <Box>
                          <Typography variant="body2" color="textSecondary">Üst Yapı:</Typography>
                          <Typography variant="body1" fontWeight="medium">{translatePropertyValue(listing.body_type)}</Typography>
                        </Box>
                      )}
                      {listing.carrying_capacity && (
                        <Box>
                          <Typography variant="body2" color="textSecondary">Taşıma Kapasitesi:</Typography>
                          <Typography variant="body1" fontWeight="medium">{translatePropertyValue(listing.carrying_capacity)}</Typography>
                        </Box>
                      )}
                      {listing.cabin_type && (
                        <Box>
                          <Typography variant="body2" color="textSecondary">Kabin Türü:</Typography>
                          <Typography variant="body1" fontWeight="medium">{translatePropertyValue(listing.cabin_type)}</Typography>
                        </Box>
                      )}
                      {listing.tire_condition && (
                        <Box>
                          <Typography variant="body2" color="textSecondary">Lastik Durumu:</Typography>
                          <Typography variant="body1" fontWeight="medium">{listing.tire_condition}%</Typography>
                        </Box>
                      )}
                      {listing.drive_type && (
                        <Box>
                          <Typography variant="body2" color="textSecondary">Çekiş Türü:</Typography>
                          <Typography variant="body1" fontWeight="medium">{translatePropertyValue(listing.drive_type)}</Typography>
                        </Box>
                      )}
                      {listing.damage_record && (
                        <Box>
                          <Typography variant="body2" color="textSecondary">Hasar Kaydı:</Typography>
                          <Typography variant="body1" fontWeight="medium">{translatePropertyValue(listing.damage_record)}</Typography>
                        </Box>
                      )}
                      {listing.paint_change && (
                        <Box>
                          <Typography variant="body2" color="textSecondary">Boya Değişimi:</Typography>
                          <Typography variant="body1" fontWeight="medium">{translatePropertyValue(listing.paint_change)}</Typography>
                        </Box>
                      )}
                      {listing.tramer_record && (
                        <Box>
                          <Typography variant="body2" color="textSecondary">Tramer Kaydı:</Typography>
                          <Typography variant="body1" fontWeight="medium">{translatePropertyValue(listing.tramer_record)}</Typography>
                        </Box>
                      )}
                    </Box>
                  </>
                )}

                {/* Takas ve Diğer Bilgiler */}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Chip 
                    label={listing.is_exchangeable ? 'Takas Kabul Ediyor' : 'Takas Kabul Etmiyor'} 
                    color={listing.is_exchangeable ? 'success' : 'default'}
                    variant="outlined"
                  />
                  {listing.variants?.name && (
                    <Chip 
                      label={`Varyant: ${translatePropertyValue(listing.variants.name)}`} 
                      color="info"
                      variant="outlined"
                    />
                  )}
                  {listing.vehicle_types?.name && (
                    <Chip 
                      label={`Tip: ${translatePropertyValue(listing.vehicle_types.name)}`} 
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Paper>

              

              {/* İlan Açıklaması */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  İlan Açıklaması
                </Typography>
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 1, 
                    border: '1px solid',
                    borderColor: 'grey.200',
                    maxHeight: 200,
                    overflow: 'auto'
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      lineHeight: 1.6
                    }}
                  >
                    {listing.description || 'Açıklama bulunmuyor...'}
                  </Typography>
                </Box>
              </Paper>

              {/* İlan Özellikleri */}
              {listing.listing_properties && listing.listing_properties.length > 0 && (
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    İlan Özellikleri ({listing.listing_properties.length} adet)
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            Özellik Adı
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            Değer
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {listing.listing_properties.map((property, index) => (
                          <TableRow key={property.id || index} hover>
                            <TableCell sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                              {translatePropertyName(property.property_name)}
                            </TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>
                              <Typography variant="body2">
                                {(() => {
                                  // Eğer değer obje ise string'e çevir
                                  if (typeof property.property_value === 'object' && property.property_value !== null) {
                                    try {
                                      return JSON.stringify(property.property_value, null, 2);
                                    } catch {
                                      return '[Obje verisi]';
                                    }
                                  }
                                  return translatePropertyValue(property.property_value) || '-';
                                })()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}

              {/* Eğer özellik yoksa bilgilendirme */}
              {(!listing.listing_properties || listing.listing_properties.length === 0) && (
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    İlan Özellikleri
                  </Typography>
                  <Alert severity="info">
                    Bu ilan için özel özellik bilgisi bulunmuyor.
                  </Alert>
                </Paper>
              )}

              {/* İletişim ve İlan Sahibi Bilgileri */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  İletişim ve İlan Sahibi Bilgileri
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">İlan Sahibi:</Typography>
                    </Stack>
                    <Typography variant="body1" fontWeight="medium">
                      {listing.users?.first_name} {listing.users?.last_name}
                    </Typography>
                  </Box>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">E-posta:</Typography>
                    </Stack>
                    <Typography variant="body1">{listing.users?.email || 'Belirtilmemiş'}</Typography>
                  </Box>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">Telefon:</Typography>
                    </Stack>
                    <Typography variant="body1" fontWeight="medium">
                      {listing.users?.phone || 'Belirtilmemiş'}
                    </Typography>
                  </Box>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Business fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">Kullanıcı Türü:</Typography>
                    </Stack>
                    <Chip 
                      label={'Bireysel'} 
                      color={'default'}
                      size="small"
                    />
                  </Box>
                </Box>
              </Paper>

              {/* Red Sebebi */}
              {listing.reject_reason && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Red Sebebi:</strong> {listing.reject_reason}
                  </Typography>
                </Alert>
              )}

              {/* İlan Görselleri */}
              <Paper sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <ImageIcon color="primary" />
                  <Typography variant="h6">
                    İlan Görselleri
                  </Typography>
                  <Chip 
                    label={`${listing.listing_images?.length || 0} görsel`}
                    size="small"
                    color={listing.listing_images?.length ? 'success' : 'default'}
                  />
                </Stack>
                
                {listing.listing_images && listing.listing_images.length > 0 ? (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Görsellere tıklayarak büyük boyutta görüntüleyebilirsiniz
                    </Typography>
                    <ImageList cols={4} gap={12} sx={{ mb: 0 }}>
                      {listing.listing_images
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((image, index) => (
                        <ImageListItem key={image.id || index} sx={{ position: 'relative' }}>
                          <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 1 }}>
                            <img
                              src={image.image_url}
                              alt={`İlan görseli ${index + 1}`}
                              loading="lazy"
                              style={{
                                cursor: 'pointer',
                                objectFit: 'cover',
                                height: 140,
                                width: '100%',
                                transition: 'transform 0.2s ease-in-out',
                              }}
                              onClick={() => setSelectedImage(image.image_url)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            />
                            <Badge 
                              badgeContent={image.order || index + 1} 
                              color="primary"
                              sx={{ 
                                position: 'absolute', 
                                top: 8, 
                                right: 8,
                                '& .MuiBadge-badge': {
                                  backgroundColor: 'rgba(0,0,0,0.7)',
                                  color: 'white',
                                  fontSize: '0.7rem'
                                }
                              }}
                            />
                          </Box>
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </>
                ) : (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      ⚠️ Bu ilan için görsel bulunmuyor! Bu durum kullanıcı deneyimini olumsuz etkileyebilir.
                    </Typography>
                  </Alert>
                )}
              </Paper>
            </Box>

            {/* Sağ Taraf - Kullanıcı ve Durum Bilgileri */}
            <Box sx={{ flex: 1 }}>
              {/* Kullanıcı Bilgileri */}
              <Paper sx={{ p: 0, mb: 2 }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      <Typography variant="h6">
                        {listing.users?.first_name?.charAt(0) || 'U'}
                      </Typography>
                    </Avatar>
                  }
                  title={
                    <Typography variant="h6" component="div">
                      İlan Sahibi
                    </Typography>
                  }
                  subheader={
                    <Typography variant="body2" color="text.secondary">
                      Kullanıcı ID: #{listing.users?.id}
                    </Typography>
                  }
                  action={
                    <Chip 
                      label="Aktif Kullanıcı" 
                      size="small" 
                      color="success"
                      sx={{ mt: 1 }}
                    />
                  }
                />
                <CardContent sx={{ pt: 0 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Person fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Ad Soyad:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {listing.users?.first_name} {listing.users?.last_name}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Email fontSize="small" color="action" />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          E-posta:
                        </Typography>
                        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                          {listing.users?.email}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    {listing.users?.phone ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Phone fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Telefon:
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {listing.users.phone}
                          </Typography>
                        </Box>
                      </Stack>
                    ) : (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          ⚠️ Telefon numarası belirtilmemiş
                        </Typography>
                      </Alert>
                    )}
                  </Stack>
                </CardContent>
              </Paper>

              {/* İlan Durumu */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  İlan Durumu
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Durum:</Typography>
                    <Chip 
                      icon={getStatusIcon(listing.status)}
                      label={listing.status}
                      color={getStatusColor(listing.status)}
                      size="small"
                    />
                  </Stack>
                  
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Onaylandı:</Typography>
                    <Chip 
                      icon={listing.is_approved ? <CheckCircle /> : <Cancel />}
                      label={listing.is_approved ? 'Evet' : 'Hayır'}
                      color={listing.is_approved ? 'success' : 'error'}
                      size="small"
                    />
                  </Stack>
                  
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Beklemede:</Typography>
                    <Chip 
                      icon={listing.is_pending ? <Warning /> : <CheckCircle />}
                      label={listing.is_pending ? 'Evet' : 'Hayır'}
                      color={listing.is_pending ? 'warning' : 'success'}
                      size="small"
                    />
                  </Stack>
                  
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Aktif:</Typography>
                    <Chip 
                      icon={listing.is_active ? <CheckCircle /> : <Cancel />}
                      label={listing.is_active ? 'Evet' : 'Hayır'}
                      color={listing.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </Stack>
                </Stack>
              </Paper>

              {/* Tarih Bilgileri */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Tarih Bilgileri
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Oluşturulma:
                    </Typography>
                    <Typography variant="body2">
                      {formatDateTR(listing.created_at)}
                    </Typography>
                  </Box>
                  
                  {listing.updated_at !== listing.created_at && (
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Son Güncelleme:
                      </Typography>
                      <Typography variant="body2">
                        {formatDateTR(listing.updated_at)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} variant="outlined">
            Kapat
          </Button>
          
          {listing.status === 'PENDING' && onApprove && (
            <Button 
              onClick={() => onApprove(listing.id)} 
              variant="contained" 
              color="success"
              startIcon={<CheckCircle />}
            >
              Onayla
            </Button>
          )}
          
          {listing.status === 'PENDING' && onReject && (
            <Button 
              onClick={() => onReject(listing)} 
              variant="contained" 
              color="error"
              startIcon={<Cancel />}
            >
              Reddet
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Görsel Büyütme Modal'ı */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">İlan Görseli</Typography>
            <IconButton onClick={() => setSelectedImage(null)} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={selectedImage}
                alt="Büyütülmüş ilan görseli"
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminListingDetailModal;
