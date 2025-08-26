import React, { useState } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Close,
  Fullscreen
} from '@mui/icons-material';

interface MediaItem {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  sort?: number;
}

interface ImageCarouselProps {
  images: MediaItem[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <Paper 
        sx={{ 
          height: 400, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'grey.100',
          color: 'grey.500'
        }}
      >
        <Typography variant="h6">Fotoğraf yok</Typography>
      </Paper>
    );
  }

  const handlePrevious = () => {
    setSelectedImageIndex(prev => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setSelectedImageIndex(prev => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const selectedImage = images[selectedImageIndex];

  return (
    <>
      {/* Main Image Display */}
      <Paper elevation={2} sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
        <Box
          sx={{
            position: 'relative',
            height: 400,
            cursor: 'pointer'
          }}
          onClick={() => setDialogOpen(true)}
        >
          <Box
            component="img"
            src={selectedImage.url}
            alt={selectedImage.alt || `İlan fotoğrafı ${selectedImageIndex + 1}`}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                }}
              >
                <ChevronLeft />
              </IconButton>
              
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                }}
              >
                <ChevronRight />
              </IconButton>
            </>
          )}

          {/* Fullscreen Button */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setDialogOpen(true);
            }}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
            }}
          >
            <Fullscreen />
          </IconButton>

          {/* Image Counter */}
          {images.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                bgcolor: 'rgba(0,0,0,0.7)',
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: 1
              }}
            >
              <Typography variant="body2">
                {selectedImageIndex + 1} / {images.length}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <Stack direction="row" spacing={1} mt={2} sx={{ overflowX: 'auto', pb: 1 }}>
          {images.map((image, index) => (
            <Box
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              sx={{
                minWidth: 80,
                height: 60,
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                border: index === selectedImageIndex ? 2 : 1,
                borderColor: index === selectedImageIndex ? 'primary.main' : 'grey.300',
                opacity: index === selectedImageIndex ? 1 : 0.7,
                '&:hover': { opacity: 1 }
              }}
            >
              <Box
                component="img"
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>
          ))}
        </Stack>
      )}

      {/* Fullscreen Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth={false}
        sx={{
          '& .MuiDialog-paper': {
            width: '90vw',
            height: '90vh',
            maxWidth: 'none',
            maxHeight: 'none'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setDialogOpen(false)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              zIndex: 1,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
            }}
          >
            <Close />
          </IconButton>
          
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'black'
            }}
          >
            <Box
              component="img"
              src={selectedImage.url}
              alt={selectedImage.alt || `İlan fotoğrafı ${selectedImageIndex + 1}`}
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          </Box>

          {images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevious}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                }}
              >
                <ChevronLeft />
              </IconButton>
              
              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                }}
              >
                <ChevronRight />
              </IconButton>
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ bgcolor: 'black', color: 'white' }}>
          <Typography variant="body2">
            {selectedImageIndex + 1} / {images.length}
          </Typography>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: 'white' }}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ImageCarousel;
