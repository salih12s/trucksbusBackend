import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { Warning, Visibility, Message } from '@mui/icons-material';

const Complaints = () => {
  const complaints = [
    {
      id: 1,
      type: 'Sahte İlan',
      complainant: 'Ahmet Y.',
      target: 'Mehmet D. - 2020 Mercedes Actros',
      date: '2024-01-16',
      status: 'Yeni',
      description: 'İlanda belirtilen araç gerçekte mevcut değil'
    },
    {
      id: 2,
      type: 'Yanıltıcı Bilgi',
      complainant: 'Ayşe K.',
      target: 'Ali M. - 2019 Ford Cargo',
      date: '2024-01-15',
      status: 'İnceleniyor',
      description: 'Araç kilometresi gerçekle uymuyor'
    },
    {
      id: 3,
      type: 'Uygunsuz İçerik',
      complainant: 'Fatma Ö.',
      target: 'Can A. - Profil Fotoğrafı',
      date: '2024-01-14',
      status: 'Çözüldü',
      description: 'Profil fotoğrafında uygunsuz içerik'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Yeni':
        return 'error';
      case 'İnceleniyor':
        return 'warning';
      case 'Çözüldü':
        return 'success';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Sahte İlan':
        return <Warning color="error" />;
      case 'Yanıltıcı Bilgi':
        return <Warning color="warning" />;
      default:
        return <Warning />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Şikayet Kutusu
      </Typography>
      
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Kullanıcı şikayetleri ve raporları
      </Typography>

      {/* Özet Kartları */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Toplam Şikayet
            </Typography>
            <Typography variant="h4">
              {complaints.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Bekleyen
            </Typography>
            <Typography variant="h4" color="error">
              {complaints.filter(c => c.status === 'Yeni').length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Çözülen
            </Typography>
            <Typography variant="h4" color="success.main">
              {complaints.filter(c => c.status === 'Çözüldü').length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Şikayet Türü</TableCell>
              <TableCell>Şikayetçi</TableCell>
              <TableCell>Hedef</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {complaints.map((complaint) => (
              <TableRow key={complaint.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getTypeIcon(complaint.type)}
                    {complaint.type}
                  </Box>
                </TableCell>
                <TableCell>{complaint.complainant}</TableCell>
                <TableCell>{complaint.target}</TableCell>
                <TableCell sx={{ maxWidth: 200 }}>
                  <Typography variant="body2" noWrap>
                    {complaint.description}
                  </Typography>
                </TableCell>
                <TableCell>{complaint.date}</TableCell>
                <TableCell>
                  <Chip 
                    label={complaint.status} 
                    color={getStatusColor(complaint.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button size="small" startIcon={<Visibility />} sx={{ mr: 1 }}>
                    Detay
                  </Button>
                  <Button size="small" startIcon={<Message />}>
                    Cevapla
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Complaints;
