import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper,
  Stack,
} from '@mui/material';
import {
  Speed,
  Build,
  Palette,
  LocalGasStation,
  Settings,
  Info,
} from '@mui/icons-material';
import { AttributeGroup, ListingValues } from '../../../types/listing-detail';

interface SpecGroupProps {
  groups: AttributeGroup[];
  values: ListingValues;
}

// Icon mapping for common attributes
const getAttributeIcon = (key: string) => {
  if (key.includes('engine') || key.includes('motor')) return <Speed />;
  if (key.includes('fuel') || key.includes('yakit')) return <LocalGasStation />;
  if (key.includes('color') || key.includes('renk')) return <Palette />;
  if (key.includes('transmission') || key.includes('vites')) return <Settings />;
  if (key.includes('feature') || key.includes('ozellik')) return <Build />;
  return <Info />;
};

// Format values based on type
const formatValue = (value: any, dataType: string, unit?: string): React.ReactNode => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  switch (dataType) {
    case 'NUMBER':
      const numValue = typeof value === 'number' ? value : parseFloat(value);
      if (isNaN(numValue)) return null;
      
      const formattedNumber = new Intl.NumberFormat('tr-TR').format(numValue);
      return unit ? `${formattedNumber} ${unit}` : formattedNumber;

    case 'BOOLEAN':
      const boolValue = value === true || value === 'true' || value === '1';
      return (
        <Chip 
          label={boolValue ? 'Evet' : 'Hayır'} 
          size="small" 
          color={boolValue ? 'success' : 'default'}
          variant="outlined"
        />
      );

    case 'MULTISELECT':
      const arrayValue = Array.isArray(value) ? value : 
                        typeof value === 'string' ? [value] : [];
      
      if (arrayValue.length === 0) return null;
      
      return (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {arrayValue.map((item, index) => (
            <Chip 
              key={index}
              label={item}
              size="small"
              variant="outlined"
              color="primary"
            />
          ))}
        </Stack>
      );

    case 'ENUM':
    case 'TEXT':
    default:
      return String(value);
  }
};

// Check if value is considered "filled"
const hasValue = (value: any): boolean => {
  if (value === null || value === undefined || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'boolean') return true; // Booleans are always considered filled
  return true;
};

const SpecGroup: React.FC<SpecGroupProps> = ({ groups, values }) => {
  // Filter groups that have at least one filled attribute
  const filledGroups = groups.filter(group => 
    group.attributes.some(attr => hasValue(values[attr.key]))
  );

  if (filledGroups.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Bu ilan için teknik özellik bilgisi bulunmamaktadır.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      {filledGroups.map((group) => {
        // Filter attributes that have values
        const filledAttributes = group.attributes.filter(attr => hasValue(values[attr.key]));
        
        if (filledAttributes.length === 0) return null;

        return (
          <Paper key={group.key} elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2,
              color: 'primary.main',
              fontWeight: 600
            }}>
              {getAttributeIcon(group.key)}
              {group.label}
            </Typography>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr'
              },
              gap: 2
            }}>
              {filledAttributes
                .sort((a, b) => a.order - b.order)
                .map((attribute) => {
                  const value = values[attribute.key];
                  const formattedValue = formatValue(value, attribute.data_type, attribute.unit);
                  
                  if (!formattedValue) return null;

                  return (
                    <Box key={attribute.key}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontWeight: 500, mb: 0.5 }}
                      >
                        {attribute.label}
                      </Typography>
                      <Box>
                        {formattedValue}
                      </Box>
                    </Box>
                  );
                })}
            </Box>
          </Paper>
        );
      })}
    </Stack>
  );
};

export default SpecGroup;
