import { api } from './api';

export type ReportReason = 'FRAUD' | 'NUDITY' | 'WRONG_CATEGORY' | 'MISLEADING_INFO' | 'COPYRIGHT' | 'OTHER';
export type ReportStatus = 'OPEN' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';

export interface CreateReportRequest {
  listingId: string;
  reasonCode: ReportReason;
  description: string;
}

export interface Report {
  id: string;
  listing_id: string;
  reporter_id: string;
  owner_id: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  resolution_note?: string;
  reviewer_id?: string;
  created_at: string;
  updated_at: string;
  listing?: {
    id: string;
    title: string;
    moderation_status?: string;
    price?: number;
  };
  reporter?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  owner?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  reviewer?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  history?: Array<{
    id: string;
    action: string;
    from_status?: ReportStatus;
    to_status?: ReportStatus;
    note?: string;
    created_at: string;
    actor?: {
      id: string;
      first_name: string;
      last_name: string;
    };
  }>;
}

export const reportService = {
  // Şikayet oluştur
  async createReport(payload: CreateReportRequest) {
    const response = await api.post('/reports', payload);
    return response.data;
  },

  // Kullanıcının şikayetleri
  async getUserReports(params?: { status?: ReportStatus; page?: number; limit?: number }) {
    const response = await api.get('/me/reports', { params });
    return response.data;
  },

  // Admin: Rapor listesi
  async adminGetReports(params?: {
    status?: ReportStatus;
    reason?: ReportReason;
    listingId?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get('/admin/reports', { params });
    return response.data;
  },

  // Admin: Rapor detayı
  async adminGetReportDetail(id: string): Promise<Report> {
    const response = await api.get(`/admin/reports/${id}`);
    return response.data.data; // sadece raporu döndür
  },

  // Admin: Rapor durumu güncelle
  async adminUpdateReportStatus(id: string, body: { 
    status: ReportStatus; 
    resolutionNote?: string; 
    removeListing?: boolean;
  }) {
    const response = await api.patch(`/admin/reports/${id}/status`, body);
    return response.data;
  },
};

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'FRAUD', label: 'Dolandırıcılık şüphesi' },
  { value: 'NUDITY', label: 'Uygunsuz içerik' },
  { value: 'WRONG_CATEGORY', label: 'Yanlış kategori' },
  { value: 'MISLEADING_INFO', label: 'Yanıltıcı bilgi' },
  { value: 'COPYRIGHT', label: 'Telif ihlali' },
  { value: 'OTHER', label: 'Diğer' },
];

export function getReasonLabel(reason: ReportReason): string {
  const found = REPORT_REASONS.find(r => r.value === reason);
  return found ? found.label : reason;
}

export function getStatusLabel(status: ReportStatus): string {
  const statusLabels: Record<ReportStatus, string> = {
    'OPEN': 'Açık',
    'UNDER_REVIEW': 'İnceleniyor',
    'ACCEPTED': 'Kabul Edildi',
    'REJECTED': 'Reddedildi',
  };
  return statusLabels[status] || status;
}
