import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  TextField,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Warning as WarningIcon,
  DeleteForever as DeleteIcon
} from '@mui/icons-material';

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ 
  open, 
  onClose, 
  onConfirm 
}) => {
  const [password, setPassword] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    
    if (!password.trim()) {
      setError('Şifrenizi girmeniz gerekiyor');
      return;
    }
    
    if (confirmationText !== 'Onaylıyorum') {
      setError('"Onaylıyorum" yazmadınız');
      return;
    }
    
    if (!understood) {
      setError('Sonuçları anladığınızı onaylamanız gerekiyor');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(password);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Hesap silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setPassword('');
      setConfirmationText('');
      setUnderstood(false);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
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
          background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
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
            <WarningIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              Hesabımı Sil
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
              Bu işlem geri alınamaz! Dikkatli olun.
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={handleClose} 
          disabled={loading}
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
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}

        <Box sx={{
          bgcolor: 'rgba(220, 38, 38, 0.05)',
          border: '2px solid rgba(220, 38, 38, 0.2)',
          borderRadius: 2,
          p: 3,
          mb: 3
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#dc2626', mb: 2 }}>
            ⚠️ DİKKAT: Bu işlem geri alınamaz!
          </Typography>
          
          <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#374151', mb: 2 }}>
            Hesabınızı sildiğinizde aşağıdaki verileriniz <strong>kalıcı olarak silinecek</strong>:
          </Typography>

          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" sx={{ mb: 1, color: '#dc2626' }}>
              <strong>Tüm ilanlarınız</strong> ve ilan görselleri
            </Typography>
            <Typography component="li" sx={{ mb: 1, color: '#dc2626' }}>
              <strong>Tüm mesajlarınız</strong> ve konuşma geçmişiniz
            </Typography>
            <Typography component="li" sx={{ mb: 1, color: '#dc2626' }}>
              <strong>Favori ilanlarınız</strong> ve kullanıcı tercihleri
            </Typography>
            <Typography component="li" sx={{ mb: 1, color: '#dc2626' }}>
              <strong>Bildirimleriniz</strong> ve geri bildirimleriniz
            </Typography>
            <Typography component="li" sx={{ mb: 1, color: '#dc2626' }}>
              <strong>Profil bilgileriniz</strong> ve hesap ayarları
            </Typography>
          </Box>
        </Box>

        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2, color: '#374151' }}>
          Devam etmek için aşağıdaki adımları tamamlayın:
        </Typography>

        <TextField
          fullWidth
          type="password"
          label="Mevcut Şifreniz"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Hesap şifrenizi girin"
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#dc2626',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#dc2626',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#dc2626',
            },
          }}
        />

        <TextField
          fullWidth
          label="Onay Metni"
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          placeholder="Onaylıyorum yazın"
          helperText='Hesabı silmek için "Onaylıyorum" yazın'
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#dc2626',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#dc2626',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#dc2626',
            },
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={understood}
              onChange={(e) => setUnderstood(e.target.checked)}
              sx={{
                color: '#dc2626',
                '&.Mui-checked': {
                  color: '#dc2626',
                },
              }}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: '#374151' }}>
              Bu işlemin sonuçlarını anladım ve hesabımı kalıcı olarak silmek istiyorum
            </Typography>
          }
          sx={{ mb: 2 }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 2, backgroundColor: '#f8f9fa', gap: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          variant="outlined"
          size="large"
          sx={{
            borderColor: '#6b7280',
            color: '#6b7280',
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              borderColor: '#4b5563',
              backgroundColor: 'rgba(107, 114, 128, 0.05)',
            }
          }}
        >
          İptal
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={loading || !password || confirmationText !== 'Onaylıyorum' || !understood}
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          sx={{
            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
              boxShadow: '0 6px 16px rgba(220, 38, 38, 0.5)',
              transform: 'translateY(-1px)',
            },
            '&:disabled': {
              background: '#d1d5db',
              color: '#9ca3af',
              boxShadow: 'none',
            },
            transition: 'all 0.2s ease',
          }}
        >
          {loading ? 'Hesap Siliniyor...' : 'Hesabı Kalıcı Olarak Sil'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAccountModal;
