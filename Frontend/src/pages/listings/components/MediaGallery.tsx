import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  IconButton,
  Dialog,
  DialogContent,
  useTheme,
  useMediaQuery,
  Skeleton,
  Typography,
  Fade
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Close,
  Fullscreen,
  ZoomIn,
  ZoomOut
} from '@mui/icons-material';

interface MediaItem {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  sort?: number;
}

interface MediaGalleryProps {
  items: MediaItem[];
  initialIndex?: number;
  aspectRatio?: string; // e.g., '4/3', '16/9', '1/1'
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
  items,
  initialIndex = 0,
  aspectRatio = '4/3'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [lightboxZoom, setLightboxZoom] = useState(1);

  // Sort items by sort order
  const sortedItems = React.useMemo(() => {
    if (!items?.length) return [];
    return [...items].sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }, [items]);

  const currentItem = sortedItems[currentIndex];
  const hasMultiple = sortedItems.length > 1;

  // Handle image load
  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => new Set([...prev, index]));
  }, []);

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : sortedItems.length - 1);
    setLightboxZoom(1);
  }, [sortedItems.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => prev < sortedItems.length - 1 ? prev + 1 : 0);
    setLightboxZoom(1);
  }, [sortedItems.length]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
    setLightboxZoom(1);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (lightboxOpen) {
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            goToPrevious();
            break;
          case 'ArrowRight':
            event.preventDefault();
            goToNext();
            break;
          case 'Escape':
            event.preventDefault();
            setLightboxOpen(false);
            break;
          case '+':
          case '=':
            event.preventDefault();
            setLightboxZoom(prev => Math.min(prev + 0.5, 3));
            break;
          case '-':
            event.preventDefault();
            setLightboxZoom(prev => Math.max(prev - 0.5, 0.5));
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, goToPrevious, goToNext]);

  // Touch/swipe handling for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && hasMultiple) {
      goToNext();
    }
    if (isRightSwipe && hasMultiple) {
      goToPrevious();
    }
  };

  if (!sortedItems.length) {
    return (
      <Box
        sx={{
          aspectRatio: isMobile ? '1/1' : aspectRatio,
          bgcolor: 'grey.100',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'grey.500'
        }}
      >
        <Typography variant="body2">Görsel Bulunamadı</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Main Image Container */}
      <Box
        sx={{
          position: 'relative',
          aspectRatio: isMobile ? '1/1' : aspectRatio,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'grey.100',
          cursor: 'pointer',
          '&:hover .nav-button': {
            opacity: hasMultiple ? 1 : 0
          }
        }}
        onClick={() => setLightboxOpen(true)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading skeleton */}
        {!loadedImages.has(currentIndex) && (
          <Skeleton
            variant="rectangular"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1
            }}
          />
        )}

        {/* Main Image */}
        <Box
          component="img"
          src={currentItem.url}
          alt={currentItem.alt || `Görsel ${currentIndex + 1}`}
          onLoad={() => handleImageLoad(currentIndex)}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'opacity 0.3s ease',
            opacity: loadedImages.has(currentIndex) ? 1 : 0
          }}
          loading={currentIndex === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />

        {/* Navigation Arrows */}
        {hasMultiple && (
          <>
            <IconButton
              className="nav-button"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.7)'
                }
              }}
            >
              <ChevronLeft />
            </IconButton>

            <IconButton
              className="nav-button"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.7)'
                }
              }}
            >
              <ChevronRight />
            </IconButton>
          </>
        )}

        {/* Image Counter */}
        {hasMultiple && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 500
            }}
          >
            {currentIndex + 1} / {sortedItems.length}
          </Box>
        )}

        {/* Fullscreen Icon */}
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setLightboxOpen(true);
          }}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            opacity: 0.8,
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              opacity: 1
            }
          }}
        >
          <Fullscreen fontSize="small" />
        </IconButton>
      </Box>

      {/* Thumbnails */}
      {hasMultiple && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mt: 2,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            '&::-webkit-scrollbar': {
              height: 4
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'grey.100',
              borderRadius: 2
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'grey.400',
              borderRadius: 2
            }
          }}
        >
          {sortedItems.map((item, index) => (
            <Box
              key={`thumb-${index}`}
              onClick={() => goToIndex(index)}
              sx={{
                flexShrink: 0,
                width: 80,
                height: 60,
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                border: currentIndex === index ? '2px solid' : '2px solid transparent',
                borderColor: currentIndex === index ? 'primary.main' : 'transparent',
                transition: 'all 0.2s ease',
                scrollSnapAlign: 'start',
                '&:hover': {
                  borderColor: 'primary.main',
                  opacity: currentIndex === index ? 1 : 0.8
                }
              }}
            >
              <Box
                component="img"
                src={item.url}
                alt={item.alt || `Küçük görsel ${index + 1}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                loading="lazy"
                decoding="async"
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Lightbox Modal */}
      <Dialog
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        maxWidth={false}
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            bgcolor: 'black',
            m: 0,
            ...(isMobile ? {} : {
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: 2
            })
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', overflow: 'hidden' }}>
          {/* Close Button */}
          <IconButton
            onClick={() => setLightboxOpen(false)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 10,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)'
              }
            }}
          >
            <Close />
          </IconButton>

          {/* Zoom Controls */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 10,
              display: 'flex',
              gap: 1
            }}
          >
            <IconButton
              onClick={() => setLightboxZoom(prev => Math.max(prev - 0.5, 0.5))}
              disabled={lightboxZoom <= 0.5}
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.7)'
                }
              }}
            >
              <ZoomOut fontSize="small" />
            </IconButton>
            
            <IconButton
              onClick={() => setLightboxZoom(prev => Math.min(prev + 0.5, 3))}
              disabled={lightboxZoom >= 3}
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.7)'
                }
              }}
            >
              <ZoomIn fontSize="small" />
            </IconButton>
          </Box>

          {/* Lightbox Image */}
          <Box
            sx={{
              width: '100%',
              height: isMobile ? '100vh' : '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <Box
              component="img"
              src={currentItem.url}
              alt={currentItem.alt || `Büyük görsel ${currentIndex + 1}`}
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                transform: `scale(${lightboxZoom})`,
                transition: 'transform 0.3s ease',
                cursor: lightboxZoom > 1 ? 'move' : 'zoom-in'
              }}
            />
          </Box>

          {/* Lightbox Navigation */}
          {hasMultiple && (
            <>
              <IconButton
                onClick={goToPrevious}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.7)'
                  }
                }}
              >
                <ChevronLeft />
              </IconButton>

              <IconButton
                onClick={goToNext}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.7)'
                  }
                }}
              >
                <ChevronRight />
              </IconButton>

              {/* Lightbox Counter */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                {currentIndex + 1} / {sortedItems.length}
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MediaGallery;
