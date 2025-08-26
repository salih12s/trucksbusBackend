import React from 'react';
import {
  Box,
  Chip,
  Stack,
} from '@mui/material';
import {
  CalendarToday,
  Speed,
  LocationOn,
  DirectionsCar,
  Category,
  Visibility,
} from '@mui/icons-material';
import { BaseInfo } from '../../../types/listing-detail';

interface MetaChipsProps {
  base: BaseInfo;
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('tr-TR').format(num);
};

const MetaChips: React.FC<MetaChipsProps> = ({ base }) => {
  const chips: Array<{
    label: string;
    icon: React.ReactElement;
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  }> = [];

  // Year
  if (base.year) {
    chips.push({
      label: base.year.toString(),
      icon: <CalendarToday fontSize="small" />,
      color: 'primary'
    });
  }

  // Kilometers
  if (base.km && base.km > 0) {
    chips.push({
      label: `${formatNumber(base.km)} km`,
      icon: <Speed fontSize="small" />,
      color: 'info'
    });
  }

  // Location
  if (base.locationText && base.locationText !== 'Konum belirtilmemiş') {
    chips.push({
      label: base.locationText,
      icon: <LocationOn fontSize="small" />,
      color: 'secondary'
    });
  }

  // Brand & Model
  const vehicleInfo = [base.brand?.name, base.model?.name, base.variant?.name]
    .filter(Boolean)
    .join(' ');
  
  if (vehicleInfo) {
    chips.push({
      label: vehicleInfo,
      icon: <DirectionsCar fontSize="small" />,
      color: 'default'
    });
  }

  // Category & Vehicle Type
  const categoryInfo = [base.category?.name, base.vehicle_type?.name]
    .filter(Boolean)
    .join(' / ');
  
  if (categoryInfo) {
    chips.push({
      label: categoryInfo,
      icon: <Category fontSize="small" />,
      color: 'default'
    });
  }

  // Views
  if (typeof base.views === 'number' && base.views > 0) {
    chips.push({
      label: `${formatNumber(base.views)} görüntülenme`,
      icon: <Visibility fontSize="small" />,
      color: 'success'
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Stack 
        direction="row" 
        spacing={1} 
        flexWrap="wrap"
        sx={{ gap: 1 }}
      >
        {chips.map((chip, index) => (
          <Chip
            key={index}
            label={chip.label}
            icon={chip.icon}
            color={chip.color}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiChip-icon': {
                fontSize: '16px'
              }
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default MetaChips;
