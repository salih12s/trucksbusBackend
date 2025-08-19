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
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import TruckCenterCard from '../../components/cards/TruckCenterCard';
import { api } from '../../services/api';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  year: number;
  mileage?: number;
  images: string[];
  created_at: string;
  categories: {
    name: string;
  };
  vehicle_types: {
    name: string;
  };
  brands?: {
    name: string;
  };
  models?: {
    name: string;
  };
  variants?: {
    name: string;
  };
  cities?: {
    name: string;
  };
  districts?: {
    name: string;
  };
  seller_name: string;
  seller_phone: string;
  seller_email: string;
  users: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  is_approved: boolean;
  is_active: boolean;
}

interface PendingListingsResponse {
  listings: Listing[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

const PendingListings: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; listing: Listing | null }>({
    open: false,
    listing: null,
  });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; listing: Listing | null }>({
    open: false,
    listing: null,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const itemsPerPage = 12;

  const loadPendingListings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/listings', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          status: 'pending'
        }
      });
      
      if (response.data.success) {
        setListings(response.data.data);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Onay bekleyen ilanlar yüklenemedi:', error);
      setError('Onay bekleyen ilanlar yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingListings();
  }, [currentPage]);

  const handleApprove = async (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (listing) {
      setApproveDialog({ open: true, listing });
    }
  };

  const handleReject = async (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (listing) {
      setRejectDialog({ open: true, listing });
    }
  };

  const confirmApprove = async () => {
    if (!approveDialog.listing) return;
    
    try {
      setActionLoading(true);
      await api.put(`/admin/listings/${approveDialog.listing.id}/approve`);
      
      // Remove from pending list
      setListings(prev => prev.filter(l => l.id !== approveDialog.listing!.id));
      setApproveDialog({ open: false, listing: null });
      
      alert('İlan başarıyla onaylandı ve yayınlandı!');
    } catch (error) {
      console.error('İlan onaylanamadı:', error);
      alert('İlan onaylanırken bir hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!rejectDialog.listing) return;
    
    try {
      setActionLoading(true);
      await api.put(`/admin/listings/${rejectDialog.listing.id}/reject`);
      
      // Remove from pending list
      setListings(prev => prev.filter(l => l.id !== rejectDialog.listing!.id));
      setRejectDialog({ open: false, listing: null });
      
      alert('İlan reddedildi.');
    } catch (error) {
      console.error('İlan reddedilemedi:', error);
      alert('İlan reddedilirken bir hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

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
        Onay Bekleyen İlanlar ({listings.length})
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* İlan Kartları */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: '1fr 1fr', 
              md: '1fr 1fr 1fr' 
            }, 
            gap: 3,
            mb: 4 
          }}>
            {listings.map(listing => {
              // Listing verisini SimpleListing formatına dönüştür
              const simpleListing = {
                id: listing.id,
                title: listing.title,
                price: listing.price,
                category: listing.categories?.name || 'Bilinmeyen',
                brand: listing.brands?.name || 'Bilinmeyen',
                model: listing.models?.name || 'Bilinmeyen',
                year: listing.year,
                km: listing.mileage || 0,
                location: `${listing.cities?.name || ''}, ${listing.districts?.name || ''}`.trim(),
                image: listing.images?.[0] || '/placeholder-truck.jpg',
                seller: {
                  name: listing.seller_name || 'İlan Sahibi',
                  phone: listing.seller_phone || 'Telefon Belirtilmemiş'
                },
                owner: {
                  name: listing.seller_name || 'İlan Sahibi',
                  phone: listing.seller_phone || 'Telefon Belirtilmemiş'
                },
                user_id: listing.users?.id,
                status: 'PENDING' as const,
                createdAt: listing.created_at
              };

              return (
                <TruckCenterCard
                  key={listing.id}
                  listing={simpleListing}
                  isAdminView={true}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onViewDetails={(id) => console.log('View details:', id)}
                />
              );
            })}
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
                Onay bekleyen ilan bulunmuyor
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Yeni ilanlar oluşturulduğunda burada görünecektir
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* Approve Confirmation Dialog */}
      <Dialog 
        open={approveDialog.open} 
        onClose={() => setApproveDialog({ open: false, listing: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>İlanı Onayla</DialogTitle>
        <DialogContent>
          <Typography>
            "{approveDialog.listing?.title}" ilanını onaylamak istediğinizden emin misiniz?
            <br /><br />
            Onaylandıktan sonra ilan anasayfada yayınlanacaktır.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setApproveDialog({ open: false, listing: null })}
            disabled={actionLoading}
          >
            İptal
          </Button>
          <Button 
            onClick={confirmApprove}
            variant="contained"
            color="success"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} /> : <CheckCircle />}
          >
            {actionLoading ? 'Onaylanıyor...' : 'Onayla'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog 
        open={rejectDialog.open} 
        onClose={() => setRejectDialog({ open: false, listing: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>İlanı Reddet</DialogTitle>
        <DialogContent>
          <Typography>
            "{rejectDialog.listing?.title}" ilanını reddetmek istediğinizden emin misiniz?
            <br /><br />
            Reddedilen ilanlar yayınlanmayacaktır.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setRejectDialog({ open: false, listing: null })}
            disabled={actionLoading}
          >
            İptal
          </Button>
          <Button 
            onClick={confirmReject}
            variant="contained"
            color="error"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} /> : <Cancel />}
          >
            {actionLoading ? 'Reddediliyor...' : 'Reddet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingListings;
