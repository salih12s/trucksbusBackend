import * as React from 'react';
import { Card, CardContent, Typography, Box, Chip, CardMedia } from '@mui/material';
import { Person, CalendarToday, Phone, CheckCircle, Cancel } from '@mui/icons-material';

// CSS animasyonu için global style
const pulseKeyframes = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;

// Style'ı head'e ekle
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseKeyframes;
  document.head.appendChild(style);
}

interface Listing {
  id: string;
  title: string;
  description?: string;
  price: number;
  year: number;
  images: string[];
  created_at: string;
  seller_name: string;
  seller_phone: string;
  seller_email: string;
  categories?: { name: string };
  brands?: { name: string };
  models?: { name: string };
  variants?: { name: string };
  users?: {
    first_name: string;
    last_name: string;
  };
}

interface AdminListingCardProps {
  listing: Listing;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

/** Minimal, zarif buton */
const ActionButton: React.FC<{
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: 'success' | 'danger';
  compact?: boolean;
}> = ({ label, icon, onClick, variant = 'success', compact = false }) => {
  const base = {
    fontSize: compact ? 9 : 12,
    fontWeight: 500,
    borderRadius: compact ? '6px' : '10px',
    px: compact ? 0.5 : 1.2,
    py: compact ? 0.4 : 0.7,
    minWidth: compact ? '72px' : 'auto',
    width: compact ? '72px' : '100%',
    height: compact ? '30px' : 'auto',
    lineHeight: 1,
    border: '1px solid',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: compact ? 0.3 : 0.6,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    userSelect: 'none' as const,
    position: 'relative',
    overflow: 'hidden',
    whiteSpace: 'nowrap' as const,
    '&:hover': { 
      transform: 'translateY(-1px)', 
      boxShadow: compact ? '0 2px 8px rgba(0,0,0,0.12)' : '0 4px 12px rgba(0,0,0,0.15)',
    },
  };

  const variants: Record<string, any> = {
    success: { 
      background: 'linear-gradient(135deg, rgba(46,125,50,0.12) 0%, rgba(46,125,50,0.08) 100%)', 
      color: '#2E7D32', 
      borderColor: 'rgba(46,125,50,0.25)',
      '&:hover': { 
        background: 'linear-gradient(135deg, rgba(46,125,50,0.18) 0%, rgba(46,125,50,0.12) 100%)',
      },
    },
    danger: { 
      background: 'linear-gradient(135deg, rgba(211,47,47,0.10) 0%, rgba(211,47,47,0.06) 100%)', 
      color: '#D32F2F', 
      borderColor: 'rgba(211,47,47,0.25)',
      '&:hover': { 
        background: 'linear-gradient(135deg, rgba(211,47,47,0.15) 0%, rgba(211,47,47,0.08) 100%)',
      },
    },
  };

  return (
    <Box
      component="button"
      type="button"
      sx={{ ...base, ...variants[variant] }}
      onClick={onClick}
      title={label}
    >
      {icon && <Box sx={{ fontSize: compact ? '10px' : '16px', display: 'flex', alignItems: 'center' }}>{icon}</Box>}
      {label && <Box sx={{ fontSize: compact ? '8px' : '12px', fontWeight: 500 }}>{label}</Box>}
    </Box>
  );
};

const AdminListingCard: React.FC<AdminListingCardProps> = ({
  listing,
  onApprove,
  onReject,
}) => {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(price);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getCategoryName = () => {
    if (listing.categories?.name) return listing.categories.name;
    return 'Kategori Belirtilmemiş';
  };

  const getOwnerName = () => {
    if (listing.users?.first_name && listing.users?.last_name) {
      return `${listing.users.first_name} ${listing.users.last_name}`;
    }
    return listing.seller_name || 'İsimsiz';
  };

  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: 400,
        height: 260,
        display: 'flex',
        flexDirection: 'row',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 6, borderColor: 'primary.main' },
        overflow: 'hidden',
      }}
    >
      {/* SOL: Görsel + Admin Aksiyonlar */}
      <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column', borderRight: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ position: 'relative', aspectRatio: '16 / 11', bgcolor: 'grey.50', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            alt={listing.title}
            image={listing.images?.[0] || '/placeholder-truck.jpg'}
            sx={{ 
              position: 'absolute', 
              inset: 0, 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
        </Box>

        {/* Admin Aksiyon Bölümü - Onayla/Reddet */}
        <Box sx={{ p: 1.5, mt: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70px' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0.8,
              width: '100%',
              height: '32px',
            }}
          >
            <ActionButton
              label="Onayla"
              icon={<CheckCircle sx={{ fontSize: 10 }} />}
              variant="success"
              compact={true}
              onClick={() => onApprove(listing.id)}
            />
            <ActionButton
              label="Reddet"
              icon={<Cancel sx={{ fontSize: 10 }} />}
              variant="danger"
              compact={true}
              onClick={() => onReject(listing.id)}
            />
          </Box>
        </Box>
      </Box>

      {/* SAĞ: Bilgi alanı */}
      <CardContent
        sx={{
          width: '50%',
          p: 1.75,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minWidth: 0,
        }}
      >
        {/* Başlık */}
        <Typography
          component="h3"
          sx={{
            fontSize: 14.5,
            fontWeight: 600,
            color: 'text.primary',
            mb: 0.75,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.25,
          }}
          title={listing.title}
        >
          {listing.title}
        </Typography>

        {/* Fiyat */}
        <Typography sx={{ 
          fontSize: 17, 
          fontWeight: 800, 
          color: '#0F2027', 
          mb: 0.75,
          textShadow: '0 1px 2px rgba(15, 32, 39, 0.1)',
          background: 'linear-gradient(135deg, rgba(15, 32, 39, 0.08) 0%, rgba(15, 32, 39, 0.04) 100%)',
          borderLeft: '3px solid #0F2027',
          px: 1,
          py: 0.3,
          borderRadius: '0 4px 4px 0',
          alignSelf: 'flex-start',
          transition: 'all 0.2s ease',
        }}>
          {formatPrice(listing.price)}
        </Typography>

        {/* Kategori */}
        <Chip
          label={getCategoryName()}
          size="small"
          sx={{ bgcolor: 'grey.100', color: 'text.secondary', fontSize: 11, height: 20, mb: 0.75, alignSelf: 'flex-start' }}
        />

        {/* Alt Bilgiler */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <CalendarToday sx={{ fontSize: 12, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11.5 }}>
              {formatDate(listing.created_at)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Person sx={{ fontSize: 12, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11.5 }}>
              {getOwnerName()}
            </Typography>
          </Box>
        </Box>

        {/* Telefon kutusu */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mt: 1.5,
            background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
            p: '8px 12px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 15px rgba(15, 32, 39, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 25px rgba(15, 32, 39, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
              background: 'linear-gradient(135deg, #203A43 0%, #2C5364 50%, #0F2027 100%)',
            },
          }}
        >
          <Phone sx={{ 
            fontSize: 18, 
            mr: 1, 
            color: '#fff', 
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
            animation: 'pulse 2s infinite' 
          }} />
          <Typography sx={{ 
            color: '#fff', 
            fontSize: 14, 
            fontWeight: 700, 
            letterSpacing: 0.5,
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            fontFamily: 'monospace'
          }}>
            {listing.seller_phone}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AdminListingCard;
