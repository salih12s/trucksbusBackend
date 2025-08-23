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
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Card,
  CardContent,
  Stack,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  Delete as RemoveIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { reportService, getReasonLabel, type Report, type ReportStatus } from '../../services/reportService';
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

  const labelMap: Record<ReportStatus, string> = {
    'OPEN': 'Açık',
    'UNDER_REVIEW': 'İnceleniyor',
    'ACCEPTED': 'Kabul Edildi',
    'REJECTED': 'Reddedildi',
  };

  return (
    <Chip
      label={labelMap[status]}
      color={colorMap[status]}
      size="small"
      variant="outlined"
    />
  );
}

const AdminReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { showSuccessNotification, showErrorNotification } = useNotification();
  const { socket } = useWebSocketContext();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('ALL');
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; report?: Report }>({ open: false });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; reportId?: string }>({ open: false });
  const [rejectNote, setRejectNote] = useState('');
  const [newReportBanner, setNewReportBanner] = useState(false);

  // Socket listener for new reports
  useEffect(() => {
    if (!socket) return;

    const handleNewReport = () => {
      setNewReportBanner(true);
    };

    socket.on('admin:report:new', handleNewReport);
    return () => {
      socket.off('admin:report:new', handleNewReport);
    };
  }, [socket]);

  const loadReports = useCallback(async (pageNumber: number = 1) => {
    try {
      setLoading(true);
      const params: any = { page: pageNumber, limit: 20 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchQuery.trim()) params.q = searchQuery.trim();

      const response = await reportService.adminGetReports(params);
      
      // Backend'den items array'i geliyor
      setReports(response.items || []);
      setTotal(response.total || 0);
      setPage(pageNumber);
    } catch (error: any) {
      console.error('Load reports error:', error);
      showErrorNotification('Şikayetler yüklenemedi: ' + (error?.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, showErrorNotification]);

  useEffect(() => {
    loadReports(1);
  }, [loadReports]);

  const openDetail = async (reportId: string) => {
    try {
      const detail = await reportService.adminGetReportDetail(reportId);
      setDetailDialog({ open: true, report: detail });
    } catch (error: any) {
      showErrorNotification(error?.response?.data?.message || 'Detay yüklenemedi');
    }
  };

  const handleUnderReview = async (reportId: string) => {
    try {
      await reportService.adminUpdateReportStatus(reportId, {
        status: 'UNDER_REVIEW',
      });
      
      showSuccessNotification('Şikayet incelemeye alındı');
      loadReports(page);
    } catch (error: any) {
      showErrorNotification(error?.response?.data?.message || 'İşlem başarısız');
    }
  };

  const handleAccept = async (reportId: string, removeListing: boolean = false) => {
    try {
      await reportService.adminUpdateReportStatus(reportId, {
        status: 'ACCEPTED',
        removeListing,
      });
      
      showSuccessNotification(removeListing ? 'Şikayet kabul edildi ve ilan kaldırıldı' : 'Şikayet kabul edildi');
      loadReports(page);
    } catch (error: any) {
      showErrorNotification(error?.response?.data?.message || 'İşlem başarısız');
    }
  };

  const openRejectDialog = (reportId: string) => {
    setRejectDialog({ open: true, reportId });
    setRejectNote('');
  };

  const handleReject = async () => {
    if (!rejectDialog.reportId || !rejectNote.trim()) return;
    
    try {
      await reportService.adminUpdateReportStatus(rejectDialog.reportId, {
        status: 'REJECTED',
        resolutionNote: rejectNote.trim(),
      });
      
      showSuccessNotification('Şikayet reddedildi ve kullanıcıya bildirim gönderildi');
      setRejectDialog({ open: false });
      setRejectNote('');
      loadReports(page);
    } catch (error: any) {
      showErrorNotification(error?.response?.data?.message || 'İşlem başarısız');
    }
  };

  const refreshList = () => {
    setNewReportBanner(false);
    loadReports(page);
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <Box p={3}>
        <Alert severity="error">Bu sayfaya erişim yetkiniz yok.</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box sx={{ 
        mb: 3, 
        pb: 2, 
        borderBottom: '2px solid #e2e8f0',
        textAlign: 'center'
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            color: '#1e293b',
            mb: 1
          }}
        >
          📋 Şikayet Yönetimi
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: '#64748b'
          }}
        >
          Kullanıcı şikayetlerini inceleyin ve yönetin
        </Typography>
      </Box>

      {/* New Report Banner */}
      {newReportBanner && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={refreshList}>
              Yenile
            </Button>
          }
        >
          Yeni şikayet geldi! Listeyi yenilemek için "Yenile" butonuna tıklayın.
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Ara"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="İlan başlığı, şikayet eden kişi..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <TextField
            select
            label="Durum"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'ALL')}
            sx={{ 
              minWidth: 140,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          >
            <MenuItem value="ALL">Tümü</MenuItem>
            <MenuItem value="OPEN">Açık</MenuItem>
            <MenuItem value="UNDER_REVIEW">İnceleniyor</MenuItem>
            <MenuItem value="ACCEPTED">Kabul Edildi</MenuItem>
            <MenuItem value="REJECTED">Reddedildi</MenuItem>
          </TextField>
          <Button 
            variant="contained" 
            onClick={() => loadReports(1)}
            disabled={loading}
            sx={{ 
              borderRadius: 2,
              fontWeight: 600,
              minWidth: 100
            }}
          >
            Filtrele
          </Button>
        </Stack>
      </Paper>

      {/* Reports Table */}
      <Paper 
        elevation={1}
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
      >
        <Table>
          <TableHead>
            <TableRow 
              sx={{ 
                backgroundColor: '#f8fafc',
                '& .MuiTableCell-head': {
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#374151',
                  borderBottom: '2px solid #e2e8f0'
                }
              }}
            >
              <TableCell>Tarih</TableCell>
              <TableCell>İlan</TableCell>
              <TableCell>Şikayet Eden</TableCell>
              <TableCell>Sebep</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell align="center">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <Typography>Yükleniyor...</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Şikayet bulunamadı</Typography>
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow 
                  key={report.id} 
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f8fafc'
                    },
                    '& .MuiTableCell-root': {
                      borderBottom: '1px solid #f1f5f9',
                      py: 2
                    }
                  }}
                >
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(report.created_at).toLocaleDateString('tr-TR')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200, fontWeight: 500 }}>
                      {report.listing?.title || report.listing_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {report.reporter ? 
                        `${report.reporter.first_name} ${report.reporter.last_name}` : 
                        report.reporter_id
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getReasonLabel(report.reason)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={report.status} />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 0.5, 
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Tooltip title="Detayları Görüntüle">
                        <IconButton 
                          size="small" 
                          onClick={() => openDetail(report.id)}
                          sx={{
                            backgroundColor: 'rgba(99, 102, 241, 0.08)',
                            '&:hover': {
                              backgroundColor: 'rgba(99, 102, 241, 0.16)',
                              transform: 'scale(1.05)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {report.status === 'OPEN' || report.status === 'UNDER_REVIEW' ? (
                        <>
                          {report.status === 'OPEN' && (
                            <Tooltip title="İnceleme Aşamasına Al">
                              <IconButton 
                                size="small" 
                                color="info"
                                onClick={() => handleUnderReview(report.id)}
                                sx={{
                                  backgroundColor: 'rgba(14, 165, 233, 0.08)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(14, 165, 233, 0.16)',
                                    transform: 'scale(1.05)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          <Tooltip title="Kabul Et">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleAccept(report.id, false)}
                              sx={{
                                backgroundColor: 'rgba(34, 197, 94, 0.08)',
                                '&:hover': {
                                  backgroundColor: 'rgba(34, 197, 94, 0.16)',
                                  transform: 'scale(1.05)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <AcceptIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Kabul Et + İlanı Kaldır">
                            <IconButton 
                              size="small" 
                              color="warning"
                              onClick={() => handleAccept(report.id, true)}
                              sx={{
                                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                                '&:hover': {
                                  backgroundColor: 'rgba(245, 158, 11, 0.16)',
                                  transform: 'scale(1.05)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Reddet">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => openRejectDialog(report.id)}
                              sx={{
                                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                '&:hover': {
                                  backgroundColor: 'rgba(239, 68, 68, 0.16)',
                                  transform: 'scale(1.05)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : null}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        <Box p={2} display="flex" justifyContent="center">
          <Pagination
            count={Math.ceil(total / 20)}
            page={page}
            onChange={(_, newPage) => loadReports(newPage)}
            disabled={loading}
          />
        </Box>
      </Paper>

      {/* Detail Dialog - Sade ve Temiz Tasarım */}
      <Dialog 
        open={detailDialog.open} 
        onClose={() => setDetailDialog({ open: false })} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: '1px solid #e2e8f0'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            fontWeight: 600,
            color: '#1e293b'
          }}
        >
          Şikayet Detayı
        </DialogTitle>
        <DialogContent>
          {detailDialog.report && (
            <Box sx={{ py: 2 }}>
              {/* İlan Bilgileri */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#374151' }}>
                  İlan Bilgileri
                </Typography>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Başlık</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {detailDialog.report.listing?.title || 'Bilinmiyor'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">İlan ID</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {detailDialog.report.listing_id}
                        </Typography>
                      </Box>
                      {detailDialog.report.listing?.price && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">Fiyat</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#059669' }}>
                            ₺{Number(detailDialog.report.listing.price).toLocaleString('tr-TR')}
                          </Typography>
                        </Box>
                      )}
                      <Box>
                        <Typography variant="body2" color="text.secondary">İlan Durumu</Typography>
                        <Chip 
                          label={detailDialog.report.listing?.moderation_status || 'ACTIVE'} 
                          size="small"
                          variant="outlined"
                          color={detailDialog.report.listing?.moderation_status === 'ACTIVE' ? 'success' : 'default'}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Şikayet Bilgileri */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#374151' }}>
                  Şikayet Bilgileri
                </Typography>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Sebep</Typography>
                        <Typography variant="body1">{getReasonLabel(detailDialog.report.reason)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Durum</Typography>
                        <StatusChip status={detailDialog.report.status} />
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Şikayet Açıklaması
                      </Typography>
                      <Box sx={{ 
                        backgroundColor: '#f8fafc', 
                        p: 2, 
                        borderRadius: 1,
                        border: '1px solid #e2e8f0',
                        maxHeight: 120,
                        overflow: 'auto'
                      }}>
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                          {detailDialog.report.description}
                        </Typography>
                      </Box>
                    </Box>
                    {detailDialog.report.resolution_note && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Admin Değerlendirme Notu
                        </Typography>
                        <Box sx={{ 
                          backgroundColor: '#fef3c7', 
                          p: 2, 
                          borderRadius: 1,
                          border: '1px solid #fde68a'
                        }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {detailDialog.report.resolution_note}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>

              {/* Kullanıcı Bilgileri */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#374151' }}>
                  Kullanıcı Bilgileri
                </Typography>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Şikayet Eden</Typography>
                        <Typography variant="body1">
                          {detailDialog.report.reporter ? 
                            `${detailDialog.report.reporter.first_name} ${detailDialog.report.reporter.last_name}` : 
                            'Bilinmiyor'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">İlan Sahibi</Typography>
                        <Typography variant="body1">
                          {detailDialog.report.owner ? 
                            `${detailDialog.report.owner.first_name} ${detailDialog.report.owner.last_name}` : 
                            'Bilinmiyor'}
                        </Typography>
                      </Box>
                      {detailDialog.report.reviewer && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">İnceleyen Admin</Typography>
                          <Typography variant="body1">
                            {`${detailDialog.report.reviewer.first_name} ${detailDialog.report.reviewer.last_name}`}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* İşlem Geçmişi */}
              {detailDialog.report?.history && detailDialog.report.history.length > 0 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, color: '#374151' }}>
                    İşlem Geçmişi
                  </Typography>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: 0 }}>
                      <List>
                        {detailDialog.report.history.map((historyItem, index) => (
                          <React.Fragment key={historyItem.id}>
                            <ListItem sx={{ py: 2 }}>
                              <ListItemText
                                disableTypography
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Chip 
                                        size="small"
                                        label={
                                          historyItem.action === 'CREATE' ? 'Oluşturuldu' :
                                          historyItem.action === 'STATUS_CHANGE' ? 'Durum Değişti' :
                                          historyItem.action === 'LISTING_REMOVED' ? 'İlan Kaldırıldı' :
                                          historyItem.action === 'NOTE_ADDED' ? 'Not Eklendi' : historyItem.action
                                        }
                                        color={
                                          historyItem.action === 'CREATE' ? 'info' :
                                          historyItem.action === 'STATUS_CHANGE' ? 'warning' :
                                          historyItem.action === 'LISTING_REMOVED' ? 'error' : 'default'
                                        }
                                        variant="outlined"
                                      />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(historyItem.created_at).toLocaleDateString('tr-TR', {
                                        day: '2-digit',
                                        month: '2-digit', 
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </Typography>
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    {historyItem.action === 'STATUS_CHANGE' && (
                                      <Typography variant="body2" component="div" sx={{ mb: 0.5 }}>
                                        <strong>Durum:</strong> {historyItem.from_status} → {historyItem.to_status}
                                      </Typography>
                                    )}
                                    {historyItem.note && (
                                      <Typography variant="body2" component="div" sx={{ fontStyle: 'italic', mb: 0.5 }}>
                                        <strong>Not:</strong> {historyItem.note}
                                      </Typography>
                                    )}
                                    {historyItem.actor && (
                                      <Typography variant="caption" color="text.secondary">
                                        <strong>İşlem Yapan:</strong> {`${historyItem.actor.first_name} ${historyItem.actor.last_name}`}
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                            {index < (detailDialog.report?.history?.length ?? 0) - 1 && (
                              <Divider />
                            )}
                          </React.Fragment>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button 
            onClick={() => setDetailDialog({ open: false })}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog - Sade Tasarım */}
      <Dialog 
        open={rejectDialog.open} 
        onClose={() => setRejectDialog({ open: false })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: '1px solid #e2e8f0'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#fef2f2',
            fontWeight: 600,
            color: '#dc2626'
          }}
        >
          Şikayeti Reddet
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 2,
              borderRadius: 2,
              backgroundColor: '#fffbeb',
              border: '1px solid #fed7aa'
            }}
          >
            <Typography variant="body2">
              <strong>Dikkat:</strong> Bu işlem geri alınamaz. Reddetme gerekçeniz 
              şikayet eden kullanıcıya bildirim olarak gönderilecektir.
            </Typography>
          </Alert>
          <TextField
            autoFocus
            margin="dense"
            label="Reddetme Gerekçesi"
            multiline
            minRows={4}
            maxRows={8}
            fullWidth
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Şikayet neden reddediliyor? Detaylı açıklama yazınız..."
            helperText={`Bu gerekçe şikayet eden kullanıcıya gönderilecektir. (${rejectNote.length}/500)`}
            inputProps={{ maxLength: 500 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, borderTop: '1px solid #e2e8f0' }}>
          <Button 
            onClick={() => setRejectDialog({ open: false })}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            İptal
          </Button>
          <Button 
            onClick={handleReject} 
            variant="contained" 
            color="error"
            disabled={!rejectNote.trim() || rejectNote.length < 10}
            sx={{ 
              borderRadius: 2,
              fontWeight: 600
            }}
          >
            Reddet ve Kullanıcıya Bildir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminReportsPage;
