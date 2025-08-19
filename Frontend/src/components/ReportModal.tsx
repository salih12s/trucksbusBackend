import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { reportService, REPORT_REASONS, type ReportReason } from '../services/reportService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle?: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ 
  open, 
  onClose, 
  listingId, 
  listingTitle 
}) => {
  const { user } = useAuth();
  const { showSuccessNotification, showErrorNotification } = useNotification();
  
  const [reason, setReason] = useState<ReportReason>('FRAUD');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const isDescRequired = reason === 'OTHER';
  const descTooShort = isDescRequired && description.trim().length < 20;
  const descMinLength = description.trim().length < 10;

  const handleClose = () => {
    if (!loading) {
      setReason('FRAUD');
      setDescription('');
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      showErrorNotification('Lütfen giriş yapın');
      return;
    }

    if (descMinLength) {
      showErrorNotification('Açıklama en az 10 karakter olmalıdır');
      return;
    }

    if (descTooShort) {
      showErrorNotification('Diğer seçildiğinde açıklama en az 20 karakter olmalıdır');
      return;
    }

    try {
      setLoading(true);
      
      await reportService.createReport({
        listingId,
        reasonCode: reason,
        description: description.trim(),
      });
      
      showSuccessNotification('Şikayet başarıyla gönderildi');
      handleClose();
    } catch (error: any) {
      console.error('Report creation error:', error);
      const raw = error?.response?.data?.message;
      const map: Record<string, string> = {
        'You cannot report your own listing': 'Kendi ilanınızı şikayet edemezsiniz.',
        'You already reported this listing in the last 24h': 'Bu ilan için son 24 saatte zaten şikayet göndermişsiniz.',
        'Listing not found': 'İlan bulunamadı.',
      };
      showErrorNotification(map[raw] || 'Şikayet gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Şikayet Et</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {listingTitle && (
            <Alert severity="info" sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>İlan:</strong> {listingTitle}
              </Typography>
            </Alert>
          )}

          <FormControl fullWidth>
            <InputLabel id="reason-label">Şikayet Sebebi</InputLabel>
            <Select
              labelId="reason-label"
              value={reason}
              label="Şikayet Sebebi"
              onChange={(e) => setReason(e.target.value as ReportReason)}
              disabled={loading}
            >
              {REPORT_REASONS.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Açıklama"
            multiline
            minRows={3}
            maxRows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            helperText={
              isDescRequired 
                ? "Diğer seçildi, lütfen en az 20 karakter detay girin." 
                : "Şikayet gerekçenizi detaylandırın (en az 10 karakter)."
            }
            error={descMinLength || descTooShort}
            fullWidth
            disabled={loading}
            placeholder="Şikayet gerekçenizi detaylandırın..."
          />

          <Typography variant="body2" color="text.secondary">
            Şikayetiniz admin ekibimiz tarafından incelenecektir. Gereksiz şikayetler hesabınıza kısıtlama getirebilir.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          İptal
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="error"
          disabled={loading || descMinLength || descTooShort}
        >
          {loading ? 'Gönderiliyor...' : 'Şikayet Et'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportModal;
