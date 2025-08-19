import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWebSocketContext } from "../../context/WebSocketContext";

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
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Popover,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

// Icons (clean)
import SearchRounded from "@mui/icons-material/SearchRounded";
import AddCircleRounded from "@mui/icons-material/AddCircleRounded";
import NotificationsRounded from "@mui/icons-material/NotificationsRounded";
import ChatBubbleRounded from "@mui/icons-material/ChatBubbleRounded";
import PersonOutlineRounded from "@mui/icons-material/PersonOutlineRounded";
import StorefrontRounded from "@mui/icons-material/StorefrontRounded";
import ReportGmailerrorredRounded from "@mui/icons-material/ReportGmailerrorredRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useFavorites } from '../../context/FavoritesContext';

// 🎨 YENİ PALET — Logo ile %100 Uyumlu
const PRIMARY_DARK = "#2D3748"; // Logonun antrasit/füme tonu
const LOGO_RED = "#E14D43";     // Logonun canlı kırmızısı (Vurgu ve CTA için)
const LOGO_RED_HOVER = "#D34237"; // Kırmızı hover tonu

const UserHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount, notifications, markAsRead } = useWebSocketContext();
  const { favoritesCount } = useFavorites();

  const [query, setQuery] = useState("");
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElMobile, setAnchorElMobile] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

  // Auto-logout timer (30 dakika = 1800000 ms)
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const LOGOUT_TIME = 30 * 60 * 1000; // 30 dakika

  // Kullanıcı aktivitesini izle ve auto-logout timer'ı yönet
  useEffect(() => {
    if (!isAuthenticated) {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
      return;
    }

    const resetTimer = () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      
      logoutTimerRef.current = setTimeout(() => {
        logout();
        navigate("/auth/login");
      }, LOGOUT_TIME);
    };

    const handleActivity = () => {
      if (isAuthenticated) {
        resetTimer();
      }
    };

    // İlk timer'ı başlat
    resetTimer();

    // Aktivite event listener'ları
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isAuthenticated, logout, navigate]);

  // İlan Ver butonları için auth kontrolü
  const handleCreateAdClick = () => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }
    navigate("/category-selection");
  };
  
  const handleNotificationClose = () => setNotificationAnchor(null);
  const handleMarkAllAsRead = () => markAsRead?.();
  const handleNotificationItemClick = (n: any) => {
    if (n.type === "message" && n.conversationId) {
      navigate(`/real-time-messages?conversation=${n.conversationId}`);
    } else {
      navigate("/real-time-messages");
    }
    markAsRead?.(n.id);
    setNotificationAnchor(null);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/?search=${encodeURIComponent(query)}`);
  };
  const handleUserMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorElUser(e.currentTarget);
  const handleUserMenuClose = () => setAnchorElUser(null);
  const handleMobileMenuClose = () => setAnchorElMobile(null);
  const handleLogout = () => {
    logout();
    setAnchorElUser(null);
    navigate("/");
  };
  const menuItems = [
    { label: "Ana Sayfa", path: "/" },
    { label: "Kategoriler", path: "/categories" },
  ];

  return (
<AppBar
  position="sticky"
  elevation={0}
  sx={{
    backgroundColor: PRIMARY_DARK,
    borderBottom: `1px solid ${alpha("#ffffff", 0.1)}`,
    zIndex: (theme) => theme.zIndex.drawer + 1,
    overflow: "visible", // taşan büyük logo görünür
  }}
>
      <Container maxWidth="xl">
       <Toolbar
  disableGutters
  sx={{
    minHeight: { xs: 64, md: 76 },
    gap: 2,
    justifyContent: "space-between",
    alignItems: "center", // 👈
  }}
>
          {/* --- DEĞİŞİKLİK: LOGO BÜYÜTME VE "FLOATING" EFEKTİ --- */}
          {/* Header yüksekliğini sabit tutarken logoyu büyütmek için */}
          {/* logoyu kendi container'ından taşıyoruz. */}
        {/* --- BÜYÜK “FLOATING” LOGO (header boyunu büyütmez) --- */}
{/* --- BÜYÜK ve ORTALANMIŞ “FLOATING” LOGO --- */}
<Box
  component={Link}
  to="/"
  sx={{
    position: "relative",
    display: "block",
    textDecoration: "none",
    zIndex: 2,

    // Bu kutu header’ı büyütmez, sadece yer tutar
    width: { xs: 120, md: 190 },
    height: { xs: 56, md: 64 }, // Toolbar yüksekliğine yakın
    "&:hover .logo-img": {
      transform: {
        xs: "translateY(-50%) scale(1.03)",
        md: "translateY(-50%) scale(1.06)",
      },
    },
  }}
>
  <Box
    component="img"
    src="/xad.png"
    alt="Truck-Bus"
    className="logo-img"
    sx={{
      position: "absolute",
      left: 0,
      top: "50%",                     // 🔥 dikey merkez
      transform: "translateY(-50%)",  // 🔥 tam ortalama
      height: { xs: 96, md: "clamp(120px, 11vw, 160px)" }, // büyük ama header büyümez
      objectFit: "contain",
      filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.35))",
      pointerEvents: "none",          // tıklama alanı link kutusu
      transition: "transform 0.2s ease",
    }}
  />
</Box>
          {/* Search - Desktop */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: { xs: "none", md: "flex" },
              flex: 1,
              justifyContent: "center", // ✅ merkezde konumlandır
              maxWidth: 680, // ✅ maksimum genişlik kilit
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Araç veya yedek parça ara…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      type="submit" 
                      edge="end"
                      sx={{
                        color: alpha('#ffffff', 0.8), // ✅ beyaz icon
                        '&:hover': {
                          backgroundColor: alpha('#ffffff', 0.1), // ✅ yumuşak hover
                          color: '#ffffff',
                        },
                        '&:focus-visible': {
                          outline: `2px solid #ffffff`,
                          outlineOffset: 2,
                        },
                      }}
                    >
                      <SearchRounded />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                width: "100%",
                maxWidth: 680, // ✅ sabitle
                borderRadius: 999, // ✅ tam yuvarlak
                "& .MuiOutlinedInput-root": { 
                  height: 44, // ✅ yükseklik kilit
                  fontWeight: 400,
                  backgroundColor: 'transparent', // ✅ arka plan kaldır
                  "& fieldset": { 
                    borderColor: alpha('#ffffff', 0.15), // ✅ sadece ince border
                    transition: 'all 0.2s ease-in-out',
                  },
                  "&:hover fieldset": {
                    borderColor: alpha('#ffffff', 0.3),
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: '#ffffff',
                    borderWidth: '1px', // ✅ 2px'den 1px'e
                  },
                  px: 2,
                  "& input": {
                    fontSize: '0.95rem',
                    fontWeight: 400,
                    color: '#ffffff', // ✅ beyaz yazı
                    "&::placeholder": { 
                      opacity: 0.7,
                      color: alpha('#ffffff', 0.7), // ✅ beyaz placeholder
                    },
                  },
                },
              }}
            />
          </Box>

          {/* Right */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 2 }}> {/* ✅ gap: 12px, İLAN VER ile ikonlar arası ml: 2 */}
            {/* Mobile Search */}
            <IconButton
              sx={{
                display: { xs: "flex", md: "none" },
                color: "white",
                opacity: 0.9,
                "&:hover": { 
                  opacity: 1, 
                  bgcolor: alpha("#fff", 0.1),
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
                borderRadius: 2,
              }}
              onClick={() => {
                const q = prompt("Araç ara:");
                if (q) navigate(`/?search=${encodeURIComponent(q)}`);
              }}
            >
              <SearchRounded />
            </IconButton>

            {/* Desktop Icons Container */}
            <Box sx={{ 
              display: { xs: "none", sm: "flex" }, 
              alignItems: "center", 
              gap: 1.5,
              mr: 2,
            }}>
              {isAuthenticated && (
                <>
                  {/* Messages */}
                  <Tooltip title="Mesajlar">
                    <IconButton
                      sx={{ 
                        color: "white", 
                        opacity: 0.9, 
                        "&:hover": { 
                          opacity: 1, 
                          bgcolor: alpha("#fff", 0.1),
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease',
                        borderRadius: 2,
                      }}
                      onClick={() => navigate("/real-time-messages")}
                    >
                      <Badge badgeContent={unreadCount} color="error">
                        <ChatBubbleRounded />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                  
                  {/* Notifications */}
                  <Tooltip title="Bildirimler">
                    <IconButton
                      sx={{ 
                        color: "white", 
                        opacity: 0.9, 
                        "&:hover": { 
                          opacity: 1, 
                          bgcolor: alpha("#fff", 0.1),
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease',
                        borderRadius: 2,
                      }}
                      onClick={(e) => setNotificationAnchor(e.currentTarget)}
                    >
                      <Badge badgeContent={0} sx={{ "& .MuiBadge-badge": { bgcolor: LOGO_RED } }}>
                        <NotificationsRounded />
                      </Badge>
                    </IconButton>
                  </Tooltip>

                    <Tooltip title="Kaydedilenler">
                    <IconButton
                      sx={{ 
                        color: "white", 
                        opacity: 0.9, 
                        "&:hover": { 
                          opacity: 1, 
                          bgcolor: alpha("#fff", 0.1),
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease',
                        borderRadius: 2,
                      }}
                      onClick={() => navigate("/favorites")}
                    >
                      <Badge badgeContent={favoritesCount > 0 ? favoritesCount : null} color="error">
                        <BookmarkIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>

                 
                </>
              )}
            </Box>

            {/* İLAN VER */}
            <Button
              variant="contained"
              startIcon={<AddCircleRounded />}
              onClick={handleCreateAdClick}
              disableElevation
              sx={{
                display: { xs: "none", sm: "flex" },
                bgcolor: LOGO_RED,
                "&:hover": { 
                  bgcolor: LOGO_RED_HOVER,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 6px 16px rgba(225, 77, 67, 0.3)`,
                },
                minWidth: 140,
                fontWeight: 700,
                letterSpacing: 0.4,
                borderRadius: 999,
                px: 2.4,
                py: 1,
                transition: 'all 0.2s ease',
                boxShadow: `0 2px 8px rgba(225, 77, 67, 0.2)`,
              }}
            >
              İLAN VER
            </Button>

            {/* Mobile Add */}
            <IconButton
              sx={{
                display: { xs: "flex", sm: "none" },
                color: "white",
                bgcolor: LOGO_RED,
                "&:hover": { 
                  bgcolor: LOGO_RED_HOVER,
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
                borderRadius: 2,
              }}
              onClick={handleCreateAdClick}
            >
              <AddCircleRounded />
            </IconButton>

            {isAuthenticated ? (
              <>
                {/* Avatar - Mobile and Desktop */}
                <Tooltip title="Kullanıcı Menüsü">
                  <IconButton
                    onClick={handleUserMenuOpen}
                    sx={{ 
                      p: 0.5,
                      "&:hover": {
                        bgcolor: alpha("#fff", 0.1),
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s ease',
                      borderRadius: 2,
                    }}
                  >
                    <Avatar
                      src={user?.avatar || undefined}
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: LOGO_RED,
                        fontSize: 13,
                        fontWeight: 800,
                        border: `2px solid ${alpha("#ffffff", 0.8)}`,
                        boxShadow: `0 2px 8px rgba(0,0,0,0.15)`,
                      }}
                    >
                      {user?.first_name?.charAt(0)}
                      {user?.last_name?.charAt(0)}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Button
                
                  onClick={() => navigate("/auth/login")}
                  sx={{ 
                    color: "#fff",
                    fontWeight: 700, 
                    minWidth: { xs: 60, sm: 80 }, 
                    "&:hover": { 
                      color: "#fff",
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                    borderRadius: 2,
                  }}
                >
                  Giriş
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate("/auth/register")}
                  disableElevation
                  sx={{ 
                    bgcolor: LOGO_RED, 
                    "&:hover": { 
                      bgcolor: LOGO_RED_HOVER,
                      transform: 'translateY(-1px)',
                      boxShadow: `0 6px 16px rgba(225, 77, 67, 0.3)`,
                    }, 
                    fontWeight: 700, 
                    minWidth: { xs: 60, sm: 100 },
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    boxShadow: `0 2px 8px rgba(225, 77, 67, 0.2)`,
                  }}
                >
                  Kayıt Ol
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
      
      {/* ... (Açılır menüler aynı kalıyor) ... */}
      <Menu anchorEl={anchorElUser} open={Boolean(anchorElUser)} onClose={handleUserMenuClose} PaperProps={{ elevation: 4, sx: { overflow: "visible", mt: 1.5, minWidth: 290, borderRadius: 2, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))", "&:before": { content: '""', display: "block", position: "absolute", top: 0, right: 16, width: 10, height: 10, bgcolor: "background.paper", transform: "translateY(-50%) rotate(45deg)", zIndex: 0, }, }, }} transformOrigin={{ horizontal: "right", vertical: "top" }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }} onClick={handleUserMenuClose} > <Box sx={{ p: 2, pb: 1.5, borderBottom: "1px solid #eee" }}> <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}> <Avatar sx={{ bgcolor: LOGO_RED, width: 42, height: 42 }}> {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)} </Avatar> <Box> <Typography variant="subtitle1" sx={{ fontWeight: 800 }}> {user?.first_name} {user?.last_name} </Typography> <Typography variant="body2" color="text.secondary"> {user?.email} </Typography> </Box> </Box> </Box> <MenuItem onClick={() => navigate("/profile")}><PersonOutlineRounded sx={{ mr: 1.5 }} /> Profil</MenuItem> <MenuItem onClick={() => navigate("/my-listings")}><StorefrontRounded sx={{ mr: 1.5 }} /> İlanlarım</MenuItem> <MenuItem onClick={() => navigate("/real-time-messages")}><ChatBubbleRounded sx={{ mr: 1.5 }} /> Mesajlarım</MenuItem> <MenuItem onClick={() => navigate("/my-reports")}><ReportGmailerrorredRounded sx={{ mr: 1.5 }} /> Şikayetlerim</MenuItem> <MenuItem onClick={() => navigate("/settings")}><SettingsRounded sx={{ mr: 1.5 }} /> Ayarlar</MenuItem> <Divider /> <MenuItem onClick={handleLogout}><LogoutRounded sx={{ mr: 1.5 }} /> Çıkış Yap</MenuItem> </Menu>
      <Menu anchorEl={anchorElMobile} open={Boolean(anchorElMobile)} onClose={handleMobileMenuClose} PaperProps={{ elevation: 3, sx: { mt: 1.5, minWidth: 220, borderRadius: 2 } }} > {menuItems.map((m) => ( <MenuItem key={m.path} onClick={() => { navigate(m.path); handleMobileMenuClose(); }}> {m.label} </MenuItem> ))} </Menu>
      
      {/* Notifications Popover */}
      <Popover 
        open={Boolean(notificationAnchor)} 
        anchorEl={notificationAnchor} 
        onClose={handleNotificationClose} 
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }} 
        transformOrigin={{ vertical: "top", horizontal: "right" }} 
        PaperProps={{ sx: { mt: 1, maxHeight: 420, width: 360, borderRadius: 2 } }} 
      > 
        <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}> 
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}> 
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Bildirimler</Typography> 
            {notifications && notifications.filter((n: any) => !n.isRead).length > 0 && ( 
              <Button size="small" onClick={handleMarkAllAsRead}>Tümünü Oku</Button> 
            )} 
          </Box> 
        </Box> 
        {!notifications || notifications.length === 0 ? ( 
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">Henüz bildirim yok</Typography>
          </Box> 
        ) : ( 
          <List sx={{ p: 0, maxHeight: 340, overflow: "auto" }}> 
            {notifications.slice(0, 10).map((n: any) => ( 
              <ListItem 
                key={n.id} 
                onClick={() => handleNotificationItemClick(n)} 
                sx={{ 
                  backgroundColor: n.isRead ? "transparent" : alpha(LOGO_RED, 0.08), 
                  borderBottom: "1px solid #eee", 
                  "&:hover": { backgroundColor: alpha(LOGO_RED, 0.12) }, 
                  cursor: "pointer" 
                }}
              > 
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: n.type === "message" ? PRIMARY_DARK : LOGO_RED }}>
                    {n.type === "message" ? <ChatBubbleRounded /> : <NotificationsRounded />}
                  </Avatar>
                </ListItemAvatar> 
                <ListItemText 
                  primary={<Typography variant="subtitle2" sx={{ fontWeight: n.isRead ? 500 : 800 }}>{n.title}</Typography>} 
                  secondary={n.content} 
                /> 
              </ListItem> 
            ))} 
          </List> 
        )} 
      </Popover>
    </AppBar>
  );
};

export default UserHeader;