import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from '@mui/material';
import { HelpOutline } from '@mui/icons-material';

export interface PromptOptions {
  title: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  multiline?: boolean;
  rows?: number;
}

interface Props extends PromptOptions {
  open: boolean;
  onClose: (result: string | null) => void;
}

export const PromptDialog: React.FC<Props> = ({
  open,
  onClose,
  title,
  label = '',
  placeholder = '',
  defaultValue = '',
  multiline = false,
  rows = 3
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
    }
  }, [open, defaultValue]);

  const handleCancel = () => onClose(null);
  const handleConfirm = () => onClose(value.trim() || null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !multiline) {
      event.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      onKeyDown={handleKeyDown}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <HelpOutline color="primary" />
          <span>{title}</span>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <TextField
          autoFocus
          fullWidth
          label={label}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          multiline={multiline}
          rows={multiline ? rows : 1}
          variant="outlined"
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button variant="outlined" onClick={handleCancel} color="inherit">
          Vazgeç
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          color="primary"
        >
          Tamam
        </Button>
      </DialogActions>
    </Dialog>
  );
};
