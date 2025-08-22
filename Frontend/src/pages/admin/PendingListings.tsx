import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Card,
  CardHeader,
  CardContent,
  Paper,
  Divider,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  Visibility,
  Refresh,
  PendingActions,
  Assignment,
  Schedule,
  Person,
  LocationOn,
  Category,
  Euro,
} from '@mui/icons-material';

import { 
  usePendingListings, 
  useApproveListing, 
  useRejectListing,
  type AdminListing 
} from '../../hooks/admin';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { formatTRY, formatDateTR } from '../../utils/format';
import AdminGuard from '../../components/admin/AdminGuard';
import DataTable, { DataTableColumn } from '../../components/admin/DataTable';
import AdminListingDetailModal from '../../components/admin/AdminListingDetailModal';

const PendingListings: React.FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Dialog states
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    listingId: string;
    listingTitle: string;
  }>({
    open: false,
    listingId: '',
    listingTitle: ''
  });
  const [rejectReason, setRejectReason] = useState('');
  
  // Detail modal state
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    listingId: string | null;
  }>({
    open: false,
    listingId: null
  });

  // React Query hooks
  const { confirm } = useConfirmDialog();
  const { 
    data: pendingListings, 
    isLoading, 
    error, 
    refetch 
  } = usePendingListings({
    page: page + 1, // DataTable uses 0-based, backend uses 1-based
    pageSize,
    sort,
    order
  });

  const approveMutation = useApproveListing();
  const rejectMutation = useRejectListing();

  // Event handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0); // Reset to first page
  };

  const handleSortChange = (newSort: string, newOrder: 'asc' | 'desc') => {
    setSort(newSort);
    setOrder(newOrder);
  };

  const handleApprove = async (listingId: string) => {
    const confirmed = await confirm({
      title: 'İlanı onayla?',
      description: 'Bu ilanı yayına almak istiyor musunuz?',
      severity: 'success',
      confirmText: 'Onayla',
      cancelText: 'Vazgeç'
    });

    if (!confirmed) return;

    try {
      await approveMutation.mutateAsync(listingId);
      // Success handled by optimistic updates
    } catch (error: any) {
      console.error('Approve error:', error);
      // Error handling could show a toast notification
    }
  };

  const handleRejectClick = (listing: AdminListing) => {
    setRejectDialog({
      open: true,
      listingId: listing.id,
      listingTitle: listing.title
    });
    setRejectReason('');
  };

  const handleRejectConfirm = async () => {
    if (!rejectDialog.listingId) return;

    try {
      await rejectMutation.mutateAsync({
        listingId: rejectDialog.listingId,
        reason: rejectReason || 'Moderatör tarafından uygun görülmedi'
      });
      
      setRejectDialog({ open: false, listingId: '', listingTitle: '' });
      setRejectReason('');
    } catch (error: any) {
      console.error('Reject error:', error);
    }
  };

  const handleRejectCancel = () => {
    setRejectDialog({ open: false, listingId: '', listingTitle: '' });
    setRejectReason('');
  };

  // Table columns
  const columns: DataTableColumn<AdminListing>[] = [
    {
      id: 'title',
      label: 'İlan Başlığı',
      sortable: true,
      width: '25%',
      render: (value, row) => (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {row.categories?.name} • {row.brands?.name} {row.models?.name}
          </Typography>
        </Box>
      )
    },
    {
      id: 'users',
      label: 'İlan Sahibi',
      width: '20%',
      render: (_, row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {row.users.first_name} {row.users.last_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.users.email}
          </Typography>
        </Box>
      )
    },
    {
      id: 'price',
      label: 'Fiyat',
      sortable: true,
      width: '15%',
      align: 'right',
      render: (value) => (
        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
          {formatTRY(value)}
        </Typography>
      )
    },
    {
      id: 'cities',
      label: 'Konum',
      width: '15%',
      render: (_, row) => (
        <Chip 
          label={`${row.cities?.name}${row.districts ? ` / ${row.districts.name}` : ''}`}
          size="small" 
          variant="outlined"
        />
      )
    },
    {
      id: 'created_at',
      label: 'İlan Tarihi',
      sortable: true,
      width: '10%',
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {formatDateTR(value)}
        </Typography>
      )
    },
    {
      id: 'actions',
      label: 'İşlemler',
      width: '15%',
      align: 'center',
      render: (_, row) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title="İlanı Görüntüle">
            <IconButton 
              size="small"
              onClick={() => setDetailModal({ open: true, listingId: row.id })}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Onayla">
            <IconButton 
              size="small" 
              color="success"
              onClick={() => handleApprove(row.id)}
              disabled={approveMutation.isPending}
            >
              <CheckCircle fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reddet">
            <IconButton 
              size="small" 
              color="error"
              onClick={() => handleRejectClick(row)}
              disabled={rejectMutation.isPending}
            >
              <Cancel fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <AdminGuard>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Card */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <PendingActions sx={{ fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Onay Bekleyen İlanlar
                  </Typography>
                  {pendingListings && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        icon={<Assignment />}
                        label={`${pendingListings.count} ilan bekliyor`}
                        color="warning"
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        icon={<Schedule />}
                        label="Otomatik yenileme aktif"
                        color="info"
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  )}
                </Box>
              </Box>
              
              <Button
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
                onClick={() => refetch()}
                disabled={isLoading}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                  }
                }}
              >
                {isLoading ? 'Yenileniyor...' : 'Yenile'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Status Alert */}
        {pendingListings && pendingListings.count > 0 && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
            action={
              <Chip 
                label="Acil" 
                color="warning" 
                size="small"
                variant="outlined"
              />
            }
          >
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              <strong>{pendingListings.count} ilan</strong> onayınızı bekliyor. 
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
              İlanları inceleyip onaylayabilir veya reddedebilirsiniz.
            </Typography>
          </Alert>
        )}

        {/* Data Table Card */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <CardHeader
            title={
              <Box display="flex" alignItems="center" gap={1}>
                <Assignment color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  İlan Listesi
                </Typography>
              </Box>
            }
            action={
              pendingListings && (
                <Chip
                  label={`${pendingListings.count} kayıt`}
                  color="primary"
                  variant="outlined"
                />
              )
            }
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              bgcolor: 'grey.50'
            }}
          />
          <CardContent sx={{ p: 0 }}>
            <DataTable<AdminListing>
              columns={columns}
              rows={pendingListings?.data || []}
              page={page}
              pageSize={pageSize}
              totalCount={pendingListings?.count || 0}
              sort={sort}
              order={order}
              loading={isLoading}
              error={error}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSortChange={handleSortChange}
              onRetry={() => refetch()}
              emptyMessage="Onay bekleyen ilan bulunamadı"
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </CardContent>
        </Card>

        {/* Reject Dialog */}
        <Dialog
          open={rejectDialog.open}
          onClose={handleRejectCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>İlanı Reddet</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>"{rejectDialog.listingTitle}"</strong> başlıklı ilanı reddetmek istediğinizden emin misiniz?
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Red Sebebi (İsteğe bağlı)"
              placeholder="İlan reddetme sebebinizi yazabilirsiniz..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRejectCancel}>
              İptal
            </Button>
            <Button 
              onClick={handleRejectConfirm}
              variant="contained"
              color="error"
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? 'Reddediliyor...' : 'İlanı Reddet'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* İlan Detay Modal'ı */}
        <AdminListingDetailModal
          open={detailModal.open}
          onClose={() => setDetailModal({ open: false, listingId: null })}
          listingId={detailModal.listingId}
          onApprove={handleApprove}
          onReject={(listing) => {
            setDetailModal({ open: false, listingId: null });
            handleRejectClick(listing);
          }}
        />
      </Container>
    </AdminGuard>
  );
};

export default PendingListings;
