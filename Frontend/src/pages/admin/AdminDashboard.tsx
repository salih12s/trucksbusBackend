import React from 'react';
import {
  Box,
  Grid,
  Container,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Button,
  Alert,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  Assignment,
  Report,
  Message,
  Visibility,
  MoreVert,
  NotificationImportant,
  CheckCircle,
  ErrorOutline,
  Schedule,
} from '@mui/icons-material';

// Mock data - gerçekte API'den gelecek
const dashboardStats = {
  totalUsers: 1247,
  usersChange: 12.5,
  totalListings: 3892,
  listingsChange: -2.3,
  pendingListings: 24,
  pendingChange: 15.8,
  totalComplaints: 8,
  complaintsChange: -25.0,
  unreadMessages: 12,
  messagesChange: 33.3,
  todayViews: 15673,
  viewsChange: 8.7,
};

const recentActivities = [
  {
    id: 1,
    type: 'listing',
    title: 'Yeni Mercedes Actros ilanı',
    user: 'Ahmet Yılmaz',
    time: '5 dakika önce',
    status: 'pending',
  },
  {
    id: 2,
    type: 'complaint',
    title: 'Sahte ilan şikayeti',
    user: 'Ayşe Demir',
    time: '15 dakika önce',
    status: 'urgent',
  },
  {
    id: 3,
    type: 'user',
    title: 'Yeni kullanıcı kaydı',
    user: 'Mehmet Kaya',
    time: '1 saat önce',
    status: 'completed',
  },
  {
    id: 4,
    type: 'message',
    title: 'Özel mesaj',
    user: 'Fatma Öztürk',
    time: '2 saat önce',
    status: 'unread',
  },
];

const quickActions = [
  {
    title: 'Onay Bekleyen İlanlar',
    count: 24,
    action: 'İncele',
    color: 'warning',
    path: '/admin/pending-listings',
  },
  {
    title: 'Şikayetler',
    count: 8,
    action: 'Görüntüle',
    color: 'error',
    path: '/admin/complaints',
  },
  {
    title: 'Okunmamış Mesajlar',
    count: 12,
    action: 'Yanıtla',
    color: 'info',
    path: '/admin/messages',
  },
];

interface StatCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: string;
  format?: 'number' | 'currency';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color, format = 'number' }) => {
  const formatValue = (val: number) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
    }
    return new Intl.NumberFormat('tr-TR').format(val);
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        position: 'relative', 
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${color}.main 0%, ${color}.dark 100%)`,
        color: 'white',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        }
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.2)', 
              width: 56, 
              height: 56,
              color: 'white',
              backdropFilter: 'blur(10px)',
            }}
          >
            {icon}
          </Avatar>
          <IconButton size="small" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            <MoreVert />
          </IconButton>
        </Box>
        
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
          {formatValue(value)}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {change > 0 ? (
            <TrendingUp sx={{ color: '#4caf50', fontSize: 20 }} />
          ) : (
            <TrendingDown sx={{ color: '#f44336', fontSize: 20 }} />
          )}
          <Typography
            variant="body2"
            sx={{
              color: change > 0 ? '#4caf50' : '#f44336',
              fontWeight: 'medium',
            }}
          >
            {change > 0 ? '+' : ''}{change}%
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            bu ay
          </Typography>
        </Box>
      </CardContent>
      
      {/* Decorative background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 100,
          height: 100,
          borderRadius: '50%',
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          zIndex: 0,
        }}
      />
    </Card>
  );
};

const AdminDashboard: React.FC = () => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'listing':
        return <Assignment />;
      case 'complaint':
        return <Report />;
      case 'user':
        return <People />;
      case 'message':
        return <Message />;
      default:
        return <NotificationImportant />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'urgent':
        return 'error';
      case 'completed':
        return 'success';
      case 'unread':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          📊 Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          TruckBus admin paneline hoş geldiniz. Sisteminizin genel durumunu buradan takip edebilirsiniz.
        </Typography>
      </Box>

      {/* Alerts */}
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Alert severity="warning" action={
          <Button color="inherit" size="small">
            İNCELE
          </Button>
        }>
          <strong>24 ilan</strong> onay bekliyor. Lütfen inceleyiniz.
        </Alert>
        <Alert severity="error" action={
          <Button color="inherit" size="small">
            GÖRÜNTÜLE
          </Button>
        }>
          <strong>3 acil şikayet</strong> var. Hemen müdahale gerekiyor.
        </Alert>
      </Stack>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3, mb: 4 }}>
        <StatCard
          title="Toplam Kullanıcı"
          value={dashboardStats.totalUsers}
          change={dashboardStats.usersChange}
          icon={<People />}
          color="primary"
        />
        <StatCard
          title="Toplam İlan"
          value={dashboardStats.totalListings}
          change={dashboardStats.listingsChange}
          icon={<Assignment />}
          color="success"
        />
        <StatCard
          title="Onay Bekleyen"
          value={dashboardStats.pendingListings}
          change={dashboardStats.pendingChange}
          icon={<Schedule />}
          color="warning"
        />
        <StatCard
          title="Şikayetler"
          value={dashboardStats.totalComplaints}
          change={dashboardStats.complaintsChange}
          icon={<Report />}
          color="error"
        />
        <StatCard
          title="Okunmamış Mesaj"
          value={dashboardStats.unreadMessages}
          change={dashboardStats.messagesChange}
          icon={<Message />}
          color="info"
        />
        <StatCard
          title="Bugünkü Görüntüleme"
          value={dashboardStats.todayViews}
          change={dashboardStats.viewsChange}
          icon={<Visibility />}
          color="secondary"
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
        {/* Quick Actions */}
        <Paper sx={{ p: 3, height: 'fit-content' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            ⚡ Hızlı İşlemler
          </Typography>
          <Stack spacing={2}>
            {quickActions.map((action, index) => (
              <Card key={index} variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                    {action.title}
                  </Typography>
                  <Chip
                    label={action.count}
                    color={action.color as any}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                <Button 
                  variant="contained" 
                  size="small" 
                  fullWidth
                  color={action.color as any}
                >
                  {action.action}
                </Button>
              </Card>
            ))}
          </Stack>
        </Paper>

        {/* Recent Activities */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            🔔 Son Aktiviteler
          </Typography>
          <List>
            {recentActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${getActivityColor(activity.status)}.main` }}>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                          {activity.title}
                        </Typography>
                        <Chip
                          label={activity.status === 'pending' ? 'Bekliyor' : 
                                 activity.status === 'urgent' ? 'Acil' :
                                 activity.status === 'completed' ? 'Tamamlandı' : 'Okunmadı'}
                          color={getActivityColor(activity.status) as any}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" component="div">
                          {activity.user}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="div">
                          {activity.time}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < recentActivities.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button variant="outlined">
              Tüm Aktiviteleri Görüntüle
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* System Status */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          🔧 Sistem Durumu
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
              Sunucu Durumu
            </Typography>
            <Typography variant="body2" color="success.main">
              Çevrimiçi
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
              Veritabanı
            </Typography>
            <Typography variant="body2" color="success.main">
              Bağlı
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <ErrorOutline sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
              Disk Alanı
            </Typography>
            <Typography variant="body2" color="warning.main">
              %78 Dolu
            </Typography>
            <LinearProgress variant="determinate" value={78} sx={{ mt: 1 }} />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
              Son Yedekleme
            </Typography>
            <Typography variant="body2" color="success.main">
              2 saat önce
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
