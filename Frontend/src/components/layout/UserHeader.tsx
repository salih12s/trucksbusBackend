import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import FeedbackRounded from '@mui/icons-material/FeedbackRounded';
import NotificationDetailModal from "../modals/NotificationDetailModal";
import { useFavorites } from '../../context/FavoritesContext';
import FeedbackModal from '../modals/FeedbackModal';
import { useNotifications } from '../../hooks/useNotifications';

// 🎨 YENİ PALET — Logo ile %100 Uyumlu
const PRIMARY_DARK = "#2D3748"; // Logonun antrasit/füme tonu
const LOGO_RED = "#E14D43";     // Logonun canlı kırmızısı (Vurgu ve CTA için)
const LOGO_RED_HOVER = "#D34237"; // Kırmızı hover tonu

const UserHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { favoritesCount } = useFavorites();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const [query, setQuery] = useState("");
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElMobile, setAnchorElMobile] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

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
  const handleMarkAllAsRead = () => markAsRead();
  const handleNotificationItemClick = (n: any) => {
    // İlan yayınlandı bildirimlerinde ilana git
    if (n.type === "LISTING_PUBLISHED" && n.data?.listing_id) {
      navigate(`/listings/${n.data.listing_id}`);
    } 
    // Feedback yanıtı bildirimlerinde modal aç
    else if (n.type === "FEEDBACK_RESPONSE") {
      setSelectedNotification(n);
      setIsNotificationModalOpen(true);
      setNotificationAnchor(null); // Notification dropdown'unu kapat
    } 
    // Mesaj bildirimlerinde konuşmaya git
    else if (n.type === "message" && n.conversationId) {
      navigate(`/real-time-messages?conversation=${n.conversationId}`);
    } 
    // Diğer durumlarda mesajlar sayfasına git
    else {
      navigate("/real-time-messages");
    }
    
    markAsRead(n.id);
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
    { label: "Profil", path: "/profile" },
    { label: "İlanlarım", path: "/my-listings" },
    { label: "Favorilerim", path: "/favorites" },
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
    gap: { xs: 0.5, sm: 2 },
    justifyContent: "space-between",
    alignItems: "center",
    px: { xs: 1, sm: 2 }, // Mobile'da daha az padding
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
    src="/TruckBus.png"
    alt="TruckBus"
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
      

          {/* Right */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1.5 }, ml: { xs: 1, sm: 2 } }}>
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
                p: { xs: 0.5, sm: 1 },
              }}
            >
              <SearchRounded sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>

            {/* Desktop Icons Container */}
            <Box sx={{ 
              display: { xs: "none", sm: "flex" }, 
              alignItems: "center", 
              gap: { sm: 1, md: 1.5 },
              mr: { sm: 1, md: 2 },
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
                  
                  {/* Feedback */}
                  <Tooltip title="Geri Bildirim">
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
                      onClick={() => setFeedbackOpen(true)}
                    >
                      <FeedbackRounded />
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
                                            <Badge badgeContent={unreadCount} sx={{ "& .MuiBadge-badge": { bgcolor: LOGO_RED } }}>
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
                minWidth: { sm: 100, md: 140 },
                fontWeight: 700,
                letterSpacing: 0.4,
                borderRadius: 999,
                px: { sm: 1.5, md: 2.4 },
                py: 1,
                fontSize: { sm: '0.8rem', md: '0.875rem' },
                transition: 'all 0.2s ease',
                boxShadow: `0 2px 8px rgba(225, 77, 67, 0.2)`,
              }}
            >
              {/* Mobile'da kısa metin */}
              <Box sx={{ display: { sm: 'block', md: 'none' } }}>İLAN</Box>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>İLAN VER</Box>
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
                p: { xs: 0.5 },
              }}
              onClick={handleCreateAdClick}
            >
              <AddCircleRounded sx={{ fontSize: { xs: 20 } }} />
            </IconButton>

            {isAuthenticated ? (
              <>
                {/* Avatar - Mobile and Desktop */}
                <Tooltip title="Kullanıcı Menüsü">
                  <IconButton
                    onClick={handleUserMenuOpen}
                    sx={{ 
                      p: { xs: 0.3, sm: 0.5 },
                      "&:hover": {
                        bgcolor: alpha("#fff", 0.1),
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s ease',
                      borderRadius: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: { xs: 32, sm: 36 },
                        height: { xs: 32, sm: 36 },
                        bgcolor: LOGO_RED,
                        fontSize: { xs: 12, sm: 13 },
                        fontWeight: 800,
                        border: `2px solid ${alpha("#ffffff", 0.8)}`,
                        boxShadow: `0 2px 8px rgba(0,0,0,0.15)`,
                      }}
                      src={user?.avatar}
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
                  color="inherit"
                  onClick={() => navigate("/auth/login")}
                  sx={{ 
                    fontWeight: 700, 
                    minWidth: { xs: 50, sm: 80 }, 
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    "&:hover": { 
                      bgcolor: alpha("#fff", 0.1),
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                    borderRadius: 2,
                    px: { xs: 1, sm: 2 },
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
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    boxShadow: `0 2px 8px rgba(225, 77, 67, 0.2)`,
                    px: { xs: 1, sm: 2 },
                  }}
                >
                  <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Kayıt</Box>
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Kayıt Ol</Box>
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
      
      {/* User Menu */}
      <Menu 
        anchorEl={anchorElUser} 
        open={Boolean(anchorElUser)} 
        onClose={handleUserMenuClose}
        PaperProps={{
          elevation: 4,
          sx: {
            overflow: "visible",
            mt: 1.5,
            minWidth: 290,
            borderRadius: 2,
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 16,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        onClick={handleUserMenuClose}
      >
        <Box sx={{ p: 2, pb: 1.5, borderBottom: "1px solid #eee" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar 
              sx={{ bgcolor: LOGO_RED, width: 42, height: 42 }}
              src={user?.avatar}
            >
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <MenuItem onClick={() => navigate("/profile")}>
          <PersonOutlineRounded sx={{ mr: 1.5 }} /> Profil
        </MenuItem>
        <MenuItem onClick={() => navigate("/my-listings")}>
          <StorefrontRounded sx={{ mr: 1.5 }} /> İlanlarım
        </MenuItem>
        <MenuItem onClick={() => navigate("/real-time-messages")}>
          <ChatBubbleRounded sx={{ mr: 1.5 }} /> Mesajlarım
        </MenuItem>
        <MenuItem onClick={() => navigate("/my-reports")}>
          <ReportGmailerrorredRounded sx={{ mr: 1.5 }} /> Şikayetlerim
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutRounded sx={{ mr: 1.5 }} /> Çıkış Yap
        </MenuItem>
      </Menu>
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
            {notifications && notifications.filter((n: any) => !n.is_read).length > 0 && ( 
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
                  backgroundColor: n.is_read ? "transparent" : alpha(LOGO_RED, 0.08), 
                  borderBottom: "1px solid #eee", 
                  "&:hover": { backgroundColor: alpha(LOGO_RED, 0.12) }, 
                  cursor: "pointer" 
                }}
              > 
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: n.type === "FEEDBACK_RESPONSE" ? "#4CAF50" : n.type === "LISTING_PUBLISHED" ? LOGO_RED : PRIMARY_DARK }}>
                    {n.type === "FEEDBACK_RESPONSE" ? <FeedbackRounded /> : 
                     n.type === "LISTING_PUBLISHED" ? <NotificationsRounded /> : 
                     <ChatBubbleRounded />}
                  </Avatar>
                </ListItemAvatar> 
                <ListItemText 
                  primary={<Typography variant="subtitle2" sx={{ fontWeight: n.is_read ? 500 : 800 }}>{n.title}</Typography>} 
                  secondary={n.message} 
                /> 
              </ListItem> 
            ))} 
          </List> 
        )} 
      </Popover>

      {/* Feedback Modal */}
      <FeedbackModal 
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        open={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notification={selectedNotification}
      />
    </AppBar>
  );
};

export default UserHeader;