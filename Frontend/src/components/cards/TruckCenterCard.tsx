import { Card, CardContent, Typography, Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Person, Phone, CalendarToday, Visibility, Chat, Flag, Bookmark, Check, Close, Edit } from '@mui/icons-material';
import { SimpleListing } from '../../context/ListingContext';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { isPositiveNumber, formatPhoneForDisplay, formatKMForDisplay, formatYearForDisplay } from '../../utils/present';

// CSS animasyonu (Değişiklik yok)
const pulseKeyframes = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseKeyframes;
  document.head.appendChild(style);
}

interface TruckCenterCardProps {
  listing: SimpleListing;
  isOwn?: boolean;
  onFavoriteClick?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onSendMessage?: (id: string) => void;
  onReport?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  isAdminView?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

/** Buton stilleri theme değerleriyle uyumlu hale getirildi */
const ActionButton: React.FC<{
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'soft' | 'danger' | 'info' | 'neutral' | 'secondary';
  compact?: boolean;
}> = ({ label, icon, onClick, variant = 'soft', compact = false }) => {
  const theme = useTheme();
  
  const base = {
    fontSize: { xs: compact ? 8 : 10, md: compact ? 9 : 12 }, // Mobile'da küçük font
    fontWeight: 600, // Slightly bolder for better readability
    borderRadius: '12px', // Theme'den alınan border radius
    px: { xs: compact ? 0.5 : 1, md: compact ? 0.8 : 1.2 }, // Mobile'da küçük padding
    py: { xs: compact ? 0.3 : 0.5, md: compact ? 0.5 : 0.7 },
    minWidth: { xs: compact ? '60px' : 'auto', md: compact ? '72px' : 'auto' }, // Mobile'da küçük
    width: { xs: compact ? '60px' : '100%', md: compact ? '72px' : '100%' },
    height: { xs: compact ? '26px' : 'auto', md: compact ? '30px' : 'auto' },
    border: '1px solid',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    userSelect: 'none' as const,
    whiteSpace: 'nowrap' as const,
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
    },
    '&:focus-visible': { // ✅ A11y focus ring - yumuşak
      outline: '2px solid #6B7280',
      outlineOffset: '2px',
    },
  };

  // CTA Hiyerarşisi: daha az kırmızı, daha yumuşak
  const variants: Record<string, any> = {
    primary: { // ✅ "Detaylar" - Sadeleşmiş birincil
      background: theme.palette.text.primary,
      color: 'white',
      borderColor: theme.palette.text.primary,
      fontWeight: 600,
      '&:hover': { 
        background: theme.palette.text.secondary,
        borderColor: theme.palette.text.secondary,
        boxShadow: `0 8px 20px ${alpha(theme.palette.text.primary, 0.15)}`
      },
    },
    secondary: { // ✅ "Mesaj" - İkincil
      background: theme.palette.background.paper,
      color: theme.palette.text.primary,
      borderColor: theme.palette.grey[300],
      '&:hover': { 
        background: theme.palette.grey[50],
        borderColor: theme.palette.grey[400]
      },
    },
    soft: { // ✅ "Kaydet/Şikayet" - Çok yumuşak
      background: theme.palette.grey[100],
      color: theme.palette.text.secondary,
      borderColor: 'transparent',
      '&:hover': { 
        background: theme.palette.grey[200],
        color: theme.palette.text.primary,
      },
    },
    neutral: { // Nötr durumlar için
      background: alpha(theme.palette.text.secondary, 0.05),
      color: theme.palette.text.secondary,
      borderColor: 'transparent',
      '&:hover': { 
        background: alpha(theme.palette.text.secondary, 0.1),
        color: theme.palette.text.primary
      },
    },
  };

  return (
    <Box
      component="button"
      type="button"
      sx={{ ...base, ...variants[variant] }}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      title={label}
    >
      {icon && <Box sx={{ 
        fontSize: { xs: compact ? '10px' : '14px', md: compact ? '12px' : '16px' }, 
        display: 'flex', 
        alignItems: 'center' 
      }}>{icon}</Box>}
      {label && <Box sx={{ 
        fontSize: { xs: compact ? 7 : 9, md: compact ? 9 : 12 }, 
        fontWeight: 600, 
        lineHeight: 1 
      }}>{label}</Box>}
    </Box>
  );
};

