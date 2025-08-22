import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Pagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Delete, Search } from '@mui/icons-material';
import TruckCenterCard from '../../components/cards/TruckCenterCard';
import { api } from '../../services/api';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

interface Listing {
  id: string;
  title: string;
  price: number;
  year: number;
  kilometers: number;
  city_name: string;
  district_name: string;
  description: string;
  images: string[];
  created_at: string;
  status: string;
  categories: {
    name: string;
  };
  users: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

interface AdminListingsResponse {
  listings: Listing[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

const AllListings = () => {
  const { confirm } = useConfirmDialog();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; listing: Listing | null }>({
    open: false,
    listing: null,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const itemsPerPage = 12;

  const loadListings = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const response = await api.get<{success: boolean; data: AdminListingsResponse}>('/admin/listings', {
        params
      });
      
      if (response.data.success) {
        setListings(response.data.data.listings);
        setTotalPages(response.data.data.pagination.total_pages);
      }
    } catch (error) {
      console.error('İlanlar yüklenemedi:', error);
      setError('İlanlar yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [currentPage, searchTerm, statusFilter]);

  const handleDelete = async (listing: Listing) => {
    setDeleteDialog({ open: true, listing });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.listing) return;
    
    try {
      setActionLoading(true);
      await api.delete(`/admin/listings/${deleteDialog.listing.id}`);
      
      // Remove from list
      setListings(prev => prev.filter(l => l.id !== deleteDialog.listing!.id));
      setDeleteDialog({ open: false, listing: null });
      
      console.log('İlan başarıyla silindi!');
    } catch (error) {
      console.error('İlan silinemedi:', error);
      console.error('İlan silinirken bir hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Aktif';
      case 'PENDING': return 'Beklemede';
      case 'REJECTED': return 'Reddedildi';
      case 'INACTIVE': return 'Pasif';
      default: return status;
    }
  };

  // Transform API data to match TruckCenterCard expectations
  const transformListing = (listing: Listing) => ({
    id: listing.id,
    title: listing.title,
    price: listing.price,
    category: listing.categories.name,
    model: listing.title.split(' ').slice(0, 2).join(' '),
    year: listing.year,
    kilometers: listing.kilometers,
    city: listing.city_name,
    district: listing.district_name,
    description: listing.description,
    images: listing.images || [],
    publishDate: new Date(listing.created_at).toLocaleDateString('tr-TR'),
    owner: {
      name: `${listing.users.first_name} ${listing.users.last_name}`,
      phone: listing.users.phone,
    },
    details: {
      year: listing.year,
      km: listing.kilometers,
      location: `${listing.city_name}, ${listing.district_name}`,
      description: listing.description,
    },
    views: 0,
    isFavorite: false,
    status: listing.status as any,
    createdAt: new Date(listing.created_at),
    updatedAt: new Date(listing.created_at),
  });

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Tüm İlanlar ({listings.length})
      </Typography>

      {/* Filters */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="İlan ara..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Durum</InputLabel>
            <Select
              value={statusFilter}
              label="Durum"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">Tümü</MenuItem>
              <MenuItem value="ACTIVE">Aktif</MenuItem>
              <MenuItem value="PENDING">Beklemede</MenuItem>
              <MenuItem value="REJECTED">Reddedildi</MenuItem>
              <MenuItem value="INACTIVE">Pasif</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* İlan Kartları */}
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(2, 1fr)',
                xl: 'repeat(3, 1fr)'
              },
              gap: 2,
              mb: 4
            }}
          >
            {listings.map(listing => (
              <Box key={listing.id} sx={{ position: 'relative' }}>
                <TruckCenterCard
                  listing={transformListing(listing)}
                  onFavoriteClick={() => {}} // Disable for admin
                  onViewDetails={() => {}} // Could add detail view
                  onSendMessage={() => {}} // Disable for admin
                  onReport={() => {}} // Disable for admin
                />
                
                {/* Status Badge */}
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 8,
                    left: 8,
                  }}
                >
                  <Chip
                    label={getStatusText(listing.status)}
                    color={getStatusColor(listing.status) as any}
                    size="small"
                    variant="filled"
                  />
                </Box>
                
                {/* Admin Action Buttons */}
                <Box 
                  sx={{ 
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    display: 'flex',
                    gap: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 1,
                    p: 1,
                  }}
                >
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<Delete />}
                    onClick={() => handleDelete(listing)}
                  >
                    Sil
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}

          {/* Sonuç bulunamadı */}
          {listings.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                {searchTerm || statusFilter !== 'ALL' ? 'Arama kriterinize uygun ilan bulunamadı' : 'Henüz ilan bulunmuyor'}
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, listing: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>İlanı Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{deleteDialog.listing?.title}" ilanını silmek istediğinizden emin misiniz?
            <br /><br />
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, listing: null })}
            disabled={actionLoading}
          >
            İptal
          </Button>
          <Button 
            onClick={confirmDelete}
            variant="contained"
            color="error"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} /> : <Delete />}
          >
            {actionLoading ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllListings;
