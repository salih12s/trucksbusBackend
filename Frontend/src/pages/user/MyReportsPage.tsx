import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Pagination,
  Typography,
  Alert,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import { reportService, getReasonLabel, getStatusLabel, type Report, type ReportStatus } from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useWebSocketContext } from '../../context/WebSocketContext';

function StatusChip({ status }: { status: ReportStatus }) {
  const colorMap: Record<ReportStatus, 'default' | 'warning' | 'success' | 'error'> = {
    'OPEN': 'warning',
    'UNDER_REVIEW': 'warning', 
    'ACCEPTED': 'success',
    'REJECTED': 'error',
  };
  
  return (
    <Chip 
      size="small" 
      label={getStatusLabel(status)} 
      color={colorMap[status]} 
      variant="filled"
    />
  );
}

const MyReportsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { showErrorNotification } = useNotification();
  const { socket } = useWebSocketContext();

  // States
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('');
  
  // Modal
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; report?: Report }>({ open: false });
  
  // Status update banner
  const [statusUpdateBanner, setStatusUpdateBanner] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
  }, [isAuthenticated]);

  // Load user's reports
  const loadReports = useCallback(async (pageNum = 1) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const result = await reportService.getUserReports({
        status: statusFilter || undefined,
        page: pageNum,
        limit: 10,
      });
      
      setReports(result.items || []);
      setTotal(result.total || 0);
      setPage(result.page || pageNum);
    } catch (error: any) {
      console.error('Load user reports error:', error);
      showErrorNotification('Şikayetleriniz yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, isAuthenticated]);

  // Load reports on mount and filter changes
  useEffect(() => {
    loadReports(1);
  }, [statusFilter, isAuthenticated]);

  // Socket listener for report status updates
  useEffect(() => {
    if (!socket || !user) return;
    
    const handleReportUpdate = (payload: any) => {
      console.log('📝 Report status updated:', payload);
      
      if (payload.reporterId === user.id) {
        setStatusUpdateBanner(
          `Şikayetiniz ${getStatusLabel(payload.newStatus).toLowerCase()} durumuna geçti.`
        );
        // Auto-hide banner after 5 seconds
        setTimeout(() => setStatusUpdateBanner(null), 5000);
        // Refresh the list
        loadReports(page);
      }
    };
    
    socket.on('user:report:status-update', handleReportUpdate);
    return () => {
      socket.off('user:report:status-update', handleReportUpdate);
    };
  }, [socket, user, page, loadReports]);

  // Open detail
  const openDetail = (report: Report) => {
    setDetailDialog({ open: true, report });
  };

  const refreshList = () => {
    setStatusUpdateBanner(null);
    loadReports(page);
  };

  if (!isAuthenticated) {
    return (
      <Box p={3}>
        <Alert severity="warning">Bu sayfayı görüntülemek için giriş yapmalısınız.</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Şikayetlerim
      </Typography>

      {/* Status Update Banner */}
      {statusUpdateBanner && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={refreshList}>
              Tamam
            </Button>
          }
        >
          {statusUpdateBanner}
        </Alert>
      )}

      {/* Filter */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Durum Filtresi"
            size="small"
            select
            fullWidth
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | '')}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Tümü</MenuItem>
            <MenuItem value="OPEN">Açık</MenuItem>
            <MenuItem value="UNDER_REVIEW">İnceleniyor</MenuItem>
            <MenuItem value="ACCEPTED">Kabul Edildi</MenuItem>
            <MenuItem value="REJECTED">Reddedildi</MenuItem>
          </TextField>
          <Button 
            variant="outlined" 
            onClick={() => loadReports(1)}
            disabled={loading}
            sx={{ minWidth: 100 }}
          >
            Filtrele
          </Button>
        </Stack>
      </Paper>

      {/* Reports Table */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tarih</TableCell>
              <TableCell>İlan</TableCell>
              <TableCell>Sebep</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell align="center">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Yükleniyor...</TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">
                    Henüz şikayet bulunmuyor
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>
                    {new Date(report.created_at).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                      {report.listing?.title || report.listing_id}
                    </Typography>
                  </TableCell>
                  <TableCell>{getReasonLabel(report.reason)}</TableCell>
                  <TableCell><StatusChip status={report.status} /></TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openDetail(report)}
                    >
                      Detay
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        <Box p={2} display="flex" justifyContent="center">
          <Pagination
            count={Math.ceil(total / 10)}
            page={page}
            onChange={(_, newPage) => loadReports(newPage)}
            disabled={loading}
          />
        </Box>
      </Paper>

      {/* Detail Dialog */}
      <Dialog 
        open={detailDialog.open} 
        onClose={() => setDetailDialog({ open: false })} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          backgroundColor: 'primary.main', 
          color: 'white',
          borderRadius: '12px 12px 0 0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" component="div">
              Şikayet Detayı
            </Typography>
            {detailDialog.report && (
              <StatusChip status={detailDialog.report.status} />
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, backgroundColor: 'grey.50' }}>
          {detailDialog.report && (
            <Stack spacing={3}>
              {/* Üst Kısım - İlan ve Şikayet Bilgileri */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {/* Sol: İlan Bilgileri */}
                <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        backgroundColor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        📄
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        İlan Bilgileri
                      </Typography>
                    </Box>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Başlık
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {detailDialog.report.listing?.title || 'Bilinmiyor'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          İlan ID
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'monospace', 
                          backgroundColor: 'grey.100', 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1,
                          display: 'inline-block'
                        }}>
                          {detailDialog.report.listing_id}
                        </Typography>
                      </Box>
                      {detailDialog.report.listing?.price && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Fiyat
                          </Typography>
                          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                            ₺{detailDialog.report.listing.price.toLocaleString('tr-TR')}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>

                {/* Sağ: Şikayet Bilgileri */}
                <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        backgroundColor: 'warning.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        ⚠️
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Şikayet Bilgileri
                      </Typography>
                    </Box>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Sebep
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {getReasonLabel(detailDialog.report.reason)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                          İşlem Geçmişi
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(detailDialog.report.created_at).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} • Oluşturuldu
                        </Typography>
                        <Typography variant="caption" color="primary.main" sx={{ fontStyle: 'italic' }}>
                          Report created
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                          Açıklama
                        </Typography>
                        <Paper sx={{ 
                          p: 2, 
                          backgroundColor: 'grey.100', 
                          border: '1px solid',
                          borderColor: 'grey.200',
                          borderRadius: 2,
                          maxHeight: 120,
                          overflow: 'auto'
                        }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {detailDialog.report.description}
                          </Typography>
                        </Paper>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              {/* Admin Değerlendirmesi */}
              {detailDialog.report.resolution_note && (
                <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        backgroundColor: detailDialog.report.status === 'ACCEPTED' ? 'success.main' : 'error.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        {detailDialog.report.status === 'ACCEPTED' ? '✅' : '❌'}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Admin Değerlendirmesi
                      </Typography>
                    </Box>
                    <Paper sx={{ 
                      p: 2, 
                      backgroundColor: detailDialog.report.status === 'ACCEPTED' ? 'success.light' : 'error.light',
                      border: '1px solid',
                      borderColor: detailDialog.report.status === 'ACCEPTED' ? 'success.main' : 'error.main',
                      borderRadius: 2
                    }}>
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        {detailDialog.report.resolution_note}
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, backgroundColor: 'white' }}>
          <Button 
            onClick={() => setDetailDialog({ open: false })}
            variant="contained"
            sx={{ borderRadius: 2, px: 4 }}
          >
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyReportsPage;
