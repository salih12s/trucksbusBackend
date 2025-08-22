import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
} from '@mui/material';
import {
  WarningAmberOutlined,
  InfoOutlined,
  CheckCircleOutline,
  ErrorOutline,
} from '@mui/icons-material';

type Severity = 'info' | 'warning' | 'error' | 'success';

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  severity?: Severity;
}

interface Props extends ConfirmOptions {
  open: boolean;
  onClose: (confirmed: boolean) => void;
}

const iconMap: Record<Severity, React.ReactNode> = {
  info: <InfoOutlined color="info" />,
  warning: <WarningAmberOutlined color="warning" />,
  error: <ErrorOutline color="error" />,
  success: <CheckCircleOutline color="success" />,
};

const colorMap: Record<Severity, 'primary' | 'error' | 'success' | 'warning'> = {
  info: 'primary',
  warning: 'warning',
  error: 'error',
  success: 'success',
};

export const ConfirmDialog: React.FC<Props> = ({
  open,
  onClose,
  title,
  description,
  confirmText = 'Onayla',
  cancelText = 'Vazgeç',
  severity = 'info'
}) => {
  const handleCancel = () => onClose(false);
  const handleConfirm = () => onClose(true);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="xs"
      fullWidth
      onKeyDown={handleKeyDown}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {iconMap[severity]}
          <span>{title}</span>
        </Stack>
      </DialogTitle>
      {description && (
        <DialogContent sx={{ pt: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </DialogContent>
      )}
      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button variant="outlined" onClick={handleCancel} color="inherit">
          {cancelText}
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          color={colorMap[severity]}
          autoFocus
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