const TruckCenterCard: React.FC<TruckCenterCardProps> = ({
  listing,
  isOwn = false,
  onFavoriteClick,
  onViewDetails,
  onSendMessage,
  onReport,
  onDelete,
  onEdit,
  isAdminView = false,
  onApprove,
  onReject,
}) => {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const theme = useTheme();

  const idStr = String(listing.id);

  const handleViewDetails = () => onViewDetails?.(idStr);

  const handleFavoriteClick = async () => {
    await toggleFavorite(idStr);
    onFavoriteClick?.(idStr); // eski callback uyumluluğu
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(price);
  
  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return 'Tarih belirtilmemiş';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Geçerli bir tarih olup olmadığını kontrol et
      if (isNaN(dateObj.getTime())) {
        return 'Geçersiz tarih';
      }
      
      return dateObj.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (error) {
      console.error('❌ Date formatting error:', error);
      return 'Tarih hatası';
    }
  };

  return (
    <Card
      onClick={(e) => {
        e.stopPropagation();
        handleViewDetails();
      }}
      sx={{
        // Premium kart stili - yeni gölge sistemi
        width: '100%',
        maxWidth: { xs: '100%', sm: 400, md: 420 }, // Responsive max width
        height: { xs: 'auto', md: 280 }, // Mobile'da otomatik yükseklik
        minHeight: { xs: 200, md: 280 }, // Mobile için minimum yükseklik
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' }, // Mobile'da dikey, desktop'ta yatay
        borderRadius: { xs: 2, md: 0 }, // Mobile'da rounded, desktop'ta düz
        border: `1px solid #EEF2F7`,
        bgcolor: 'background.paper',
        boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.05)', md: '0 6px 18px rgba(0,0,0,0.06)' }, // Mobile'da az gölge
        transition: 'all 0.15s ease',
        '&:hover': {
          transform: { xs: 'none', md: 'translateY(-2px)' }, // Mobile'da hover efekti yok
          boxShadow: { xs: '0 4px 12px rgba(0,0,0,0.08)', md: '0 10px 24px rgba(0,0,0,0.08)' },
          borderColor: theme.palette.grey[400],
        },
        '&:focus-visible': { // A11y focus ring
          outline: '2px solid #6B7280',
          outlineOffset: '2px',
        },
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* SOL: Görsel + Aksiyonlar */}
      <Box sx={{ 
        width: { xs: '100%', md: '48%' }, // Mobile'da tam genişlik, desktop'ta %48
        display: 'flex', 
        flexDirection: 'column', 
        borderRight: { xs: 'none', md: `1px solid #EEF2F7` }, // Mobile'da border yok
        borderBottom: { xs: `1px solid #EEF2F7`, md: 'none' } // Mobile'da alt border
      }}>
        <Box sx={{ 
          position: 'relative', 
          aspectRatio: { xs: '16/9', md: '4/3' }, // Mobile'da 16:9, desktop'ta 4:3
          overflow: 'hidden',
          borderTopLeftRadius: 0, // ✅ border radius kaldırıldı
          borderTopRightRadius: { xs: 0, md: 0 }, // Mobile'da sağ üst köşe de düz
          bgcolor: theme.palette.grey[100]
        }}>
          <Box 
            component="img"
            src={listing.images?.[0] || '/placeholder-truck.jpg'}
            alt={listing.title}
            loading="lazy" // ✅ lazy loading
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { transform: 'scale(1.05)' } // ✅ daha yumuşak zoom
            }}
          />
        </Box>

        <Box sx={{ 
          p: 1, 
          flex: { xs: 0, md: 1 }, // Mobile'da flex yok, desktop'ta flex
          minHeight: { xs: 50, md: 'auto' }, // Mobile için minimum yükseklik
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          bgcolor: alpha(theme.palette.text.secondary, 0.03)
        }}>
          {!user ? (
            <Box sx={{ width: '100%', px: 1 }}>
              <ActionButton
                label="Detayları Gör"
                icon={<Visibility />}
                variant="soft"
                onClick={handleViewDetails}
              />
            </Box>
          ) : (
            <Box
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: { 
                  xs: 'repeat(2, 1fr)', // Mobile'da 2 kolon
                  sm: 'repeat(3, 1fr)', // Small tablet'te 3 kolon  
                  md: '1fr 1fr' // Desktop'ta 2 kolon
                }, 
                gap: { xs: 0.5, md: 0.75 }, 
                width: '100%', 
                height: { xs: 'auto', md: '64px' },
                '& > *': {
                  fontSize: { xs: '0.7rem', md: '0.75rem' }, // Mobile'da küçük metin
                }
              }}
            >
              {isAdminView ? (
                <>
                  <ActionButton label="Onayla" icon={<Check />} variant="primary" compact onClick={() => onApprove?.(listing.id)} />
                  <ActionButton label="Reddet" icon={<Close />} variant="soft" compact onClick={() => onReject?.(listing.id)} />
                </>
              ) : isOwn ? (
                // Kendi ilanları için özel butonlar
                <>
                  <ActionButton label="Detaylar" icon={<Visibility />} variant="primary" compact onClick={() => onViewDetails?.(listing.id)} />
                  <ActionButton label="Düzenle" icon={<Edit />} variant="secondary" compact onClick={() => onEdit?.(listing.id)} />
                </>
              ) : (
                <>
                  <ActionButton label="Detaylar" icon={<Visibility />} variant="primary" compact onClick={() => onViewDetails?.(listing.id)} />
                  {listing.user_id !== user?.id && <ActionButton label="Mesaj" icon={<Chat />} variant="secondary" compact onClick={() => onSendMessage?.(listing.id)} />}
                  {!isOwn && <ActionButton label="Şikayet" icon={<Flag />} variant="soft" compact onClick={() => onReport?.(idStr)} />}
                  <ActionButton 
                    label={isFavorite(idStr) ? 'Kaydedildi' : 'Kaydet'} 
                    icon={<Bookmark />} 
                    variant={isFavorite(idStr) ? 'primary' : 'neutral'} 
                    compact 
                    onClick={handleFavoriteClick} 
                  />
                </>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* SAĞ: Bilgi alanı */}
      <CardContent sx={{ 
        width: { xs: '100%', md: '52%' }, // Mobile'da tam genişlik, desktop'ta %52
        p: { xs: 1.5, md: 1.5 }, // Padding aynı
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        minHeight: { xs: 120, md: 'auto' } // Mobile için minimum yükseklik
      }}>
        <Box>
          <Typography 
            component="h3" 
            sx={{ 
              fontSize: { xs: 16, md: 14 }, // Mobile'da daha büyük font
              fontWeight: 700, 
              color: theme.palette.text.primary, 
              mb: 0.75, // ✅ margin'i 1'den 0.75'e düşürdük
              display: '-webkit-box', 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical', 
              overflow: 'hidden', 
              lineHeight: 1.2 // ✅ line-height'ı 1.3'ten 1.2'ye düşürdük
            }}
          >
            {listing.title}
          </Typography>
          
          {/* Fiyat stili - daha yumuşak renk */}
          <Typography sx={{ 
            fontSize: { xs: 24, md: 22 }, // Mobile'da daha büyük fiyat
            fontWeight: 800, 
            color: theme.palette.text.primary, // ✅ kırmızı yerine koyu gri
            mb: 1.5, // ✅ 12px (fiyat → meta)
          }}>
            {formatPrice(listing.price)}
          </Typography>
          {/* Conditionally render KM only if it has a value */}
          {isPositiveNumber(listing.km) && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <KeyboardArrowRightIcon sx={{ 
                fontSize: 13, 
                mr: 0.75, 
                color: theme.palette.text.secondary 
              }} />
              <Typography variant="caption" sx={{ 
                color: theme.palette.text.secondary, 
                fontSize: 12 
              }}>
                KM: {formatKMForDisplay(listing.km)}
              </Typography>            
            </Box>
          )}

          {/* Conditionally render Model Year only if it has a value */}
          {isPositiveNumber(listing.year) && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <KeyboardArrowRightIcon sx={{ 
                fontSize: 13, 
                mr: 0.75, 
                color: theme.palette.text.secondary 
              }} />
              <Typography variant="caption" sx={{ 
                color: theme.palette.text.secondary, 
                fontSize: 12 
              }}>
                Model Yılı: {formatYearForDisplay(listing.year)}
              </Typography>
            </Box>
          )}
       
        </Box>

        <Box sx={{ mt: 1 }}> {/* ✅ 16px (meta → aksiyonlar) */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <CalendarToday sx={{ 
              fontSize: 13, 
              mr: 0.75, 
              color: theme.palette.text.secondary 
            }} />
            <Typography variant="caption" sx={{ 
              color: theme.palette.text.secondary, 
              fontSize: 12 
            }}>
              İlan Tarihi: {formatDate(listing.createdAt)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Person sx={{ 
              fontSize: 13, 
              mr: 0.75, 
              color: theme.palette.text.secondary 
            }} />
            <Typography variant="caption" sx={{ 
              color: theme.palette.text.secondary, 
              fontSize: 12 
            }}>
              İlan Sahibi: {listing.owner.name}
            </Typography>
          </Box>

          {/* Telefon kutusu - sade ama belirgin */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: '8px 10px', 
            backgroundColor: theme.palette.grey[50], // ✅ çok hafif arka plan
            border: `1px solid ${theme.palette.grey[200]}`, // ✅ ince border
            borderRadius: 1, // ✅ minimal köşe
          }}>
            <Phone sx={{ 
              fontSize: 12, 
              mr: 1.5,
              color: theme.palette.text.primary, // ✅ normal renk
            }} />
            <Typography sx={{ 
              color: theme.palette.text.primary, 
              fontSize: 14, // ✅ diğerlerinden biraz büyük
              fontWeight: 600, // ✅ diğerlerinden daha kalın
              fontFamily: 'monospace',
              letterSpacing: 0.5,
            }}>
              {formatPhoneForDisplay(listing.owner.phone)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TruckCenterCard;