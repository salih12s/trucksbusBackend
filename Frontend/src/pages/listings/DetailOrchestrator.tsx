// ==========================
// file: src/pages/listing/DetailOrchestrator.tsx
// ==========================
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';
import { api } from '../../services/api';
import SmartTemplate from './templates/SmartTemplate';

interface DetailResponse {
  success: boolean;
  data: {
    base: {
      id: string;
      title: string;
      description?: string;
      price?: number;
      status: string;
      isApproved: boolean;
      views?: number;
      category: { id: string; name: string; slug: string };
      vehicle_type?: { id: string; name: string; slug: string };
      brand?: { id: string; name: string };
      model?: { id: string; name: string };
      variant?: { id: string; name: string };
      year?: number;
      km?: number;
      locationText?: string;
      createdAt: string;
      updatedAt: string;
      seller: { name: string; phone?: string; email?: string };
      media?: Array<{ url: string; width?: number; height?: number; alt?: string; sort?: number; }>;
      features?: Record<string, string>; // Backend'den işlenmiş features
    };
    schema: {
      groups: Array<{
        key: string;
        label: string;
        order: number;
        attributes: Array<{
          key: string;
          label: string;
          data_type: string;
          input_type: string;
          unit?: string;
          icon?: string;
          order: number;
          is_required?: boolean;
        }>;
      }>;
      flat: Array<{
        key: string;
        label: string;
        data_type: string;
        input_type: string;
        unit?: string;
        icon?: string;
        order: number;
        is_required?: boolean;
      }>;
    };
    values: Record<string, any>;
  };
}

const normalizeMedia = (media?: Array<any>) => {
  if (!Array.isArray(media)) return [];
  const list = media
    .filter((m) => m && m.url)
    .map((m) => ({ url: m.url, alt: m.alt, width: m.width, height: m.height, sort: m.sort ?? 0 }));
  const uniq = Array.from(new Map(list.map((x) => [x.url, x])).values());
  return uniq.sort((a, b) => (a.sort || 0) - (b.sort || 0));
};

const DetailOrchestrator: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['listing-details', id],
    queryFn: async () => {
      const response = await api.get<DetailResponse>(`/listings/${id}/details`);
      const payload = response.data;
      // ✅ media guard & normalize
      if (payload?.data?.base) {
        payload.data.base.media = normalizeMedia(payload.data.base.media);
      }
      return payload;
    },
    enabled: !!id,
    staleTime: 60_000, // 1 dakika cache
    retry: (failureCount, err: any) => {
      const status = err?.response?.status;
      if (status && status >= 400 && status < 500) return false;
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error || !data?.success) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <button
              onClick={() => refetch()}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Tekrar Dene
            </button>
          }
        >
          İlan detayları yüklenirken bir hata oluştu.
        </Alert>
      </Container>
    );
  }

  const { base, schema, values } = data.data;

  return (
    <SmartTemplate
      base={{
        ...base,
        media: base.media || [],
        features: base.features // Backend'den gelen işlenmiş features
      }}
      schema={schema}
      values={values}
    />
  );
};

export default DetailOrchestrator;