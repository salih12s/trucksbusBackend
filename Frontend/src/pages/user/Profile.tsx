import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Avatar,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Divider,
  Chip,
  Stack,
  Container,
  CircularProgress
} from '@mui/material';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import {
  PhotoCamera,
  Person,
  Settings,
  Dashboard,
  Edit,
  Save,
  Cancel,
  TrendingUp
} from '@mui/icons-material';
import { userService, UserProfile, UserStats, ChangePasswordData } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

const Profile: React.FC = () => {
  const { updateUser } = useAuth();
  const { confirm } = useConfirmDialog();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserProfile>>({});
  const [tabValue, setTabValue] = useState(0);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const userData = await userService.getProfile();
      console.log('👤 Profile userData:', userData);
      console.log('🚀 Doping status:', userData.doping_status);
      
      // Backend'den doping status gelmiyorsa localStorage'dan kullanıcı ID'sine özgü kontrol et
      const localDopingStatus = userData.id ? localStorage.getItem(`local_doping_status_${userData.id}`) : null;
      const localDopingExpiresAt = userData.id ? localStorage.getItem(`local_doping_expires_at_${userData.id}`) : null;
      
      if (localDopingStatus && (!userData.doping_status)) {
        userData.doping_status = localDopingStatus as 'ACTIVE' | 'INACTIVE';
        if (localDopingExpiresAt) {
          userData.doping_expires_at = localDopingExpiresAt;
        }
        console.log('🔧 Local doping data applied for user:', userData.id, localDopingStatus);
      }
      
      setUser(userData);
      setEditedUser(userData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await userService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSave = async () => {
    try {
      setAvatarLoading(true);
      const updatedUser = await userService.updateProfile({
        phone: editedUser.phone,
        avatar: editedUser.avatar,
      });
      setUser(updatedUser);
      
      // AuthContext'teki user'ı da güncelle (header avatar için)
      updateUser({
        avatar: updatedUser.avatar|| undefined,
        phone: updatedUser.phone || undefined,
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      await confirm({
        title: 'Hata',
        description: 'Profil güncellenirken bir hata oluştu!',
        severity: 'error',
        confirmText: 'Tamam',
        cancelText: ''
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      await confirm({
        title: 'Hata',
        description: 'Yeni şifreler eşleşmiyor!',
        severity: 'error',
        confirmText: 'Tamam',
        cancelText: ''
      });
      return;
    }

    try {
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      await confirm({
        title: 'Başarılı',
        description: 'Şifre başarıyla değiştirildi!',
        severity: 'success',
        confirmText: 'Tamam',
        cancelText: ''
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      await confirm({
        title: 'Hata',
        description: error.response?.data?.error || 'Şifre değiştirme sırasında bir hata oluştu!',
        severity: 'error',
        confirmText: 'Tamam',
        cancelText: ''
      });
    }
  };

  const handleCancel = () => {
    setEditedUser(user || {});
    setIsEditing(false);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newAvatar = e.target?.result as string;
        // Sadece editedUser'ı güncelle, backend'e hemen kaydetme
        setEditedUser(prev => ({ ...prev, avatar: newAvatar }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Yükleniyor...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
      {/* Header Card */}
      <Card sx={{ mb: 3 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            height: { xs: 180, md: 200 },
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            p: { xs: 2, md: 3 },
          }}
        >
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 2, sm: 3 }} 
            alignItems={{ xs: 'center', sm: 'center' }} 
            sx={{ width: '100%' }}
          >
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={editedUser.avatar || user?.avatar || undefined}
                sx={{ 
                  width: { xs: 80, md: 120 }, 
                  height: { xs: 80, md: 120 }, 
                  border: '4px solid white',
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </Avatar>
              {isEditing && (
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  <PhotoCamera />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </IconButton>
              )}
            </Box>
            <Box sx={{ color: 'white', flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography 
                variant="h4"
                component="h1" 
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 1,
                  fontSize: { xs: '1.5rem', md: '2.125rem' }
                }}
              >
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography 
                variant="h6"
                sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '0.9rem', md: '1.25rem' }
                }}
              >
                {user?.email}
              </Typography>
              {/* Doping Badge */}
              {user?.doping_status === 'ACTIVE' && (
                <Chip
                  icon={<TrendingUp />}
                  label="Dopingli Üye"
                  color="secondary"
                  variant="filled"
                  sx={{
                    mt: 1,
                    bgcolor: '#ff6b35',
                    color: 'white',
                    fontWeight: 'bold',
                    '& .MuiChip-icon': {
                      color: 'white'
                    }
                  }}
                />
              )}
            </Box>
            <Box>
              {!isEditing ? (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                  sx={{ 
                    color: 'white',
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    px: { xs: 2, md: 3 }
                  }}
                  size="medium"
                >
                  Düzenle
                </Button>
              ) : (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={avatarLoading ? <CircularProgress size={16} color="inherit" /> : <Save />}
                    onClick={handleSave}
                    disabled={avatarLoading}
                    size="medium"
                  >
                    {avatarLoading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={avatarLoading}
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.1)', 
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.3)'
                    }}
                    size="medium"
                  >
                    İptal
                  </Button>
                </Stack>
              )}
            </Box>
          </Stack>
        </Box>
      </Card>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Paper sx={{ 
          p: { xs: 2, md: 3 }, 
          textAlign: 'center', 
          minWidth: { xs: '100%', sm: '350px' },
          maxWidth: '400px' 
        }}>
          <Dashboard sx={{ 
            fontSize: { xs: 32, md: 40 }, 
            color: 'success.main', 
            mb: 1 
          }} />
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              fontWeight: 'bold', 
              color: 'success.main',
              fontSize: { xs: '1.75rem', md: '2.125rem' }
            }}
          >
            {stats?.activeListings || 0}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
          >
            Aktif İlan
          </Typography>
        </Paper>
      </Box>

      {/* Main Content */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab 
              label="Genel Bakış" 
              icon={<Person />} 
              iconPosition="start"
              {...a11yProps(0)} 
            />
            <Tab 
              label="Ayarlar" 
              icon={<Settings />} 
              iconPosition="start"
              {...a11yProps(1)} 
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 2, md: 3 }, 
            flexWrap: 'wrap',
            flexDirection: { xs: 'column', md: 'row' }
          }}>
            <Box sx={{ flex: 1, minWidth: { xs: '100%', md: '300px' } }}>
              <Typography variant="h6" gutterBottom>
                Kişisel Bilgiler
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Ad Soyad
                  </Typography>
                  <Typography variant="body1">
                    {user?.first_name} {user?.last_name}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    E-posta
                  </Typography>
                  <Typography variant="body1">
                    {user?.email}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Telefon
                  </Typography>
                  <Typography variant="body1">
                    {user?.phone || 'Belirtilmemiş'}
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Box sx={{ flex: 1, minWidth: { xs: '100%', md: '300px' } }}>
              <Typography variant="h6" gutterBottom>
                Hesap Durumu
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Durum
                  </Typography>
                  <Chip label="Aktif" color="success" />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Üyelik Tarihi
                  </Typography>
                  <Typography variant="body1">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Bilinmiyor'}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 2, md: 4 }, 
            flexWrap: 'wrap',
            flexDirection: { xs: 'column', lg: 'row' }
          }}>
            {/* Profil Ayarları */}
            <Box sx={{ flex: 1, minWidth: { xs: '100%', lg: '400px' } }}>
              <Typography variant="h6" gutterBottom>
                Profil Ayarları
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Ad"
                  value={user?.first_name || ''}
                  disabled
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Soyad"
                  value={user?.last_name || ''}
                  disabled
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="E-posta"
                  value={user?.email || ''}
                  disabled
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Telefon"
                  value={editedUser.phone || ''}
                  onChange={(e) => setEditedUser(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  variant="outlined"
                  placeholder="Telefon numaranızı girin"
                />
                
                {isEditing && (
                  <Box sx={{ display: 'flex', gap: 2, mt: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={avatarLoading ? <CircularProgress size={16} color="inherit" /> : <Save />}
                      onClick={handleSave}
                      disabled={avatarLoading}
                      fullWidth={false}
                    >
                      {avatarLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      disabled={avatarLoading}
                      fullWidth={false}
                    >
                      İptal
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Şifre Değiştir */}
            <Box sx={{ flex: 1, minWidth: { xs: '100%', lg: '400px' } }}>
              <Typography variant="h6" gutterBottom>
                Şifre Değiştir
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Mevcut Şifre"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Yeni Şifre"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Yeni Şifre Tekrar"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  variant="outlined"
                />
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePasswordChange}
                    disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    sx={{ 
                      width: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    Şifre Değiştir
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </TabPanel>
      </Card>
    </Container>
  );
};

export default Profile;
