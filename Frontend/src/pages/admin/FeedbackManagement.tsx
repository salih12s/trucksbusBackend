import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Reply as ReplyIcon,
  CheckCircle as ResolvedIcon,
  Schedule as PendingIcon,
  Error as UrgentIcon,
  TrendingUp,
  Assessment,
  Feedback as FeedbackIcon
} from '@mui/icons-material';
import { api } from '../../services/api';

interface FeedbackItem {
  id: string;
  type: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  admin_response?: string;
  responded_at?: string;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  admin?: {
    first_name: string;
    last_name: string;
  };
}

interface FeedbackStats {
  total: number;
  open: number;
  resolved: number;
  urgent: number;
  today: number;
  byType: Array<{ type: string; _count: { _all: number } }>;
  byPriority: Array<{ priority: string; _count: { _all: number } }>;
}

const FEEDBACK_TYPES = {
  COMPLAINT: 'Şikayet',
  SUGGESTION: 'Öneri',
  BUG_REPORT: 'Hata Bildirimi',
  FEATURE_REQUEST: 'Özellik Talebi',
  GENERAL: 'Genel'
};

const FEEDBACK_STATUS = {
  OPEN: 'Açık',
  IN_PROGRESS: 'İşlemde',
  RESOLVED: 'Çözüldü',
  CLOSED: 'Kapatıldı'
};

const PRIORITY_LEVELS = {
  LOW: 'Düşük',
  MEDIUM: 'Orta',
  HIGH: 'Yüksek',
  URGENT: 'Acil'
};

const FeedbackManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [responseDialog, setResponseDialog] = useState(false);
  const [response, setResponse] = useState('');
  const [responseStatus, setResponseStatus] = useState<'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('RESOLVED');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, [page, rowsPerPage, statusFilter, typeFilter, priorityFilter]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
        ...(priorityFilter && { priority: priorityFilter })
      });

      const response = await api.get(`/admin/feedback?${params}`);
      if (response.data.success) {
        setFeedbacks(response.data.data.feedbacks || []);
        setTotal(response.data.data.pagination?.total_items || 0);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/feedback/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewDetails = async (feedbackId: string) => {
    try {
      const response = await api.get(`/admin/feedback/${feedbackId}`);
      if (response.data.success) {
        setSelectedFeedback(response.data.data);
        setDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching feedback details:', error);
    }
  };

  const handleRespond = (feedback: FeedbackItem) => {
    setSelectedFeedback(feedback);
    setResponse(feedback.admin_response || '');
    setResponseStatus('RESOLVED');
    setResponseDialog(true);
  };

  const submitResponse = async () => {
    if (!selectedFeedback || !response.trim()) return;

    try {
      await api.post(`/admin/feedback/${selectedFeedback.id}/respond`, {
        response: response.trim(),
        status: responseStatus
      });

      setResponseDialog(false);
      setResponse('');
      setSelectedFeedback(null);
      fetchFeedbacks();
      fetchStats();
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'success';
      case 'IN_PROGRESS': return 'warning';
      case 'CLOSED': return 'default';
      case 'OPEN': return 'error';
      default: return 'default';
    }
  };

  const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({
    title, value, icon, color
  }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Box sx={{ color, opacity: 0.7 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        🎯 Geri Bildirim Yönetimi
      </Typography>

      {/* İstatistik Kartları */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard
              title="Toplam Geri Bildirim"
              value={stats.total}
              icon={<FeedbackIcon fontSize="large" />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard
              title="Açık Olanlar"
              value={stats.open}
              icon={<PendingIcon fontSize="large" />}
              color="#ed6c02"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard
              title="Çözülenler"
              value={stats.resolved}
              icon={<ResolvedIcon fontSize="large" />}
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Acil Olanlar"
              value={stats.urgent}
              icon={<UrgentIcon fontSize="large" />}
              color="#d32f2f"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Bugünkiler"
              value={stats.today}
              icon={<TrendingUp fontSize="large" />}
              color="#7b1fa2"
            />
          </Grid>
        </Grid>
      )}

      {/* Ana İçerik */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Tüm Geri Bildirimler" />
          <Tab label={<Badge badgeContent={stats?.open || 0} color="error">Açık Olanlar</Badge>} />
          <Tab label="İstatistikler" />
        </Tabs>

        {activeTab === 0 || activeTab === 1 ? (
          <Box sx={{ p: 2 }}>
            {/* Filtreler */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={statusFilter}
                  label="Durum"
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {Object.entries(FEEDBACK_STATUS).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Tip</InputLabel>
                <Select
                  value={typeFilter}
                  label="Tip"
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {Object.entries(FEEDBACK_TYPES).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Öncelik</InputLabel>
                <Select
                  value={priorityFilter}
                  label="Öncelik"
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {Object.entries(PRIORITY_LEVELS).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                onClick={() => {
                  setStatusFilter('');
                  setTypeFilter('');
                  setPriorityFilter('');
                  setPage(0);
                }}
              >
                Filtreleri Temizle
              </Button>
            </Box>

            {/* Tablo */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Konu</TableCell>
                    <TableCell>Kullanıcı</TableCell>
                    <TableCell>Tip</TableCell>
                    <TableCell>Öncelik</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell align="right">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : feedbacks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Geri bildirim bulunamadı
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    feedbacks.map((feedback) => (
                      <TableRow key={feedback.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" noWrap sx={{ maxWidth: 200 }}>
                            {feedback.subject}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {feedback.user.first_name} {feedback.user.last_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {feedback.user.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={FEEDBACK_TYPES[feedback.type as keyof typeof FEEDBACK_TYPES] || feedback.type}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={PRIORITY_LEVELS[feedback.priority as keyof typeof PRIORITY_LEVELS] || feedback.priority}
                            size="small"
                            color={getPriorityColor(feedback.priority) as any}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={FEEDBACK_STATUS[feedback.status as keyof typeof FEEDBACK_STATUS] || feedback.status}
                            size="small"
                            color={getStatusColor(feedback.status) as any}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {new Date(feedback.created_at).toLocaleDateString('tr-TR')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Detayları Görüntüle">
                            <IconButton size="small" onClick={() => handleViewDetails(feedback.id)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Yanıtla">
                            <IconButton size="small" onClick={() => handleRespond(feedback)}>
                              <ReplyIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Sayfa başına:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
            />
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📊 Detaylı İstatistikler
            </Typography>
            {stats && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Tip Bazında Dağılım</Typography>
                      {stats.byType.map((item) => (
                        <Box key={item.type} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            {FEEDBACK_TYPES[item.type as keyof typeof FEEDBACK_TYPES] || item.type}
                          </Typography>
                          <Chip label={item._count._all} size="small" />
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Öncelik Bazında Dağılım</Typography>
                      {stats.byPriority.map((item) => (
                        <Box key={item.priority} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            {PRIORITY_LEVELS[item.priority as keyof typeof PRIORITY_LEVELS] || item.priority}
                          </Typography>
                          <Chip
                            label={item._count._all}
                            size="small"
                            color={getPriorityColor(item.priority) as any}
                          />
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
      </Paper>

      {/* Detay Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Geri Bildirim Detayları</DialogTitle>
        <DialogContent>
          {selectedFeedback && (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={FEEDBACK_TYPES[selectedFeedback.type as keyof typeof FEEDBACK_TYPES]} />
                <Chip label={PRIORITY_LEVELS[selectedFeedback.priority as keyof typeof PRIORITY_LEVELS]} />
                <Chip label={FEEDBACK_STATUS[selectedFeedback.status as keyof typeof FEEDBACK_STATUS]} />
              </Box>
              
              <Typography variant="h6" gutterBottom>
                {selectedFeedback.subject}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Gönderen: {selectedFeedback.user.first_name} {selectedFeedback.user.last_name} ({selectedFeedback.user.email})
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tarih: {new Date(selectedFeedback.created_at).toLocaleString('tr-TR')}
              </Typography>
              
              <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedFeedback.message}
                </Typography>
              </Paper>

              {selectedFeedback.admin_response && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Admin Yanıtı:
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                    <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                      {selectedFeedback.admin_response}
                    </Typography>
                    {selectedFeedback.admin && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Yanıtlayan: {selectedFeedback.admin.first_name} {selectedFeedback.admin.last_name} - 
                        {selectedFeedback.responded_at && ` ${new Date(selectedFeedback.responded_at).toLocaleString('tr-TR')}`}
                      </Typography>
                    )}
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Kapat</Button>
          {selectedFeedback && (
            <Button
              variant="contained"
              onClick={() => {
                setDialogOpen(false);
                handleRespond(selectedFeedback);
              }}
            >
              Yanıtla
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Yanıt Dialog */}
      <Dialog open={responseDialog} onClose={() => setResponseDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedFeedback?.admin_response ? 'Yanıtı Güncelle' : 'Yanıt Ver'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Durum</InputLabel>
              <Select
                value={responseStatus}
                label="Durum"
                onChange={(e) => setResponseStatus(e.target.value as any)}
              >
                <MenuItem value="IN_PROGRESS">İşlemde</MenuItem>
                <MenuItem value="RESOLVED">Çözüldü</MenuItem>
                <MenuItem value="CLOSED">Kapatıldı</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Yanıtınız"
              multiline
              rows={6}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Geri bildirime yanıtınızı yazınız..."
              inputProps={{ maxLength: 2000 }}
              helperText={`${response.length}/2000`}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialog(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={submitResponse}
            disabled={!response.trim()}
          >
            Yanıtı Gönder
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FeedbackManagement;
