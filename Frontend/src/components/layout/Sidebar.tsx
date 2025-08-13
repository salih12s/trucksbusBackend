import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Material-UI Bileşenleri
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';

// Material-UI İkonları
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import HomeIcon from '@mui/icons-material/Home';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import RvHookupIcon from '@mui/icons-material/RvHookup';
import CarCrashIcon from '@mui/icons-material/CarCrash';

// Sidebar'daki her bir öğeyi ve ikonunu tanımlayan dizi
const sidebarItems = [
  { text: 'Tüm İlanlar', icon: <HomeIcon />, path: '/', color: '#3b82f6' },
  { text: 'Çekici', icon: <LocalShippingIcon />, path: '/category/cekici', color: '#ef4444' },
  { text: 'Dorse', icon: <RvHookupIcon />, path: '/category/dorse', color: '#f59e0b' },
  { text: 'Kamyon & Kamyonet', icon: <LocalShippingIcon />, path: '/category/kamyon', color: '#10b981' },
  { text: 'Karoser & Üst Yapı', icon: <GroupWorkIcon />, path: '/category/karoser', color: '#8b5cf6' },
  { text: 'Minibüs & Midibüs', icon: <DirectionsBusIcon />, path: '/category/minibus', color: '#06b6d4' },
  { text: 'Oto Kurtarıcı & Taşıyıcı', icon: <CarCrashIcon />, path: '/category/kurtarici', color: '#f97316' },
  { text: 'Otobüs', icon: <DirectionsBusIcon />, path: '/category/otobus', color: '#84cc16' },
  { text: 'Römork', icon: <RvHookupIcon />, path: '/category/romork', color: '#ec4899' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Box
      component="aside"
      sx={{
        width: isOpen ? 280 : 72,
        height: '100%',
        bgcolor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid #f1f5f9',
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 72,
      }}>
        {isOpen && (
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              color: '#0f172a',
              fontSize: '1.125rem',
            }}
          >
            Kategoriler
          </Typography>
        )}
        <IconButton 
          onClick={toggleSidebar}
          sx={{ 
            color: '#64748b',
            '&:hover': { 
              bgcolor: '#f8fafc',
              color: '#334155',
            },
            transition: 'all 0.2s ease',
            ...(isOpen ? {} : { mx: 'auto' })
          }}
        >
          {isOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      {/* Navigasyon Listesi */}
      <List sx={{ flex: 1, p: 2, pt: 1 }}>
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <Tooltip title={!isOpen ? item.text : ""} placement="right">
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={isActive}
                  sx={{
                    borderRadius: '10px',
                    minHeight: 48,
                    px: isOpen ? 2 : 1.5,
                    py: 1.5,
                    position: 'relative',
                    overflow: 'hidden',
                    // Modern gradient background for active state
                    background: isActive 
                      ? `linear-gradient(135deg, ${item.color}15, ${item.color}08)`
                      : 'transparent',
                    border: isActive ? `1px solid ${item.color}30` : '1px solid transparent',
                    
                    '&:hover': {
                      bgcolor: isActive ? 'transparent' : '#f8fafc',
                      background: isActive 
                        ? `linear-gradient(135deg, ${item.color}20, ${item.color}10)`
                        : '#f8fafc',
                      transform: 'translateX(2px)',
                    },
                    
                    '&.Mui-selected': {
                      bgcolor: 'transparent',
                    },
                    
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isOpen ? 2.5 : 0,
                      justifyContent: 'center',
                      color: isActive ? item.color : '#64748b',
                      fontSize: '1.25rem',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  
                  {isOpen && (
                    <ListItemText 
                      primary={item.text} 
                      sx={{ 
                        '& .MuiListItemText-primary': {
                          fontSize: '0.875rem',
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? '#0f172a' : '#475569',
                          transition: 'color 0.2s ease',
                          lineHeight: 1.4,
                        }
                      }} 
                    />
                  )}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <Box
                      sx={{
                        position: 'absolute',
                        right: 8,
                        width: 4,
                        height: 20,
                        bgcolor: item.color,
                        borderRadius: '2px',
                        opacity: isOpen ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar;