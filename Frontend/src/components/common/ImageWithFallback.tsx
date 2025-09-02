import React from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = '/TruckBus.png',
  onError,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = React.useState(src);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`❌ Image load failed: ${currentSrc}`);
    
    if (onError) {
      onError(event);
    }

    if (!hasError) {
      console.log(`🔄 Trying fallback: ${fallbackSrc}`);
      setCurrentSrc(fallbackSrc);
      setHasError(true);
    } else {
      console.log('⚠️ Fallback also failed, keeping current src');
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};
