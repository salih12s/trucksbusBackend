import React, { useState, useEffect } from 'react';
import {
  Box,
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
  price: number;
  year: number;
  kilometers: number;
  city_name: string;
  district_name: string;
  description: string;
  images: string[];
  created_at: string;
  categories: {
    name: string;
  };
  users: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  status: string;
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
      const response = await api.get<{success: boolean; data: PendingListingsResponse}>('/admin/listings', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          status: 'pending'
        }
      });
      
      if (response.data.success) {
        setListings(response.data.data.listings);
        setTotalPages(response.data.data.pagination.total_pages);
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

  const handleApprove = async (listing: Listing) => {
    setApproveDialog({ open: true, listing });
  };

  const handleReject = async (listing: Listing) => {
    setRejectDialog({ open: true, listing });
  };

  const confirmApprove = async () => {
    if (!approveDialog.listing) return;
    
    try {
      setActionLoading(true);
      await api.put(`/admin/listings/${approveDialog.listing.id}/approve`);
      
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

  const transformListing = (listing: Listing) => ({
    id: listing.id,
    title: listing.title,
    price: listing.price,
    category: listing.categories.name,
    brand: listing.categories.name, // Temporary - brand info missing
    model: listing.title.split(' ').slice(0, 2).join(' '),
    year: listing.year,
    km: listing.kilometers || 0, // Use km instead of kilometers
    kilometers: listing.kilometers,
    city: listing.city_name,
    district: listing.district_name,
    location: `${listing.city_name}, ${listing.district_name}`,
    image: listing.images?.[0] || '', // First image as main image
    description: listing.description,
    images: listing.images || [],
    publishDate: new Date(listing.created_at).toLocaleDateString('tr-TR'),
    seller: {
      name: `${listing.users.first_name} ${listing.users.last_name}`,
      phone: listing.users.phone,
    },
    owner: {
      name: `${listing.users.first_name} ${listing.users.last_name}`,
      phone: listing.users.phone,
    },
    details: {
      year: listing.year,
      km: listing.kilometers || 0,
      location: `${listing.city_name}, ${listing.district_name}`,
      description: listing.description,
    },
    views: 0,
    isFavorite: false,
    status: 'PENDING' as const,
    createdAt: new Date(listing.created_at).toISOString(),
    updatedAt: new Date(listing.created_at).toISOString(),
  });

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
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
                  onFavoriteClick={() => {}}
                  onViewDetails={() => {}}
                  onSendMessage={() => {}}
                  onReport={() => {}}
                />
                
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
                    color="success"
                    size="small"
                    startIcon={<CheckCircle />}
                    onClick={() => handleApprove(listing)}
                  >
                    Onayla
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<Cancel />}
                    onClick={() => handleReject(listing)}
                  >
                    Reddet
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>

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
          >
            {actionLoading ? 'Onaylanıyor...' : 'Onayla'}
          </Button>
        </DialogActions>
      </Dialog>

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
          >
            {actionLoading ? 'Reddediliyor...' : 'Reddet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingListings;
