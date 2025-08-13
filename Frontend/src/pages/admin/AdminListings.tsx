import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  IconButton,
  Avatar,
  TextField,
  InputAdornment,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardMedia,
  CardContent,
  Alert,
} from '@mui/material';
import {
  Search,
  Visibility,
  CheckCircle,
  Cancel,
  Delete,
  FilterList,
  Edit,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Listing, ListingStatus } from '../../types';

const AdminListings: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'delete'>('approve');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    // Mock data
    const mockListings: Listing[] = [
      {
        id: '1',
        title: '2018 Mercedes Actros 2545',
        description: 'Temiz araç, bakımlı',
        price: 850000,
        location: 'İstanbul',
        images: ['/api/placeholder/300/200'],
        status: ListingStatus.PENDING,
        createdAt: new Date('2024-01-15'),
        categoryId: '1',
        category: { id: '1', name: 'Kamyon', slug: 'kamyon', createdAt: new Date() },
        userId: 'user1',
        user: {
          id: 'user1',
          name: 'Ahmet Yılmaz',
          email: 'ahmet@example.com',
          username: 'ahmetyilmaz',
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          role: 'user',
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isApproved: false,
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: '2020 Volvo FH16 750',
        description: 'Sıfır ayarında',
        price: 1200000,
        location: 'Ankara',
        images: ['/api/placeholder/300/200'],
        status: ListingStatus.APPROVED,
        createdAt: new Date('2024-01-10'),
        categoryId: '1',
        category: { id: '1', name: 'Kamyon', slug: 'kamyon', createdAt: new Date() },
        userId: 'user2',
        user: {
          id: 'user2',
          name: 'Mehmet Kaya',
          email: 'mehmet@example.com',
          username: 'mehmetkaya',
          firstName: 'Mehmet',
          lastName: 'Kaya',
          role: 'user',
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isApproved: true,
        updatedAt: new Date(),
      },
      {
        id: '3',
        title: '2019 MAN TGX 18.480',
        description: 'Bakımlı araç',
        price: 950000,
        location: 'İzmir',
        images: ['/api/placeholder/300/200'],
        status: ListingStatus.REJECTED,
        createdAt: new Date('2024-01-08'),
        categoryId: '1',
        category: { id: '1', name: 'Kamyon', slug: 'kamyon', createdAt: new Date() },
        userId: 'user3',
        user: {
          id: 'user3',
          name: 'Fatma Demir',
          email: 'fatma@example.com',
          username: 'fatmademir',
          firstName: 'Fatma',
          lastName: 'Demir',
          role: 'user',
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isApproved: false,
        updatedAt: new Date(),
      },
    ];
    
    setListings(mockListings);
    setFilteredListings(mockListings);
  }, []);

  useEffect(() => {
    let filtered = listings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(listing => listing.status === statusFilter);
    }

    setFilteredListings(filtered);
    setPage(0);
  }, [searchTerm, statusFilter, listings]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: ListingStatus): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case ListingStatus.APPROVED:
        return 'success';
      case ListingStatus.PENDING:
        return 'warning';
      case ListingStatus.REJECTED:
        return 'error';
      case ListingStatus.SOLD:
        return 'info';
      default:
        return 'warning';
    }
  };

  const getStatusText = (status: ListingStatus) => {
    switch (status) {
      case ListingStatus.APPROVED:
        return 'Onaylandı';
      case ListingStatus.PENDING:
        return 'Beklemede';
      case ListingStatus.REJECTED:
        return 'Reddedildi';
      case ListingStatus.SOLD:
        return 'Satıldı';
      default:
        return 'Bilinmiyor';
    }
  };

  const handleViewListing = (listing: Listing) => {
    setSelectedListing(listing);
    setViewDialogOpen(true);
  };

  const handleAction = (listing: Listing, action: 'approve' | 'reject' | 'delete') => {
    setSelectedListing(listing);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const executeAction = () => {
    if (!selectedListing) return;

    const updatedListings = listings.map(listing => {
      if (listing.id === selectedListing.id) {
        switch (actionType) {
          case 'approve':
            return { ...listing, status: ListingStatus.APPROVED, isApproved: true };
          case 'reject':
            return { ...listing, status: ListingStatus.REJECTED, isApproved: false };
          case 'delete':
            return null;
          default:
            return listing;
        }
      }
      return listing;
    }).filter(Boolean) as Listing[];

    setListings(updatedListings);
    setActionDialogOpen(false);
    setRejectReason('');
  };

  const paginatedListings = filteredListings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          İlan Yönetimi
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip 
            label={`Toplam: ${listings.length}`} 
            color="primary" 
          />
          <Chip 
            label={`Bekleyen: ${listings.filter(l => l.status === ListingStatus.PENDING).length}`} 
            color="warning" 
          />
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="İlan, kullanıcı veya konum ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            select
            label="Durum"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">Tümü</MenuItem>
            <MenuItem value={ListingStatus.PENDING}>Beklemede</MenuItem>
            <MenuItem value={ListingStatus.APPROVED}>Onaylandı</MenuItem>
            <MenuItem value={ListingStatus.REJECTED}>Reddedildi</MenuItem>
            <MenuItem value={ListingStatus.SOLD}>Satıldı</MenuItem>
          </TextField>

          <Button startIcon={<FilterList />} variant="outlined">
            Gelişmiş Filtre
          </Button>
        </Box>
      </Paper>

      {/* Listings Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>İlan</TableCell>
                <TableCell>Kullanıcı</TableCell>
                <TableCell>Fiyat</TableCell>
                <TableCell>Konum</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedListings.map((listing) => (
                <TableRow key={listing.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={listing.images[0]}
                        variant="rounded"
                        sx={{ width: 60, height: 60 }}
                      />
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {listing.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {listing.category.name}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {listing.user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {listing.user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {listing.price.toLocaleString('tr-TR')} TL
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {listing.location}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(listing.status)}
                      color={getStatusColor(listing.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDistanceToNow(listing.createdAt, { addSuffix: true, locale: tr })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewListing(listing)}
                      >
                        <Visibility />
                      </IconButton>
                      
                      {listing.status === ListingStatus.PENDING && (
                        <>
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleAction(listing, 'approve')}
                          >
                            <CheckCircle />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleAction(listing, 'reject')}
                          >
                            <Cancel />
                          </IconButton>
                        </>
                      )}
                      
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleAction(listing, 'delete')}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredListings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına satır:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>İlan Detayları</DialogTitle>
        <DialogContent>
          {selectedListing && (
            <Card>
              <CardMedia
                component="img"
                height="300"
                image={selectedListing.images[0]}
                alt={selectedListing.title}
              />
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {selectedListing.title}
                </Typography>
                <Typography variant="h4" color="success.main" fontWeight="bold" sx={{ mb: 2 }}>
                  {selectedListing.price.toLocaleString('tr-TR')} TL
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedListing.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={`📍 ${selectedListing.location}`} />
                  <Chip label={`👤 ${selectedListing.user.name}`} />
                  <Chip label={`📧 ${selectedListing.user.email}`} />
                  <Chip 
                    label={getStatusText(selectedListing.status)} 
                    color={getStatusColor(selectedListing.status)} 
                  />
                </Box>
              </CardContent>
            </Card>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)}>
        <DialogTitle>
          {actionType === 'approve' && 'İlanı Onayla'}
          {actionType === 'reject' && 'İlanı Reddet'}
          {actionType === 'delete' && 'İlanı Sil'}
        </DialogTitle>
        <DialogContent>
          <Alert severity={actionType === 'delete' ? 'error' : 'info'} sx={{ mb: 2 }}>
            {actionType === 'approve' && 'Bu ilanı onaylamak istediğinizden emin misiniz?'}
            {actionType === 'reject' && 'Bu ilanı reddetmek istediğinizden emin misiniz?'}
            {actionType === 'delete' && 'Bu ilanı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'}
          </Alert>
          
          {actionType === 'reject' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Red Sebebi"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="İlanın neden reddedildiğini açıklayın..."
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={executeAction} 
            color={actionType === 'delete' ? 'error' : 'primary'}
            variant="contained"
            disabled={actionType === 'reject' && !rejectReason.trim()}
          >
            {actionType === 'approve' && 'Onayla'}
            {actionType === 'reject' && 'Reddet'}
            {actionType === 'delete' && 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminListings;
