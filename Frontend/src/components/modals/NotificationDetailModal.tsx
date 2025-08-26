import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Reply as ReplyIcon,
  Feedback as FeedbackIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

interface NotificationDetailModalProps {
  open: boolean;
  onClose: () => void;
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: {
      feedback_id?: string;
      feedback_subject?: string;
      admin_response?: string;
      feedback_type?: string;
      feedback_priority?: string;
      user_name?: string;
    };
    created_at: string;
    is_read: boolean;
  } | null;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  open,
  onClose,
  notification
}) => {
  if (!notification) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'FEEDBACK_RESPONSE':
        return <ReplyIcon color="primary" />;
      case 'GENERAL':
        return <FeedbackIcon color="info" />;
      default:
        return <CheckCircleIcon color="success" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FEEDBACK_RESPONSE':
        return 'primary';
      case 'GENERAL':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            {getNotificationIcon(notification.type)}
            <Typography variant="h6">{notification.title}</Typography>
            <Chip 
              label={notification.type === 'FEEDBACK_RESPONSE' ? 'Cevap' : 'Bildirim'}
              color={getTypeColor(notification.type)}
              size="small"
            />
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          {/* Bildirim Tarihi */}
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {formatDate(notification.created_at)}
          </Typography>

          {/* Ana Mesaj */}
          <Typography variant="body1" paragraph>
            {notification.message}
          </Typography>

          {/* Geri Bildirim Detayları */}
          {notification.data && (
            <>
              <Divider sx={{ my: 2 }} />
              
              {notification.data.feedback_subject && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Geri Bildirim Konusu:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {notification.data.feedback_subject}
                  </Typography>
                </Box>
              )}

              {notification.data.user_name && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Gönderen:
                  </Typography>
                  <Typography variant="body2">
                    {notification.data.user_name}
                  </Typography>
                </Box>
              )}

              {notification.data.feedback_type && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Geri Bildirim Türü:
                  </Typography>
                  <Chip 
                    label={notification.data.feedback_type} 
                    size="small" 
                    variant="outlined"
                  />
                </Box>
              )}

              {notification.data.feedback_priority && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Öncelik:
                  </Typography>
                  <Chip 
                    label={notification.data.feedback_priority}
                    size="small"
                    color={notification.data.feedback_priority === 'HIGH' ? 'error' : 
                           notification.data.feedback_priority === 'MEDIUM' ? 'warning' : 'default'}
                    variant="outlined"
                  />
                </Box>
              )}

              {/* Admin Cevabı - En Önemli Kısım */}
              {notification.data.admin_response && (
                <Box 
                  sx={{ 
                    bgcolor: 'primary.light', 
                    p: 2, 
                    borderRadius: 2, 
                    border: '1px solid',
                    borderColor: 'primary.main',
                    mt: 2
                  }}
                >
                  <Typography variant="subtitle2" color="primary.main" gutterBottom sx={{ fontWeight: 600 }}>
                    <ReplyIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    Admin Cevabı:
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'primary.contrastText',
                      backgroundColor: 'primary.main',
                      p: 2,
                      borderRadius: 1,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {notification.data.admin_response}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationDetailModal;
