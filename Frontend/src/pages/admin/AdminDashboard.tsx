import React, { useState, useEffect } from 'react';
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
  Skeleton,
  Tooltip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
  Refresh,
  Category,
  LocationCity,
  Computer,
  Memory,
  Speed,
  Check,
  Close,
  HourglassEmpty,
} from '@mui/icons-material';

import { adminService, DashboardData, RecentActivity } from '../../services/adminService';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  format?: 'number' | 'currency';
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  color, 
  format = 'number',
  loading = false 
}) => {
  const formatValue = (val: number) => {
    if (format === 'currency') {
      return adminService.formatCurrency(val);
    }
    return adminService.formatNumber(val);
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Skeleton variant="circular" width={56} height={56} />
          <Skeleton variant="text" height={40} sx={{ mt: 2 }} />
          <Skeleton variant="text" height={20} />
          <Skeleton variant="text" height={20} width="60%" />
        </CardContent>
      </Card>
    );
  }

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
        </Box>
        
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
          {formatValue(value)}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
          {title}
        </Typography>
        
        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {change > 0 ? (
              <TrendingUp sx={{ color: '#4caf50', fontSize: 20 }} />
            ) : change < 0 ? (
              <TrendingDown sx={{ color: '#f44336', fontSize: 20 }} />
            ) : null}
            <Typography
              variant="body2"
              sx={{
                color: change > 0 ? '#4caf50' : change < 0 ? '#f44336' : 'rgba(255, 255, 255, 0.8)',
                fontWeight: 'medium',
              }}
            >
              {change > 0 ? '+' : ''}{change}%
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              bu ay
            </Typography>
          </Box>
        )}
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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [stats, activities, pending] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentActivities(15),
        adminService.getPendingListings(1, 20)
      ]);
      
      setDashboardData(stats);
      setRecentActivities(activities);
      setPendingListings(pending.listings || []);
    } catch (error: any) {
      console.error('Dashboard verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  const handleSelectAll = () => {
    if (selectedListings.length === pendingListings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(pendingListings.map(listing => listing.id));
    }
  };

  const handleSelectListing = (listingId: string) => {
    setSelectedListings(prev => 
      prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const handleApproveSelected = async () => {
    if (selectedListings.length === 0) return;
    
    setActionLoading(true);
    try {
      await adminService.approveListings(selectedListings);
      await loadDashboardData();
      setSelectedListings([]);
    } catch (error: any) {
      console.error('İlanları onaylarken hata:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSelected = async () => {
    if (selectedListings.length === 0 || !rejectReason.trim()) return;
    
    setActionLoading(true);
    try {
      await adminService.rejectListings(selectedListings, rejectReason);
      await loadDashboardData();
      setSelectedListings([]);
      setRejectDialog(false);
      setRejectReason('');
    } catch (error: any) {
      console.error('İlanları reddederken hata:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'listing':
        return <Assignment />;
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
      case 'active':
        return 'success';
      case 'completed':
        return 'success';
      case 'sent':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" height={48} width={300} />
          <Skeleton variant="text" height={24} width={600} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3, mb: 4 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <StatCard
              key={i}
              title=""
              value={0}
              icon={<Schedule />}
              color="primary"
              loading={true}
            />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            📊 Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            TruckBus yönetim paneli - Sistem durumu ve son aktiviteler
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={refreshing ? <CircularProgress size={20} /> : <Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Yenileniyor...' : 'Yenile'}
        </Button>
      </Box>

      {/* Quick Alerts */}
      {dashboardData && (
        <Stack spacing={2} sx={{ mb: 4 }}>
          {dashboardData.stats.pendingListings.value > 0 && (
            <Alert 
              severity="warning" 
              action={
                <Button color="inherit" size="small">
                  İNCELE
                </Button>
              }
            >
              <strong>{dashboardData.stats.pendingListings.value} ilan</strong> onay bekliyor. Lütfen inceleyiniz.
            </Alert>
          )}
        </Stack>
      )}

      {/* Stats Cards */}
      {dashboardData && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3, mb: 4 }}>
          <StatCard
            title="Toplam Kullanıcı"
            value={dashboardData.stats.totalUsers.value}
            change={dashboardData.stats.totalUsers.change}
            icon={<People />}
            color="primary"
          />
          <StatCard
            title="Toplam İlan"
            value={dashboardData.stats.totalListings.value}
            change={dashboardData.stats.totalListings.change}
            icon={<Assignment />}
            color="success"
          />
          <StatCard
            title="Onay Bekleyen İlan"
            value={dashboardData.stats.pendingListings.value}
            icon={<HourglassEmpty />}
            color="warning"
          />
          <StatCard
            title="Aktif İlan"
            value={dashboardData.stats.pendingListings.active}
            icon={<CheckCircle />}
            color="success"
          />
          <StatCard
            title="Toplam Mesaj"
            value={dashboardData.stats.totalMessages.value}
            change={dashboardData.stats.totalMessages.change}
            icon={<Message />}
            color="info"
          />
          <StatCard
            title="Kategori Sayısı"
            value={dashboardData.stats.totalCategories.value}
            icon={<Category />}
            color="secondary"
          />
        </Box>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 4 }}>
        {/* Pending Listings Table */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              ⏳ Onay Bekleyen İlanlar
            </Typography>
            {selectedListings.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={actionLoading ? <CircularProgress size={16} /> : <Check />}
                  onClick={handleApproveSelected}
                  disabled={actionLoading}
                >
                  Onayla ({selectedListings.length})
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  startIcon={<Close />}
                  onClick={() => setRejectDialog(true)}
                  disabled={actionLoading}
                >
                  Reddet ({selectedListings.length})
                </Button>
              </Box>
            )}
          </Box>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedListings.length === pendingListings.length && pendingListings.length > 0}
                      indeterminate={selectedListings.length > 0 && selectedListings.length < pendingListings.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>İlan</TableCell>
                  <TableCell>Satıcı</TableCell>
                  <TableCell>Fiyat</TableCell>
                  <TableCell>Tarih</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingListings.slice(0, 10).map((listing) => (
                  <TableRow key={listing.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedListings.includes(listing.id)}
                        onChange={() => handleSelectListing(listing.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {listing.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {listing.categories?.name} - {listing.vehicle_types?.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {listing.users?.first_name} {listing.users?.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {listing.users?.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {adminService.formatCurrency(listing.price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {adminService.formatRelativeTime(listing.created_at)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {pendingListings.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Onay bekleyen ilan bulunmuyor
              </Typography>
            </Box>
          )}
        </Paper>

        {/* System Info */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            🖥️ Sistem Durumu
          </Typography>
          
          {dashboardData && (
            <Stack spacing={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Computer sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                  Sunucu Durumu
                </Typography>
                <Typography variant="body2" color="success.main">
                  Aktif ({adminService.formatUptime(dashboardData.systemInfo.uptime)})
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Memory sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                  Bellek Kullanımı
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {adminService.formatMemoryUsage(dashboardData.systemInfo.memoryUsage.heapUsed)} / {adminService.formatMemoryUsage(dashboardData.systemInfo.memoryUsage.heapTotal)}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(dashboardData.systemInfo.memoryUsage.heapUsed / dashboardData.systemInfo.memoryUsage.heapTotal) * 100} 
                  sx={{ mt: 1 }} 
                />
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Speed sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                  Node.js Sürümü
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dashboardData.systemInfo.nodeVersion}
                </Typography>
              </Box>
            </Stack>
          )}
        </Paper>
      </Box>

      {/* Recent Activities */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          🔔 Son Aktiviteler
        </Typography>
        <List>
          {recentActivities.slice(0, 15).map((activity, index) => (
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
                               activity.status === 'active' ? 'Aktif' :
                               activity.status === 'completed' ? 'Tamamlandı' :
                               activity.status === 'sent' ? 'Gönderildi' : activity.status}
                        color={getActivityColor(activity.status) as any}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" component="div">
                        {activity.description}
                      </Typography>
                      <Typography variant="body2" color="text.primary" component="div">
                        {activity.user}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="div">
                        {adminService.formatRelativeTime(activity.time)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < recentActivities.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
        
        {recentActivities.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <NotificationImportant sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Son 24 saatte aktivite bulunmuyor
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>İlanları Reddet</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {selectedListings.length} ilan reddedilecek. Lütfen ret nedenini belirtin:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Ret Nedeni"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="İlan reddedilme sebebini açıklayın..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)}>İptal</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectSelected}
            disabled={!rejectReason.trim() || actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} /> : undefined}
          >
            Reddet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
