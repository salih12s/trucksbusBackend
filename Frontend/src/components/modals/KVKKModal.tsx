import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, Gavel as GavelIcon } from '@mui/icons-material';

interface KVKKModalProps {
  open: boolean;
  onClose: () => void;
}

const KVKKModal: React.FC<KVKKModalProps> = ({ open, onClose }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          background: 'linear-gradient(135deg, #E14D43 0%, #ff6b5b 100%)',
          color: 'white',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          pb: 2,
          pt: 3,
          px: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box 
            sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '50%', 
              backgroundColor: 'rgba(255,255,255,0.15)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <GavelIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              KVKK Onayı Gerekli
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
              Hesap oluşturmak için KVKK metnini kabul etmeniz gerekiyor
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4, backgroundColor: '#f8f9fa' }}>
        <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#2D3748', mb: 3 }}>
          TruckBus olarak, kişisel verilerinizi korumak bizim için önceliklidir. 
          Hesap oluşturabilmek için lütfen aşağıdaki adımları tamamlayın:
        </Typography>

        <Box sx={{ 
          bgcolor: 'rgba(225, 77, 67, 0.05)', 
          border: '1px solid rgba(225, 77, 67, 0.2)',
          borderRadius: 2, 
          p: 3, 
          mb: 3 
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#E14D43', mb: 2 }}>
            📋 Yapmanız Gerekenler:
          </Typography>
          <Box component="ol" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" sx={{ mb: 1, color: '#4A5568' }}>
              <strong>KVKK Aydınlatma Metni'ni okuyun</strong> - Kişisel verilerinizin nasıl işlendiğini öğrenin
            </Typography>
            <Typography component="li" sx={{ mb: 1, color: '#4A5568' }}>
              <strong>Onay kutucuğunu işaretleyin</strong> - Bireysel Hesap Sözleşmesi'ni kabul edin
            </Typography>
            <Typography component="li" sx={{ color: '#4A5568' }}>
              <strong>Hesap Aç butonuna tıklayın</strong> - Kayıt işleminizi tamamlayın
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ 
          color: 'text.secondary', 
          fontStyle: 'italic',
          textAlign: 'center',
          p: 2,
          bgcolor: 'rgba(0,0,0,0.03)',
          borderRadius: 1
        }}>
          💡 KVKK metnini kabul etmeden hesap oluşturamazsınız. 
          Bu yasal bir gerekliliktir ve verilerinizi korumak amacıyla uygulanmaktadır.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 2, backgroundColor: '#f8f9fa', gap: 2 }}>
        <Button 
          onClick={onClose}
          variant="contained"
          size="large"
          fullWidth
          sx={{
            background: 'linear-gradient(135deg, #E14D43 0%, #ff6b5b 100%)',
            borderRadius: 2,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(225, 77, 67, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #d63c32 0%, #ff5a4a 100%)',
              boxShadow: '0 6px 16px rgba(225, 77, 67, 0.5)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Anladım, KVKK Metnini Okuyacağım
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default KVKKModal;
