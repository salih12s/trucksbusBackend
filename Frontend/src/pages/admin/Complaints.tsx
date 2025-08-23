import React from 'react';
import { 
  Container,
  Typography,
  Paper,
  Box
} from '@mui/material';

const Complaints: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Şikayetler
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Typography color="text.secondary">
            Şikayet yönetim sistemi geliştiriliyor...
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Complaints;
