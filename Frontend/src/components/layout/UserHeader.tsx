import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  TextField,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Search,
  Notifications,
  Message,
  AccountCircle,
  Add,
  Logout,
  Person,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';

const UserHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setProfileAnchorEl(null);
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleCreateListing = () => {
    if (isAuthenticated) {
      navigate('/user/create-listing');
    } else {
      navigate('/auth/login');
    }
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'white', color: 'text.primary', boxShadow: 1 }}>
      <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
        {/* Logo */}
        <Typography
          variant="h5"
          component={Link}
          to="/"
          sx={{
            flexGrow: 0,
            mr: 4,
            color: 'primary.main',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: { xs: '1.2rem', md: '1.5rem' }
          }}
        >
          TruckBus
        </Typography>

        {/* Search Bar */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ flexGrow: 1, maxWidth: 600, mx: { xs: 1, md: 3 } }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="İlan ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'grey.50',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              },
            }}
          />
        </Box>

        {/* Right Side Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated ? (
            <>
              {/* Messages */}
              <IconButton
                color="inherit"
                onClick={() => navigate('/user/messages')}
                sx={{ color: 'grey.600' }}
              >
                <Badge badgeContent={0} color="error">
                  <Message />
                </Badge>
              </IconButton>

              {/* Notifications */}
              <IconButton
                color="inherit"
                onClick={handleNotificationClick}
                sx={{ color: 'grey.600' }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>

              {/* Create Listing Button */}
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateListing}
                sx={{
                  ml: 1,
                  bgcolor: 'success.main',
                  '&:hover': { bgcolor: 'success.dark' },
                  display: { xs: 'none', sm: 'flex' }
                }}
              >
                Ücretsiz İlan Ver
              </Button>

              {/* Profile Menu */}
              <IconButton onClick={handleProfileClick} sx={{ ml: 1 }}>
                <Avatar
                  src={user?.avatar}
                  sx={{ width: 32, height: 32 }}
                >
                  {user?.firstName?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => { navigate('/user/profile'); handleClose(); }}>
                  <Person sx={{ mr: 1 }} />
                  Profilim
                </MenuItem>
                <MenuItem onClick={() => { navigate('/user/settings'); handleClose(); }}>
                  <Settings sx={{ mr: 1 }} />
                  Ayarlar
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Çıkış Yap
                </MenuItem>
              </Menu>

              {/* Notification Menu */}
              <Menu
                anchorEl={notificationAnchorEl}
                open={Boolean(notificationAnchorEl)}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{ sx: { width: 300, maxHeight: 400 } }}
              >
                <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
                  Bildirimler
                </Typography>
                <Divider />
                {unreadCount === 0 ? (
                  <MenuItem>
                    <Typography variant="body2" color="text.secondary">
                      Yeni bildirim yok
                    </Typography>
                  </MenuItem>
                ) : (
                  <MenuItem onClick={() => { navigate('/user/notifications'); handleClose(); }}>
                    <Typography variant="body2">
                      {unreadCount} yeni bildirim var
                    </Typography>
                  </MenuItem>
                )}
              </Menu>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={() => navigate('/auth/login')}
                sx={{ mr: 1 }}
              >
                Giriş Yap
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/auth/register')}
              >
                Kayıt Ol
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default UserHeader;
