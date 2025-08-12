import React, { useState, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tab,
  Tabs,
  Avatar,
  Button,
  TextField,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Alert,
} from '@mui/material';
import {
  Edit,
  PhotoCamera,
  Visibility,
  Favorite,
  Message,
  Delete,
  Security,
  Notifications,
  Business,
  Phone,
  Email,
  LocationOn,
} from '@mui/icons-material';
import { AuthContext } from '@/context/AuthContext';
import { Listing, ListingStatus } from '@/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Profile: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john@example.com',
    phone: '+90 555 123 4567',
    location: 'İstanbul, Türkiye',
    company: 'ABC Nakliyat Ltd.',
    bio: 'Kamyon ve otobüs ticareti alanında 15 yıllık deneyim.',
    avatar: '/api/placeholder/120/120',
  });

  const [myListings] = useState<Listing[]>([
    {
      id: '1',
      title: '2018 Mercedes Actros 2545',
      price: 850000,
      location: 'İstanbul',
      images: ['/api/placeholder/300/200'],
      createdAt: new Date('2024-01-15'),
      status: ListingStatus.APPROVED,
      category: { id: '1', name: 'Kamyon', slug: 'kamyon', createdAt: new Date() },
      user: user!,
      views: 1250,
      isFavorite: false,
      description: 'Temiz araç',
      features: ['Klima', 'ABS'],
      categoryId: '1',
      userId: user?.id || '1',
      isApproved: true,
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: '2020 Volvo FH16 750',
      price: 1200000,
      location: 'Ankara',
      images: ['/api/placeholder/300/200'],
      createdAt: new Date('2024-01-10'),
      status: ListingStatus.PENDING,
      category: { id: '1', name: 'Kamyon', slug: 'kamyon', createdAt: new Date() },
      user: user!,
      views: 850,
      isFavorite: false,
      description: 'Sıfır ayarında',
      features: ['Navigasyon', 'Bluetooth'],
      categoryId: '1',
      userId: user?.id || '1',
      isApproved: false,
      updatedAt: new Date(),
    },
  ]);

  const [favoriteListings] = useState<Listing[]>([
    {
      id: '3',
      title: '2019 MAN TGX 18.480',
      price: 950000,
      location: 'İzmir',
      images: ['/api/placeholder/300/200'],
      createdAt: new Date('2024-01-12'),
      status: ListingStatus.APPROVED,
      category: { id: '1', name: 'Kamyon', slug: 'kamyon', createdAt: new Date() },
      user: { 
        id: '2', 
        name: 'Ahmet Yılmaz', 
        email: 'ahmet@example.com', 
        role: 'user' as const,
        username: 'ahmetyilmaz',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      views: 650,
      isFavorite: true,
      description: 'Bakımlı araç',
      features: ['Cruise Control', 'LED Farlar'],
      categoryId: '1',
      userId: '2',
      isApproved: true,
      updatedAt: new Date(),
    },
  ]);

  const [notifications, setNotifications] = useState({
    emailMessages: true,
    emailListings: false,
    smsMessages: true,
    pushNotifications: true,
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileUpdate = () => {
    setEditMode(false);
    // API call would go here
    console.log('Profile updated:', profileData);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({ ...prev, avatar: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'pending':
        return 'Onay Bekliyor';
      case 'rejected':
        return 'Reddedildi';
      default:
        return 'Bilinmiyor';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile Header */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={profileData.avatar}
              sx={{ width: 120, height: 120 }}
            >
              {profileData.name.charAt(0)}
            </Avatar>
            {editMode && (
              <>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <label htmlFor="avatar-upload">
                  <IconButton
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                    size="small"
                  >
                    <PhotoCamera />
                  </IconButton>
                </label>
              </>
            )}
          </Box>

          <Box sx={{ flex: 1 }}>
            {editMode ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Ad Soyad"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                />
                <TextField
                  label="Şirket"
                  value={profileData.company}
                  onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                />
              </Box>
            ) : (
              <>
                <Typography variant="h4" fontWeight="bold">
                  {profileData.name}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  {profileData.company}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {profileData.bio}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip icon={<LocationOn />} label={profileData.location} />
                  <Chip icon={<Email />} label={profileData.email} />
                  <Chip icon={<Phone />} label={profileData.phone} />
                </Box>
              </>
            )}
          </Box>

          <Box>
            {editMode ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={() => setEditMode(false)}>İptal</Button>
                <Button variant="contained" onClick={handleProfileUpdate}>
                  Kaydet
                </Button>
              </Box>
            ) : (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setEditMode(true)}
              >
                Düzenle
              </Button>
            )}
          </Box>
        </Box>

        {editMode && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 3 }}>
            <TextField
              label="E-posta"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
            />
            <TextField
              label="Telefon"
              value={profileData.phone}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
            />
            <TextField
              label="Konum"
              value={profileData.location}
              onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
            />
            <TextField
              label="Hakkımda"
              multiline
              rows={3}
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              sx={{ gridColumn: { md: '1 / -1' } }}
            />
          </Box>
        )}
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<Business />} label="İlanlarım" />
          <Tab icon={<Favorite />} label="Favoriler" />
          <Tab icon={<Message />} label="Mesajlar" />
          <Tab icon={<Notifications />} label="Bildirimler" />
          <Tab icon={<Security />} label="Güvenlik" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          İlanlarım ({myListings.length})
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {myListings.map((listing) => (
            <Card key={listing.id}>
              <CardMedia
                component="img"
                height="200"
                image={listing.images[0]}
                alt={listing.title}
              />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Typography variant="h6" component="h3" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                    {listing.title}
                  </Typography>
                  <Chip
                    label={getStatusText(listing.status)}
                    color={getStatusColor(listing.status) as any}
                    size="small"
                  />
                </Box>
                <Typography variant="h5" color="success.main" fontWeight="bold" sx={{ mb: 1 }}>
                  {listing.price.toLocaleString('tr-TR')} TL
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    📍 {listing.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    👁️ {listing.views}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" startIcon={<Visibility />}>
                    Görüntüle
                  </Button>
                  <Button size="small" startIcon={<Edit />}>
                    Düzenle
                  </Button>
                  <IconButton size="small" color="error">
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Favori İlanlar ({favoriteListings.length})
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {favoriteListings.map((listing) => (
            <Card key={listing.id}>
              <CardMedia
                component="img"
                height="200"
                image={listing.images[0]}
                alt={listing.title}
              />
              <CardContent>
                <Typography variant="h6" component="h3" sx={{ fontSize: '1rem', fontWeight: 'bold', mb: 1 }}>
                  {listing.title}
                </Typography>
                <Typography variant="h5" color="success.main" fontWeight="bold" sx={{ mb: 1 }}>
                  {listing.price.toLocaleString('tr-TR')} TL
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  📍 {listing.location} • {listing.user.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" startIcon={<Visibility />}>
                    Görüntüle
                  </Button>
                  <IconButton size="small" color="error">
                    <Favorite />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Mesaj özelliği için ayrı bir sayfa bulunmaktadır. Buradan mesaj sayfasına yönlendirilebilirsiniz.
        </Alert>
        <Button variant="contained" startIcon={<Message />}>
          Mesajlara Git
        </Button>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Bildirim Ayarları
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="E-posta Mesajları"
              secondary="Yeni mesajları e-posta ile al"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={notifications.emailMessages}
                onChange={() => handleNotificationChange('emailMessages')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="E-posta İlanları"
              secondary="Yeni ilanları e-posta ile al"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={notifications.emailListings}
                onChange={() => handleNotificationChange('emailListings')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="SMS Mesajları"
              secondary="Önemli mesajları SMS ile al"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={notifications.smsMessages}
                onChange={() => handleNotificationChange('smsMessages')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Push Bildirimleri"
              secondary="Tarayıcı bildirimleri"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={notifications.pushNotifications}
                onChange={() => handleNotificationChange('pushNotifications')}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <Typography variant="h6" gutterBottom>
          Güvenlik Ayarları
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Şifre Değiştir
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField type="password" label="Mevcut Şifre" />
                <TextField type="password" label="Yeni Şifre" />
                <TextField type="password" label="Yeni Şifre (Tekrar)" />
                <Button variant="outlined" sx={{ alignSelf: 'start' }}>
                  Şifreyi Güncelle
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                İki Faktörlü Doğrulama
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Hesabınızın güvenliğini artırmak için iki faktörlü doğrulamayı etkinleştirin.
              </Typography>
              <Button variant="outlined">
                Etkinleştir
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Oturum Geçmişi
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Son oturum açma bilgilerinizi görüntüleyin.
              </Typography>
              <Button variant="outlined">
                Geçmişi Görüntüle
              </Button>
            </CardContent>
          </Card>
        </Box>
      </TabPanel>
    </Container>
  );
};

export default Profile;
