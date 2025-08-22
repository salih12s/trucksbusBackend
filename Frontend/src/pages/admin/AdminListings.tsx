import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import { 
  Assignment,
  Refresh,
  Search,
  FilterList,
  Visibility,
  Edit,
  Delete,
} from '@mui/icons-material';

import { 
  useAdminListings,
  type AdminListing 
} from '../../hooks/admin';
import { formatTRY, formatDateTR } from '../../utils/format';
import AdminGuard from '../../components/admin/AdminGuard';
import DataTable, { DataTableColumn } from '../../components/admin/DataTable';

const AdminListings: React.FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'INACTIVE' | 'PENDING' | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  // React Query hooks
  const { 
    data: listings, 
    isLoading, 
    error, 
    refetch 
  } = useAdminListings({
    page: page + 1, // DataTable uses 0-based, backend uses 1-based
    pageSize,
    sort,
    order,
    filters: {
      ...(statusFilter && { status: statusFilter }),
      ...(searchTerm && { search: searchTerm }),
    }
  });

  // Event handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  const handleSortChange = (newSort: string, newOrder: 'asc' | 'desc') => {
    setSort(newSort);
    setOrder(newOrder);
  };

  const handleStatusFilterChange = (status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | '') => {
    setStatusFilter(status);
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      case 'INACTIVE': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Aktif';
      case 'PENDING': return 'Beklemede';
      case 'REJECTED': return 'Reddedildi';
      case 'INACTIVE': return 'Pasif';
      default: return status;
    }
  };

  // Table columns
  const columns: DataTableColumn<AdminListing>[] = [
    {
      id: 'title',
      label: 'İlan Başlığı',
      sortable: true,
      render: (listing) => (
        <Box sx={{ maxWidth: 200 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
            {listing.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {listing.users.first_name} {listing.users.last_name}
          </Typography>
        </Box>
      )
    },
    {
      id: 'categories',
      label: 'Kategori',
      render: (listing) => (
        <Chip
          label={listing.categories.name}
          size="small"
          color="primary"
          variant="outlined"
        />
      )
    },
    {
      id: 'price',
      label: 'Fiyat',
      sortable: true,
      align: 'right',
      render: (listing) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {formatTRY(Number(listing.price))}
        </Typography>
      )
    },
    {
      id: 'status',
      label: 'Durum',
      render: (listing) => (
        <Chip
          label={getStatusLabel(listing.status)}
          color={getStatusColor(listing.status) as any}
          size="small"
          variant="filled"
        />
      )
    },
    {
      id: 'created_at',
      label: 'Oluşturulma',
      sortable: true,
      render: (listing) => (
        <Typography variant="body2" color="text.secondary">
          {formatDateTR(listing.created_at)}
        </Typography>
      )
    },
    {
      id: 'actions',
      label: 'İşlemler',
      align: 'center',
      render: (_listing) => (
        <Box display="flex" gap={0.5}>
          <Tooltip title="Görüntüle">
            <IconButton size="small" color="info">
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Düzenle">
            <IconButton size="small" color="primary">
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sil">
            <IconButton size="small" color="error">
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
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
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <Assignment sx={{ fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Tüm İlanlar
                  </Typography>
                  {listings && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        icon={<Assignment />}
                        label={`${listings.count} toplam ilan`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                      {statusFilter && (
                        <Chip
                          icon={<FilterList />}
                          label={`Filtre: ${getStatusLabel(statusFilter)}`}
                          color="secondary"
                          variant="outlined"
                          size="small"
                          onDelete={() => setStatusFilter('')}
                        />
                      )}
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

        {/* Filters Card */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 2 }}>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                placeholder="İlan ara..."
                value={searchTerm}
                onChange={handleSearchChange}
                size="small"
                sx={{ minWidth: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Durum Filtresi</InputLabel>
                <Select
                  value={statusFilter}
                  label="Durum Filtresi"
                  onChange={(e) => handleStatusFilterChange(e.target.value as 'ACTIVE' | 'INACTIVE' | 'PENDING' | '')}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="ACTIVE">Aktif</MenuItem>
                  <MenuItem value="PENDING">Beklemede</MenuItem>
                  <MenuItem value="REJECTED">Reddedildi</MenuItem>
                  <MenuItem value="INACTIVE">Pasif</MenuItem>
                </Select>
              </FormControl>
              
              {(statusFilter || searchTerm) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setStatusFilter('');
                    setSearchTerm('');
                  }}
                >
                  Filtreleri Temizle
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

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
              listings && (
                <Chip
                  label={`${listings.count} kayıt`}
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
              rows={listings?.data || []}
              page={page}
              pageSize={pageSize}
              totalCount={listings?.count || 0}
              sort={sort}
              order={order}
              loading={isLoading}
              error={error}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSortChange={handleSortChange}
              onRetry={() => refetch()}
              emptyMessage={
                statusFilter || searchTerm 
                  ? "Filtrelere uygun ilan bulunamadı" 
                  : "Henüz ilan bulunmuyor"
              }
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
            />
          </CardContent>
        </Card>
      </Container>
    </AdminGuard>
  );
};

export default AdminListings;
