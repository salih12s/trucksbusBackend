import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// MUI Bileşenleri
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Tooltip,
} from "@mui/material";

// MUI İkonları
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from "@mui/icons-material/Menu";

const UserHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [query, setQuery] = useState("");
  
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElMobile, setAnchorElMobile] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  
  const handleOpenMobileMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElMobile(event.currentTarget);
  const handleCloseMobileMenu = () => setAnchorElMobile(null);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleCloseUserMenu();
    handleCloseMobileMenu();
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    handleCloseMobileMenu();
  };
  
  // --- YENİ "ÜCRETSİZ İLAN VER" BUTONU ---
  const primaryAction = (
    <Button
      variant="contained"
      size="medium"
      disableElevation
      startIcon={<AddIcon />}
      onClick={() => handleNavigate(isAuthenticated ? "/category-selection" : "/auth/register")}
      sx={{
        bgcolor: 'white', // Açık renkli, dikkat çekici buton
        color: '#0d47a1', // Logonun mavi rengiyle uyumlu metin
        fontWeight: 'bold',
        borderRadius: '8px',
        textTransform: 'none',
        border: '1px solid transparent',
        transition: 'background-color 0.2s ease, color 0.2s ease',
        '&:hover': {
          bgcolor: '#f0f0f0', // Hafif gri tonu
          color: '#0d47a1',
        },
      }}
    >
      Ücretsiz İlan Ver
    </Button>
  );

  return (
    <AppBar 
      position="sticky" 
      elevation={2} 
      sx={{ 
        bgcolor: '#0F2027',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)' 
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: '72px' }}>
          
          {/* Logo */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: 'center', mr: 3 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img 
                src="/TruckBus (2).png" 
                alt="TruckBus Logo" 
                style={{ height: '40px', width: 'auto' }} 
              />
            </Link>
          </Box>
          
          {/* Mobil Menü İkonu (Sol tarafta kaldı) */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: 'center' }}>
            <IconButton size="large" onClick={handleOpenMobileMenu} color="inherit">
              <MenuIcon sx={{ color: 'white' }} />
            </IconButton>
          </Box>
          
          {/* Mobil Logo */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: 'center', mr: 2 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img 
                src="/TruckBus (2).png" 
                alt="TruckBus Logo" 
                style={{ height: '35px', width: 'auto' }} 
              />
            </Link>
          </Box>
          
          {/* Arama Çubuğu (Artık logonun yerini dolduruyor) */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, justifyContent: 'center', px: 2, ml: 2 }}>
            <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: 550 }}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Araç modeli, marka veya ilan numarası ile arayın..."
                sx={{
                  '& .MuiInputBase-root': { color: 'white', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)', },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.4)', },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.6)' }, // Odaklanma rengi sadeleştirildi
                  'input::placeholder': { color: 'rgba(255, 255, 255, 0.6)', opacity: 1, }
                }}
                InputProps={{
                  endAdornment: ( <InputAdornment position="end"><IconButton type="submit" size="small"><SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} /></IconButton></InputAdornment> ),
                }}
              />
            </form>
          </Box>
          
          {/* Sağ Taraftaki Butonlar */}
          <Box sx={{ flexGrow: 0, display: { xs: "none", md: "flex" }, alignItems: 'center', gap: 1.5, ml: 2 }}>
            {!isAuthenticated ? (
              <>
                <Button type="button" variant="text" sx={{ color: 'white', fontWeight: 500, textTransform: 'none' }} onClick={() => handleNavigate('/auth/login')}>
                  Giriş Yap
                </Button>
                <Button type="button" variant="outlined" sx={{ borderColor: 'rgba(255, 255, 255, 0.5)', color: 'white', fontWeight: 600, textTransform: 'none', borderRadius: '8px', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255, 255, 255, 0.08)'} }} onClick={() => handleNavigate('/auth/register')}>
                  Hesap Aç
                </Button>
              </>
            ) : (
              <Tooltip title="Hesabım ve Ayarlar">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: '#0d47a1', width: 40, height: 40 }}>
                    {user?.first_name?.[0]?.toUpperCase() ?? 'H'}
                  </Avatar>
                </IconButton>
              </Tooltip>
            )}
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1.5, borderColor: 'rgba(255, 255, 255, 0.12)' }} />

            {primaryAction}
          </Box>
        </Toolbar>
      </Container>
      
      {/* Mobil ve Kullanıcı Menüleri */}
      <Menu anchorEl={anchorElMobile} open={Boolean(anchorElMobile)} onClose={handleCloseMobileMenu} sx={{ display: { xs: 'block', md: 'none' } }}>
        <MenuItem> {/* Mobil Arama Çubuğu */}
            <TextField fullWidth autoFocus size="small" placeholder="Arama yapın..." variant="standard" />
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        {!isAuthenticated ? ([<MenuItem key="login" onClick={() => handleNavigate('/auth/login')}>Giriş Yap</MenuItem>, <MenuItem key="register" onClick={() => handleNavigate('/auth/register')}>Hesap Aç</MenuItem>]) : ([<MenuItem key="profile" onClick={() => handleNavigate('/user/profile')}>Profilim</MenuItem>, <MenuItem key="listings" onClick={() => handleNavigate('/user/listings')}>İlanlarım</MenuItem>, <MenuItem key="logout" onClick={handleLogout} sx={{color: 'error.main'}}>Çıkış Yap</MenuItem>])}
        <Divider sx={{ my: 1 }} /><Box sx={{ px: 2, py: 1 }}>{primaryAction}</Box>
      </Menu>
      <Menu anchorEl={anchorElUser} open={Boolean(anchorElUser)} onClose={handleCloseUserMenu} PaperProps={{ sx: { borderRadius: '8px', mt: 1.5, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}>
        <MenuItem onClick={() => handleNavigate('/user/profile')}>Profilim</MenuItem>
        <MenuItem onClick={() => handleNavigate('/user/listings')}>İlanlarım</MenuItem>
        <Divider /><MenuItem onClick={handleLogout} sx={{color: 'error.main'}}>Çıkış Yap</MenuItem>
      </Menu>
    </AppBar>
  );
};

export default UserHeader;