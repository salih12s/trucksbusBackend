import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Business,
  Report,
  Visibility,
  CheckCircle,
  Cancel,
  Schedule,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface DashboardStats {
  totalUsers: number;
  totalListings: number;
  pendingListings: number;
  totalReports: number;
  todayRegistrations: number;
  todayListings: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'listing_created' | 'listing_approved' | 'report_created';
  user: string;
  description: string;
  createdAt: Date;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalListings: 0,
    pendingListings: 0,
    totalReports: 0,
    todayRegistrations: 0,
    todayListings: 0,
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      setStats({
        totalUsers: 1245,
        totalListings: 856,
        pendingListings: 23,
        totalReports: 12,
        todayRegistrations: 8,
        todayListings: 15,
      });

      setRecentActivities([
        {
          id: '1',
          type: 'user_registration',
          user: 'Ahmet Yılmaz',
          description: 'Yeni kullanıcı kaydı',
          createdAt: new Date(Date.now() - 5 * 60 * 1000),
        },
        {
          id: '2',
          type: 'listing_created',
          user: 'Mehmet Kaya',
          description: '2018 Mercedes Actros ilanı oluşturdu',
          createdAt: new Date(Date.now() - 15 * 60 * 1000),
        },
        {
          id: '3',
          type: 'listing_approved',
          user: 'Admin',
          description: 'Volvo FH16 ilanını onayladı',
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
        },
        {
          id: '4',
          type: 'report_created',
          user: 'Fatma Demir',
          description: 'İlan için şikayetçi oldu',
          createdAt: new Date(Date.now() - 45 * 60 * 1000),
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <People color="primary" />;
      case 'listing_created':
        return <Business color="info" />;
      case 'listing_approved':
        return <CheckCircle color="success" />;
      case 'report_created':
        return <Report color="error" />;
      default:
        return <Schedule />;
    }
  };

  const getActivityColor = (type: string): 'primary' | 'info' | 'success' | 'error' | 'default' => {
    switch (type) {
      case 'user_registration':
        return 'primary';
      case 'listing_created':
        return 'info';
      case 'listing_approved':
        return 'success';
      case 'report_created':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Yönetim Paneli
        </Typography>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Yönetim Paneli
        </Typography>
        <Button variant="outlined" startIcon={<TrendingUp />}>
          Raporları Görüntüle
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Toplam Kullanıcı
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.totalUsers.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="success.main">
                  +{stats.todayRegistrations} bugün
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                <People />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Toplam İlan
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.totalListings.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="success.main">
                  +{stats.todayListings} bugün
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                <Business />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Bekleyen İlanlar
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.pendingListings}
                </Typography>
                <Typography variant="body2" color="warning.main">
                  Onay bekliyor
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                <Schedule />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Toplam Şikayet
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.totalReports}
                </Typography>
                <Typography variant="body2" color="error.main">
                  İnceleme gerekli
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                <Report />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Recent Activities */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Son Aktiviteler
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Aktivite</TableCell>
                  <TableCell>Kullanıcı</TableCell>
                  <TableCell>Zaman</TableCell>
                  <TableCell>İşlem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {getActivityIcon(activity.type)}
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {activity.description}
                          </Typography>
                          <Chip 
                            label={activity.type.replace('_', ' ')} 
                            size="small" 
                            color={getActivityColor(activity.type)}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {activity.user}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDistanceToNow(activity.createdAt, { addSuffix: true, locale: tr })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Quick Actions */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Hızlı İşlemler
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Schedule />}
              sx={{ justifyContent: 'flex-start' }}
            >
              Bekleyen İlanları Görüntüle ({stats.pendingListings})
            </Button>
            
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Report />}
              sx={{ justifyContent: 'flex-start' }}
            >
              Şikayetleri İncele ({stats.totalReports})
            </Button>
            
            <Button
              variant="outlined"
              fullWidth
              startIcon={<People />}
              sx={{ justifyContent: 'flex-start' }}
            >
              Kullanıcı Yönetimi
            </Button>
            
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Business />}
              sx={{ justifyContent: 'flex-start' }}
            >
              İlan Yönetimi
            </Button>
            
            <Button
              variant="contained"
              fullWidth
              startIcon={<TrendingUp />}
              sx={{ mt: 2 }}
            >
              Detaylı Raporlar
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Quick Stats */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Bu Ay Özet
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="primary.main">
              156
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Yeni Kullanıcı
            </Typography>
          </Box>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="info.main">
              234
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Yeni İlan
            </Typography>
          </Box>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="success.main">
              189
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Onaylanan İlan
            </Typography>
          </Box>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="error.main">
              12
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reddedilen İlan
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;
