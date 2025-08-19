import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import HomeIcon from "@mui/icons-material/Home";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import RvHookupIcon from "@mui/icons-material/RvHookup";
import CarCrashIcon from "@mui/icons-material/CarCrash";

/** 🎨 Renkler */
const PRIMARY_DARK = "#2D3748";
const LOGO_RED = "#E14D43";
const BORDER = "#E2E8F0";
const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#6B7280";

/** Gruplar ve başlıklar */
const GROUP_TITLES: Record<string, string> = {
  "agir-ticari": "AĞIR TİCARİ",
  "yolcu-tasima": "YOLCU TAŞIMA",
  "ozel-araclar": "ÖZEL ARAÇLAR",
};

type Item = {
  text: string;
  icon: React.ReactNode;
  path: string;
  group: keyof typeof GROUP_TITLES;
};

const sidebarItems: Item[] = [
  { text: "Tüm İlanlar", icon: <HomeIcon sx={{ fontSize: 22 }} />, path: "/", group: "ana" },

  { text: "Çekici", icon: <LocalShippingIcon sx={{ fontSize: 22 }} />, path: "/category/cekici", group: "agir-ticari" },
  { text: "Dorse", icon: <RvHookupIcon sx={{ fontSize: 22 }} />, path: "/category/dorse", group: "agir-ticari" },
  { text: "Kamyon & Kamyonet", icon: <LocalShippingIcon sx={{ fontSize: 22 }} />, path: "/category/kamyon", group: "agir-ticari" },
  { text: "Römork", icon: <RvHookupIcon sx={{ fontSize: 22 }} />, path: "/category/romork", group: "agir-ticari" },

  { text: "Minibüs & Midibüs", icon: <DirectionsBusIcon sx={{ fontSize: 22 }} />, path: "/category/minibus", group: "yolcu-tasima" },
  { text: "Otobüs", icon: <DirectionsBusIcon sx={{ fontSize: 22 }} />, path: "/category/otobus", group: "yolcu-tasima" },

  { text: "Karoser & Üst Yapı", icon: <GroupWorkIcon sx={{ fontSize: 22 }} />, path: "/category/karoser", group: "ozel-araclar" },
  { text: "Oto Kurtarıcı & Taşıyıcı", icon: <CarCrashIcon sx={{ fontSize: 22 }} />, path: "/category/kurtarici", group: "ozel-araclar" },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen((p) => !p);

  const isRouteActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <Box
      component="aside"
      sx={{
        position: "sticky", // ✅ sticky
        top: 76, // ✅ header yüksekliği
        width: isOpen ? 280 : 88, // ✅ 300 → 280
        height: "calc(100vh - 76px)", // ✅ sticky için yükseklik
        bgcolor: "white",
        border: `1px solid ${BORDER}`,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",               // ✅ taşmaları kes
        boxSizing: "border-box",
        transition: "width .3s cubic-bezier(0.4, 0, 0.2, 1)",
        // Scrollbar'ları gizle
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        '&': {
          scrollbarWidth: 'none', // Firefox için
          msOverflowStyle: 'none', // IE/Edge için
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 2,
          borderBottom: `1px solid ${BORDER}`,
          display: "flex",
          alignItems: "center",
          justifyContent: isOpen ? "space-between" : "center",
          minHeight: 72,
        }}
      >
        {isOpen && (
          <Typography variant="h6" sx={{ fontWeight: 800, color: TEXT_PRIMARY, letterSpacing: "-.01em" }}>
            Kategoriler
          </Typography>
        )}
        <IconButton
          onClick={toggleSidebar}
          sx={{ color: TEXT_SECONDARY, "&:hover": { bgcolor: alpha(TEXT_SECONDARY, 0.08) } }}
        >
          {isOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      {/* Liste (scroll güvenli) */}
      <List
        sx={{
          flex: 1,
          px: 1.5,                         // ✅ yan güvenlik payı
          py: 2,
          overflowY: "auto",               // ✅ dikey taşma olursa kaydır
          maxHeight: "calc(100vh - 140px)", // header yüksekliğine göre ayarla
          // Scrollbar'ları gizle
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '&': {
            scrollbarWidth: 'none', // Firefox için
            msOverflowStyle: 'none', // IE/Edge için
          },
        }}
      >
        {sidebarItems.map((item, i) => {
          const isActive = isRouteActive(item.path);
          const prev = sidebarItems[i - 1];
          const showGroupHeader = isOpen && (i === 0 || !prev || prev.group !== item.group);

          const button = (
            <ListItemButton
              component={Link}
              to={item.path}
              selected={isActive}
              sx={{
                position: "relative",
                height: 48,
                borderRadius: 12,           // yuvarlak istemiyorsan 12 ideal
                mx: 0,                      // ✅ genişliği taşırma
                pl: isOpen ? 4 : 3,         // 32px / 24px
                pr: isOpen ? 2.5 : 2,
                alignItems: "center",
                justifyContent: isOpen ? "flex-start" : "center",
                color: isActive ? LOGO_RED : TEXT_SECONDARY,

                ...(isActive && {
                  bgcolor: alpha(LOGO_RED, 0.10),
                  "&::before": {            // ✅ şerit tamamen içeride
                    content: '""',
                    position: "absolute",
                    left: 8,
                    top: 10,
                    bottom: 10,
                    width: 3,
                    backgroundColor: LOGO_RED,
                    borderRadius: 999,
                  },
                  "& .MuiListItemText-primary": { color: PRIMARY_DARK, fontWeight: 700 },
                  boxShadow: "0 2px 8px rgba(225,77,67,0.08)", // ✅ hafif shadow
                }),

                "&:hover": {
                  bgcolor: isActive ? alpha(LOGO_RED, 0.14) : alpha(LOGO_RED, 0.05),
                  color: LOGO_RED,
                  "& .MuiListItemIcon-root": { transform: "scale(1.06)" },
                },

                transition: "background-color .2s ease, color .2s ease",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: isOpen ? 40 : 0,
                  mr: isOpen ? 1.5 : 0,
                  color: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform .2s ease",
                }}
              >
                {item.icon}
              </ListItemIcon>

              {isOpen && (
                <ListItemText
                  primary={item.text}
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontSize: 14,
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? PRIMARY_DARK : TEXT_PRIMARY,
                    },
                  }}
                />
              )}
            </ListItemButton>
          );

          return (
            <React.Fragment key={`${item.group}-${item.text}`}>
              {showGroupHeader && (
                <Typography
                  variant="overline"
                  sx={{
                    display: "block",
                    color: TEXT_SECONDARY,
                    px: 1,
                    pt: i === 0 ? 0 : 1.25,
                    pb: 0.5,
                    letterSpacing: ".08em",
                    fontWeight: 700,
                  }}
                >
                  {GROUP_TITLES[item.group]}
                </Typography>
              )}

              <ListItem disablePadding sx={{ mb: 0.5 }}>
                {!isOpen ? (
                  <Tooltip title={item.text} placement="right" arrow>
                    <Box sx={{ width: "100%" }}>{button}</Box>
                  </Tooltip>
                ) : (
                  button
                )}
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar;
