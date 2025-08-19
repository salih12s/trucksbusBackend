import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Box,
  Chip
} from '@mui/material';
import { Listing } from '../../types/listing';

interface AdminListingCardProps {
  listing: Listing;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const AdminListingCard: React.FC<AdminListingCardProps> = ({ 
  listing, 
  onApprove, 
  onReject 
}) => {
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <Card 
      sx={{ 
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={listing.images && listing.images.length > 0 ? listing.images[0] : '/placeholder-image.jpg'}
        alt={listing.title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="h2" fontWeight="bold" noWrap>
            {listing.title}
          </Typography>
          <Chip 
            label="ONAY BEKLİYOR" 
            size="small" 
            color="warning" 
            variant="outlined" 
          />
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {listing.description}
        </Typography>
        
        <Typography variant="h6" color="success.main" fontWeight="bold" sx={{ mb: 1 }}>
          {formatPrice(listing.price)}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          📍 {listing.location}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          👤 {listing.user?.email || 'Bilinmeyen kullanıcı'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          📅 {formatDate(listing.created_at)}
        </Typography>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button 
          size="small" 
          color="success" 
          variant="contained"
          onClick={() => onApprove(listing.id)}
        >
          Onayla
        </Button>
        <Button 
          size="small" 
          color="error" 
          variant="outlined"
          onClick={() => onReject(listing.id)}
        >
          Reddet
        </Button>
      </CardActions>
    </Card>
  );
};

export default AdminListingCard;
