import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  List,
  ListItem,
  ListItemText,
  Divider,
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
  const bannerTimer = useRef<number | null>(null);

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
  }, [statusFilter, isAuthenticated, showErrorNotification]);

  // Load reports on mount and filter changes
  useEffect(() => {
    loadReports(1);
  }, [loadReports]);

  // Socket listener for report status updates
  useEffect(() => {
    if (!socket || !user) return;
    
    const handleReportUpdate = (payload: any) => {
      console.log('📝 Report status updated:', payload);
      
      if (payload.reporterId === user.id) {
        setStatusUpdateBanner(
          `Şikayetiniz ${getStatusLabel(payload.newStatus).toLowerCase()} durumuna geçti.`
        );
        // Auto-hide banner after 5 seconds with cleanup
        if (bannerTimer.current) window.clearTimeout(bannerTimer.current);
        bannerTimer.current = window.setTimeout(() => setStatusUpdateBanner(null), 5000);
        // Refresh the list
        loadReports(page);
      }
    };
    
    socket.on('user:report:status-update', handleReportUpdate);
    return () => {
      if (bannerTimer.current) window.clearTimeout(bannerTimer.current);
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
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Şikayet Detayı</DialogTitle>
        <DialogContent dividers>
          {detailDialog.report && (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              {/* Sol: İlan Bilgileri */}
              <Box sx={{ flex: 1 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>İlan Bilgileri</Typography>
                    <Typography><strong>Başlık:</strong> {detailDialog.report.listing?.title}</Typography>
                    <Typography><strong>ID:</strong> {detailDialog.report.listing_id}</Typography>
                    {detailDialog.report.listing?.price && (
                      <Typography><strong>Fiyat:</strong> ₺{detailDialog.report.listing.price.toLocaleString()}</Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>

              {/* Sağ: Şikayet Bilgileri */}
              <Box sx={{ flex: 1 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Şikayet Bilgileri</Typography>
                    <Typography><strong>Sebep:</strong> {getReasonLabel(detailDialog.report.reason)}</Typography>
                    <Typography><strong>Durum:</strong></Typography>
                    <Box sx={{ mb: 1 }}>
                      <StatusChip status={detailDialog.report.status} />
                    </Box>
                    <Typography><strong>Açıklama:</strong></Typography>
                    <Typography variant="body2" sx={{ 
                      backgroundColor: 'grey.100', 
                      p: 1, 
                      borderRadius: 1, 
                      mt: 0.5,
                      maxHeight: 100,
                      overflow: 'auto'
                    }}>
                      {detailDialog.report.description}
                    </Typography>
                    
                    {detailDialog.report.resolution_note && (
                      <>
                        <Typography sx={{ mt: 2 }}><strong>Admin Değerlendirmesi:</strong></Typography>
                        <Typography variant="body2" sx={{ 
                          backgroundColor: detailDialog.report.status === 'ACCEPTED' ? 'success.light' : 'error.light', 
                          p: 1, 
                          borderRadius: 1, 
                          mt: 0.5 
                        }}>
                          {detailDialog.report.resolution_note}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Box>

              {/* Alt: İşlem Geçmişi */}
              {detailDialog.report.history && detailDialog.report.history.length > 0 && (
                <Box sx={{ width: '100%' }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>İşlem Geçmişi</Typography>
                      <List dense>
                        {detailDialog.report.history.map((historyItem, index) => (
                          <React.Fragment key={historyItem.id}>
                            <ListItem>
                              <ListItemText
                                disableTypography
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" component="span" color="text.secondary">
                                      {new Date(historyItem.created_at).toLocaleString('tr-TR')}
                                    </Typography>
                                    <Chip 
                                      size="small"
                                      label={
                                        historyItem.action === 'CREATE' ? 'Oluşturuldu' :
                                        historyItem.action === 'STATUS_CHANGE' ? 'Durum Değişti' :
                                        historyItem.action === 'LISTING_REMOVED' ? 'İlan Kaldırıldı' :
                                        historyItem.action === 'NOTE_ADDED' ? 'Not Eklendi' : historyItem.action
                                      }
                                      variant="outlined"
                                    />
                                  </Box>
                                }
                                secondary={
                                  <Box sx={{ mt: 0.5 }}>
                                    {historyItem.action === 'STATUS_CHANGE' && (
                                      <Typography variant="body2" component="span">
                                        {historyItem.from_status} → {historyItem.to_status}
                                      </Typography>
                                    )}
                                    {historyItem.note && (
                                      <Typography variant="body2" component="span" sx={{ fontStyle: 'italic', ml: 1 }}>
                                        {historyItem.note}
                                      </Typography>
                                    )}
                                    {historyItem.actor && (
                                      <Typography variant="caption" component="span" color="text.secondary" sx={{ ml: 1 }}>
                                        {`${historyItem.actor.first_name} ${historyItem.actor.last_name}`}
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                            {index < (detailDialog.report?.history?.length ?? 0) - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog({ open: false })}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyReportsPage;
