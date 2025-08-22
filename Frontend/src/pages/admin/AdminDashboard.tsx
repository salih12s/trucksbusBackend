import React from 'react';
import {
  Box, Container, Card, CardContent, Typography, Avatar,
  Button, Alert, Skeleton, CircularProgress, Chip, Grid
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  TrendingUp, TrendingDown, People, Assignment, Report, Message, Refresh
} from '@mui/icons-material';

import { useDashboardStats } from '../../hooks/admin';
import { formatTRY, formatNumber } from '../../utils/format';
import AdminGuard from '../../components/admin/AdminGuard';

type PaletteKey = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  color: PaletteKey;
  format?: 'number' | 'currency';
  loading?: boolean;
}

const SoftIconAvatar: React.FC<{ color: PaletteKey; children: React.ReactNode }> = ({ color, children }) => (
  <Avatar
    sx={(t) => ({
      width: 56,
      height: 56,
      bgcolor: alpha(t.palette[color].main, 0.12),
      color: t.palette[color].main,
      border: `1px solid ${alpha(t.palette[color].main, 0.24)}`
    })}
  >
    {children}
  </Avatar>
);

const StatCard: React.FC<StatCardProps> = ({
  title, value, change, icon, color, format = 'number', loading = false
}) => {
  const formatValue = (val: number) => (format === 'currency' ? formatTRY(val) : formatNumber(val));

  if (loading) {
    return (
      <Card sx={{ height: '100%', p: 1.5, borderRadius: 3 }}>
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
      elevation={0}
      sx={(t) => ({
        height: '100%',
        p: 1.5,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(t.palette[color].main, 0.08)}, ${alpha(t.palette[color].main, 0.02)})`,
        border: `1px solid ${alpha(t.palette[color].main, 0.12)}`
      })}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>
              {formatValue(value)}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {title}
            </Typography>

            {change !== undefined && (
              <Chip
                size="small"
                sx={{ mt: 1, fontWeight: 600 }}
                color={change >= 0 ? 'success' : 'error'}
                icon={change >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                label={`${change >= 0 ? '+' : ''}${change.toFixed(1)}%`}
                variant="outlined"
              />
            )}
          </Box>
          <SoftIconAvatar color={color}>{icon}</SoftIconAvatar>
        </Box>
      </CardContent>
    </Card>
  );
};

const SectionCard: React.FC<React.PropsWithChildren<{ title?: string; subtitle?: string }>> = ({ title, subtitle, children }) => (
  <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}` }}>
    {(title || subtitle) && (
      <Box mb={2}>
        {title && <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>}
        {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
      </Box>
    )}
    {children}
  </Card>
);

const AdminDashboard: React.FC = () => {
  const {
    data: dashboardStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useDashboardStats({ refetchInterval: 30_000 });

  const handleRefresh = () => { refetchStats(); };

  if (statsLoading && !dashboardStats) {
    return (
      <AdminGuard>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
          </Box>
        </Container>
      </AdminGuard>
    );
  }

  if (statsError) {
    return (
      <AdminGuard>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={handleRefresh} startIcon={<Refresh />}>
                Tekrar Dene
              </Button>
            }
          >
            Dashboard verilerini yüklerken hata oluştu: {(statsError as any).message}
          </Alert>
        </Container>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box
          sx={(t) => ({
            mb: 4, p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.08)}, ${alpha(t.palette.primary.main, 0.02)})`,
            border: `1px solid ${alpha(t.palette.primary.main, 0.12)}`
          })}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Admin Dashboard</Typography>
            <Typography variant="body2" color="text.secondary">Sistem özetinizi ve kritik KPI’ları tek ekranda görün.</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={statsLoading ? <CircularProgress size={20} /> : <Refresh />}
            onClick={handleRefresh}
            disabled={statsLoading}
          >
            {statsLoading ? 'Yenileniyor…' : 'Yenile'}
          </Button>
        </Box>

        {/* Pending alert */}
        {dashboardStats && dashboardStats.pendingCount > 0 && (
          <Alert
            severity="warning"
            sx={{ mb: 3, borderRadius: 2 }}
            action={<Button color="inherit" size="small" href="/admin/listings/pending" variant="outlined">İncele</Button>}
          >
            <strong>{dashboardStats.pendingCount} ilan</strong> onay bekliyor. Lütfen inceleyiniz.
          </Alert>
        )}

        {/* Top stats */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Toplam Kullanıcı" value={dashboardStats?.usersCount || 0} icon={<People />} color="primary" loading={statsLoading} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Toplam İlan" value={dashboardStats?.totalListings || 0} icon={<Assignment />} color="info" loading={statsLoading} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Aktif İlan" value={dashboardStats?.activeCount || 0} icon={<Assignment />} color="success" loading={statsLoading} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Onay Bekleyen" value={dashboardStats?.pendingCount || 0} icon={<Report />} color="warning" loading={statsLoading} />
          </Grid>
        </Grid>

        {/* Activity section */}
        <SectionCard title="Aktivite Özeti" subtitle="Bugün, bu hafta ve mesaj hacmi">
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Bugün Kayıt" value={dashboardStats?.todayCreated || 0} icon={<People />} color="success" loading={statsLoading} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Bu Hafta" value={dashboardStats?.weekCreated || 0} icon={<People />} color="info" loading={statsLoading} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Toplam Mesaj" value={dashboardStats?.totalMessages || 0} icon={<Message />} color="secondary" loading={statsLoading} />
            </Grid>
          </Grid>
        </SectionCard>

        {dashboardStats && (
          <Box mt={3} textAlign="center">
            <Chip variant="outlined" size="small" label="Veriler 30 saniyede bir otomatik yenilenir" />
          </Box>
        )}
      </Container>
    </AdminGuard>
  );
};

export default AdminDashboard;
