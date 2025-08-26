import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Typography,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

interface FeedbackFormData {
  type: 'COMPLAINT' | 'SUGGESTION' | 'BUG_REPORT' | 'FEATURE_REQUEST' | 'GENERAL';
  subject: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

const FEEDBACK_TYPES = {
  COMPLAINT: 'Şikayet',
  SUGGESTION: 'Öneri',
  BUG_REPORT: 'Hata Bildirimi',
  FEATURE_REQUEST: 'Özellik Talebi',
  GENERAL: 'Genel'
};

const PRIORITY_LEVELS = {
  LOW: 'Düşük',
  MEDIUM: 'Orta',
  HIGH: 'Yüksek',
  URGENT: 'Acil'
};

const FeedbackModal: React.FC<FeedbackModalProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: 'GENERAL',
    subject: '',
    message: '',
    priority: 'MEDIUM'
  });

  const handleClose = () => {
    if (!loading) {
      setFormData({
        type: 'GENERAL',
        subject: '',
        message: '',
        priority: 'MEDIUM'
      });
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      setError('Lütfen konu ve mesaj alanlarını doldurunuz.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/feedback', formData);
      setSuccess(true);
      
      // 2 saniye sonra modalı kapat
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Geri bildiriminiz gönderilemedi. Lütfen tekrar deneyiniz.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" color="success.main" gutterBottom>
              ✅ Teşekkürler!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Geri bildiriminiz başarıyla gönderildi. En kısa sürede yanıtlayacağız.
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h5" component="div">
            Geri Bildirim Gönder
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Görüşleriniz bizim için değerli. Lütfen düşüncelerinizi paylaşın.
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Tip</InputLabel>
            <Select
              value={formData.type}
              label="Tip"
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              {Object.entries(FEEDBACK_TYPES).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Öncelik</InputLabel>
            <Select
              value={formData.priority}
              label="Öncelik"
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            >
              {Object.entries(PRIORITY_LEVELS).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TextField
          fullWidth
          label="Konu"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Geri bildiriminizin konusunu yazınız"
          sx={{ mb: 2 }}
          inputProps={{ maxLength: 200 }}
          helperText={`${formData.subject.length}/200`}
        />

        <TextField
          fullWidth
          label="Mesaj"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Detaylı açıklama yazınız..."
          multiline
          rows={6}
          inputProps={{ maxLength: 2000 }}
          helperText={`${formData.message.length}/2000`}
        />

        {user && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Gönderen: {user.first_name} {user.last_name} ({user.email})
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          color="inherit"
        >
          İptal
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !formData.subject.trim() || !formData.message.trim()}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Gönderiliyor...' : 'Gönder'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackModal;
