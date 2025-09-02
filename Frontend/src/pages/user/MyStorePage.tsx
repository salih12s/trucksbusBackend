import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Avatar,
  Typography,
  Tabs,
  Tab,
  Button,
  Paper,
  Chip,
  Divider,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  Message as MessageIcon,
  Inventory as InventoryIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Launch as LaunchIcon,
  Circle as CircleIcon,
  Edit as EditIcon,
  DirectionsBus as DirectionsBusIcon,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { storeService, StoreStats, StoreMessage, StoreListing } from '../../services/storeService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`store-tabpanel-${index}`}
      aria-labelledby={`store-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Section component
const Section: React.FC<{ title: string; action?: React.ReactNode; description?: string; children?: React.ReactNode }>
  = ({ title, action, description, children }) => (
  <Card sx={{ overflow: 'hidden' }}>
    <CardHeader
      title={title}
      subheader={description}
      action={action}
      sx={{
        '& .MuiCardHeader-title': { fontWeight: 600 },
        '& .MuiCardHeader-subheader': { color: 'text.secondary' },
      }}
    />
    <CardContent>{children}</CardContent>
  </Card>
);

// Stat Card component
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; gradient?: string }>
  = ({ icon, label, value, gradient }) => (
  <Card sx={{
    color: 'common.white',
    background: gradient || 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    boxShadow: '0 8px 32px 0 rgba(0,0,0,0.12)',
    borderRadius: 5,
    height: '100%',
    minHeight: 90,
    border: 'none',
  }}>
    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600, display: 'block', mb: 1 }}>{label}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>{value}</Typography>
        </Box>
        <Avatar sx={{ bgcolor: alpha('#FFF', 0.2), width: 40, height: 40, ml: 1 }}>
          <Box sx={{ fontSize: 20 }}>{icon}</Box>
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

// Empty State component
const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }>
  = ({ icon, title, description, action }) => (
  <Box sx={{ textAlign: 'center', py: 8 }}>
    <Box sx={{ fontSize: 0, mb: 2 }}>{icon}</Box>
    <Typography variant="h6" gutterBottom>{title}</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{description}</Typography>
    {action}
  </Box>
);

// Pill component
const Pill: React.FC<{ color: 'success' | 'warning' | 'error' | 'default'; label: string }>
  = ({ color, label }) => (
  <Chip
    size="small"
    label={label}
    icon={<CircleIcon sx={{ fontSize: 10 }} />}
    color={color === 'default' ? undefined : color}
    variant={color === 'default' ? 'outlined' : 'filled'}
  />
);

// Main Page Component
const MyStorePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<StoreStats>({
    totalListings: 0,
    totalViews: 0,
    messages: 0
  });
  const [recentMessages, setRecentMessages] = useState<StoreMessage[]>([]);
  const [userListings, setUserListings] = useState<StoreListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  // Auth control
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (!user?.is_corporate) return <Navigate to="/" replace />;

  const companyName = user?.company_name || 'Mağazam';
  const email = user?.email || 'info@company.com';
  const phone = user?.phone || '+90 5xx xxx xx xx';

  // API verilerini yükle
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🏪 Mağaza verilerini yüklüyor...', { user: user?.email });
        
                // Paralel olarak tüm verileri çek
        const [statsData, messagesData, listingsData] = await Promise.all([
          storeService.getStats().catch(err => {
            console.warn('Stats API hatası:', err);
            return { totalListings: 0, totalViews: 0, messages: 0 };
          }),
          storeService.getMessages(10).catch(err => {
            console.warn('Messages API hatası:', err);
            return [];
          }),
          storeService.getListings(1, 10).catch(err => {
            console.warn('Listings API hatası:', err);
            return { listings: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
          })
        ]);

        console.log('📊 İstatistikler yüklendi:', statsData);
        console.log('💬 Mesajlar yüklendi:', messagesData);
        console.log('📝 İlanlar yüklendi:', listingsData);

        setStats(statsData);
        setRecentMessages(messagesData);
        setUserListings(listingsData.listings);
        setRecentMessages(messagesData);
      } catch (error) {
        console.error('Store data loading error:', error);
        setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        
        // Fallback data
        setStats({ totalListings: 0, totalViews: 0, messages: 0 });
        setRecentMessages([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.is_corporate) {
      fetchStoreData();
    }
  }, [user]);

  const kpiColors = useMemo(() => ([
    'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    'linear-gradient(135deg, #71717a 0%, #52525b 100%)',
    'linear-gradient(135deg, #78716c 0%, #57534e 100%)',
  ]), []);

  const handleTabChange = (_e: React.SyntheticEvent, value: number) => setTabValue(value);

  return (
    <Container maxWidth={false} sx={{ py: 4, px: 3 }}>
      {/* HERO / STORE HEADER */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          overflow: 'hidden',
          background: `linear-gradient(120deg, ${alpha(theme.palette.grey[100], 0.5)} 0%, ${alpha(theme.palette.grey[200], 0.3)} 100%)`,
          position: 'relative',
        }}
      >
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Avatar sx={{ width: 88, height: 88, bgcolor: theme.palette.primary.main, fontSize: 36, fontWeight: 800 }}>
              {companyName?.[0]?.toUpperCase() || 'M'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{companyName}</Typography>
                <Chip icon={<CheckCircleIcon />} label="Doğrulanmış" color="success" size="small" />
              </Stack>
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <EmailIcon fontSize="small" />
                  <Typography variant="body2">{email}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PhoneIcon fontSize="small" />
                  <Typography variant="body2">{phone}</Typography>
                </Stack>
              </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" startIcon={<AddIcon />}>Yeni İlan</Button>
            </Stack>
          </Stack>
          
          <Divider sx={{ my: 3 }} />
          
          {/* İstatistik Kartları */}
          {loading ? (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
              gap: 2
            }}>
              {[1, 2, 3].map((index) => (
                <Skeleton key={index} variant="rectangular" height={90} sx={{ borderRadius: 2 }} />
              ))}
            </Box>
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
              gap: 2
            }}>
              <StatCard icon={<InventoryIcon />} label="Toplam İlan" value={stats.totalListings} gradient={kpiColors[0]} />
              <StatCard icon={<LaunchIcon />} label="Görüntülenme" value={stats.totalViews.toLocaleString('tr-TR')} gradient={kpiColors[2]} />
              <StatCard icon={<MessageIcon />} label="Mesajlar" value={stats.messages} gradient={kpiColors[3]} />
            </Box>
          )}
        </Box>
      </Paper>

      {/* TABS */}
      <Paper elevation={1} sx={{ borderRadius: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Tab icon={<InventoryIcon />} iconPosition="start" label="İlanlarım" sx={{ minHeight: 64 }} />
          <Tab icon={<MessageIcon />} iconPosition="start" label="Mesajlar" sx={{ minHeight: 64 }} />
        </Tabs>

        {/* İLANLARIM */}
        <TabPanel value={tabValue} index={0}>
          <Section 
            title="İlanlarım" 
            description="Yayınladığınız tüm ilanları buradan yönetebilirsiniz"
            action={
              <Button variant="contained" startIcon={<AddIcon />}>
                Yeni İlan Ekle
              </Button>
            }
          >
            {error ? (
              <Box textAlign="center" py={4}>
                <Typography color="error" variant="body1" gutterBottom>
                  {error}
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => window.location.reload()}
                  sx={{ mt: 2 }}
                >
                  Sayfayı Yenile
                </Button>
              </Box>
            ) : loading ? (
              <Stack spacing={2}>
                {[1, 2, 3].map((index) => (
                  <Skeleton key={index} variant="rectangular" height={80} />
                ))}
              </Stack>
            ) : userListings.length === 0 ? (
              <EmptyState
                icon={<InventoryIcon sx={{ fontSize: 64, color: 'text.secondary' }} />}
                title="Henüz İlan Yok"
                description="İlk ilanınızı oluşturun ve potansiyel müşterilerinize ulaşın"
                action={
                  <Button variant="contained" startIcon={<AddIcon />}>
                    İlk İlanımı Oluştur
                  </Button>
                }
              />
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>İlan</TableCell>
                    <TableCell>Kategori</TableCell>
                    <TableCell>Konum</TableCell>
                    <TableCell>Fiyat</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell align="right">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userListings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box
                              sx={{
                                width: 50,
                                height: 50,
                                borderRadius: 1,
                                bgcolor: 'grey.100',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <DirectionsBusIcon sx={{ color: 'grey.400' }} />
                            </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>
                              {listing.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {listing.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {listing.category}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {listing.location}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {listing.price ? `₺${listing.price.toLocaleString('tr-TR')}` : 'Belirtilmemiş'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(listing.created_at).toLocaleDateString('tr-TR')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="İlan Detaylarını Görüntüle">
                          <IconButton size="small">
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Section>
        </TabPanel>

        {/* MESAJLAR */}
        <TabPanel value={tabValue} index={1}>
          <Section 
            title="Mesajlar" 
            description="İlanlarınıza gelen tüm mesajları buradan görüntüleyebilirsiniz"
          >
            {loading ? (
              <Stack spacing={2}>
                {[1, 2, 3, 4, 5].map((index) => (
                  <Skeleton key={index} variant="rectangular" height={60} />
                ))}
              </Stack>
            ) : recentMessages.length === 0 ? (
              <EmptyState
                icon={<MessageIcon sx={{ fontSize: 64, color: 'text.secondary' }} />}
                title="Mesaj Yok"
                description="Henüz mesajınız bulunmuyor. İlanlarınız yayınlandıktan sonra mesajlar burada görünecek."
              />
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Gönderen</TableCell>
                    <TableCell>Mesaj</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell align="right">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentMessages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {message.sender_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                          {message.content}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(message.created_at).toLocaleDateString('tr-TR')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Pill 
                          color={message.is_read ? 'default' : 'warning'} 
                          label={message.is_read ? 'Okundu' : 'Okunmadı'} 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Mesajı Görüntüle">
                          <IconButton size="small">
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Section>
        </TabPanel>
      </Paper>

      {/* Debug info - sadece development'ta göster */}
      {process.env.NODE_ENV === 'development' && (
        <Paper sx={{ mt: 2, p: 2, bgcolor: 'grey.100' }}>
          <Typography variant="caption" color="text.secondary">
            Debug: User: {user?.email} | Corporate: {user?.is_corporate ? 'Yes' : 'No'} | Loading: {loading ? 'Yes' : 'No'}
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default MyStorePage;
