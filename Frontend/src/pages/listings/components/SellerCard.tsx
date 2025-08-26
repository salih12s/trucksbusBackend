import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Avatar,
  IconButton,
  Tooltip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Person,
  Phone,
  Email,
  Message,
  ContentCopy,
  PhoneEnabled,
} from '@mui/icons-material';
import { BaseInfo } from '../../../types/listing-detail';

interface SellerCardProps {
  seller: BaseInfo['seller'];
  onCall?: () => void;
  onMessage?: () => void;
}

const SellerCard: React.FC<SellerCardProps> = ({
  seller,
  onCall,
  onMessage
}) => {
  const formatPhone = (phone?: string) => {
    if (!phone) return 'Telefon belirtilmemiş';
    
    // Turkish phone number formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
    }
    return phone;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
      console.log('Copied to clipboard:', text);
    });
  };

  const handleCall = () => {
    if (seller.phone) {
      window.location.href = `tel:${seller.phone}`;
    }
    onCall?.();
  };

  const handleMessage = () => {
    onMessage?.();
  };

  return (
    <Card sx={{ 
      position: 'sticky', 
      top: 24,
      boxShadow: 3,
      borderRadius: 2
    }}>
      <CardContent sx={{ p: 3 }}>
        {/* Seller Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <Person />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {seller.name || 'İlan Sahibi'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Satıcı
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Contact Information */}
        <Stack spacing={2}>
          {/* Phone */}
          {seller.phone ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone color="primary" fontSize="small" />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {formatPhone(seller.phone)}
              </Typography>
              <Tooltip title="Telefonu Kopyala">
                <IconButton 
                  size="small"
                  onClick={() => copyToClipboard(seller.phone!)}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone color="disabled" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Telefon belirtilmemiş
              </Typography>
            </Box>
          )}

          {/* Email */}
          {seller.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Email color="primary" fontSize="small" />
              <Typography variant="body2" sx={{ flex: 1, wordBreak: 'break-word' }}>
                {seller.email}
              </Typography>
              <Tooltip title="E-postayı Kopyala">
                <IconButton 
                  size="small"
                  onClick={() => copyToClipboard(seller.email!)}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Action Buttons */}
        <Stack spacing={1.5}>
          <Button
            variant="contained"
            startIcon={<PhoneEnabled />}
            onClick={handleCall}
            disabled={!seller.phone}
            fullWidth
            size="large"
          >
            Ara
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Message />}
            onClick={handleMessage}
            fullWidth
            size="large"
          >
            Mesaj Gönder
          </Button>
        </Stack>

        {/* Additional Info */}
        {!seller.phone && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: 'warning.light', 
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Phone fontSize="small" />
            <Typography variant="caption" color="text.secondary">
              Satıcı telefon bilgisini paylaşmamış. Mesaj gönderebilirsiniz.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SellerCard;
