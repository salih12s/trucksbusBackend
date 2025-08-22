import React, { useState, useEffect } from 'react';
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
  Avatar,
  TextField,
  InputAdornment,
  TablePagination,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  Search, 
  Block, 
  Edit, 
  Visibility,
  People,
  PersonAdd,
  FilterList,
  Refresh
} from '@mui/icons-material';
import { api } from '../../services/api';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  created_at: string;
  updated_at: string;
  _count: {
    listings: number;
  };
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const Users = () => {
  const { confirm } = useConfirmDialog();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get<{success: boolean; data: UsersResponse}>('/admin/users', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchTerm || undefined
        }
      });
      
      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalUsers(response.data.data.pagination.total);
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
      setError('Kullanıcılar yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage, searchTerm]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    return role === 'ADMIN' ? 'error' : 'default';
  };

  const getRoleText = (role: string) => {
    return role === 'ADMIN' ? 'Admin' : 'Kullanıcı';
  };

  const handleBlockUser = async (userId: string, userName: string) => {
    const confirmed = await confirm({
      title: 'Kullanıcıyı Engelle',
      description: `${userName} kullanıcısını engellemek istediğinizden emin misiniz? Bu işlem geri alınabilir.`,
      severity: 'warning'
    });

    if (confirmed) {
      try {
        // TODO: API call to block user
        console.log('Blocking user:', userId);
        // For now, just refresh the page or show a success message
        window.location.reload();
      } catch (error) {
        console.error('Error blocking user:', error);
      }
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Kullanıcı Yönetimi
      </Typography>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            placeholder="Kullanıcı ara..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Kullanıcı</TableCell>
                <TableCell>E-posta</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>İlan Sayısı</TableCell>
                <TableCell>Kayıt Tarihi</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {searchTerm ? 'Arama kriterine uygun kullanıcı bulunamadı.' : 'Henüz kullanıcı bulunmuyor.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {user.first_name[0]}{user.last_name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {user.first_name} {user.last_name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleText(user.role)}
                        color={getRoleColor(user.role) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user._count.listings}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          startIcon={<Visibility />}
                          variant="outlined"
                          size="small"
                        >
                          Görüntüle
                        </Button>
                        <Button
                          startIcon={<Edit />}
                          variant="outlined"
                          size="small"
                        >
                          Düzenle
                        </Button>
                        <Button
                          startIcon={<Block />}
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleBlockUser(user.id, `${user.first_name} ${user.last_name}`)}
                        >
                          Engelle
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına satır:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>
    </Box>
  );
};

export default Users;
