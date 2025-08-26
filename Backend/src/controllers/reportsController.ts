import { Request, Response } from 'express';
import { createReport, listMyReports, adminListReports, adminGetReport, adminUpdateStatus } from '../services/reportService2';
import { ReportStatus, ReportReason } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    username: string | null;
  };
}

// Input validation helpers
function validateReportInput(listingId: string, reasonCode: string, description: string) {
  const errors: string[] = [];
  
  if (!listingId?.trim()) errors.push('listingId is required');
  if (!reasonCode?.trim()) errors.push('reasonCode is required');
  if (!description?.trim()) errors.push('description is required');
  
  if (description && description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }
  if (description && description.trim().length > 2000) {
    errors.push('Description must be less than 2000 characters');
  }
  
  const validReasons = Object.values(ReportReason);
  if (reasonCode && !validReasons.includes(reasonCode as ReportReason)) {
    errors.push('Invalid reason code');
  }
  
  if (reasonCode === 'OTHER' && description && description.trim().length < 20) {
    errors.push('Other reason requires at least 20 characters');
  }
  
  return errors;
}

function validateStatusUpdate(status: string, resolutionNote?: string) {
  const errors: string[] = [];
  const validStatuses = ['OPEN', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'];
  
  if (!status) errors.push('status is required');
  if (!validStatuses.includes(status)) errors.push('Invalid status');
  
  if (resolutionNote && resolutionNote.length > 1000) {
    errors.push('Resolution note must be less than 1000 characters');
  }
  
  if (status === 'REJECTED' && (!resolutionNote || resolutionNote.trim().length < 10)) {
    errors.push('Resolution note is required and must be at least 10 characters when rejecting');
  }
  
  return errors;
}

export class ReportsController {
  
  // POST /api/reports - Şikayet oluştur
  static async createReport(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { listingId, reasonCode, description } = req.body;

      // Validasyon
      const validationErrors = validateReportInput(listingId, reasonCode, description);
      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: validationErrors[0] 
        });
      }

      const report = await createReport({
        listingId,
        reporterId: userId,
        reason: reasonCode as ReportReason,
        description: description.trim(),
      });

      return res.status(201).json({ 
        success: true, 
        data: { id: report.id, status: report.status },
        message: 'Report created successfully'
      });

    } catch (error: any) {
      console.error('Create report error:', error);
      const status = error?.code === 429 ? 429 : 400;
      return res.status(status).json({ 
        success: false, 
        message: error.message || 'Failed to create report' 
      });
    }
  }

  // GET /api/me/reports - Kullanıcının raporları
  static async getMyReports(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const status = req.query.status as ReportStatus | undefined;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await listMyReports(userId, { status, page, limit });

      return res.json({ 
        success: true, 
        ...result 
      });

    } catch (error: any) {
      console.error('Get my reports error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch reports' 
      });
    }
  }

  // GET /api/admin/reports - Admin rapor listesi
  static async adminGetReports(req: AuthenticatedRequest, res: Response) {
    try {
      const userRole = req.user?.role;
      if (userRole !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const status = req.query.status as ReportStatus | undefined;
      const reason = req.query.reason as ReportReason | undefined;
      const listingId = req.query.listingId as string | undefined;
      const q = req.query.q as string | undefined;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const result = await adminListReports({ status, reason, listingId, q, page, limit });

      return res.json({ 
        success: true, 
        ...result 
      });

    } catch (error: any) {
      console.error('Admin get reports error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch reports' 
      });
    }
  }

  // GET /api/admin/reports/:id - Admin rapor detayı
  static async adminGetReportDetail(req: AuthenticatedRequest, res: Response) {
    try {
      const userRole = req.user?.role;
      if (userRole !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const reportId = req.params.id;
      const report = await adminGetReport(reportId);

      return res.json({ 
        success: true, 
        data: report 
      });

    } catch (error: any) {
      console.error('Admin get report detail error:', error);
      return res.status(404).json({ 
        success: false, 
        message: error.message || 'Report not found' 
      });
    }
  }

  // PATCH /api/admin/reports/:id/status - Rapor durumu güncelle
  static async adminUpdateReportStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const userRole = req.user?.role;
      const userId = req.user?.id;
      if (userRole !== 'ADMIN' || !userId) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const reportId = req.params.id;
      const { status, resolutionNote, removeListing } = req.body;

      // Validasyon
      const validationErrors = validateStatusUpdate(status, resolutionNote);
      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: validationErrors[0] 
        });
      }

      const updated = await adminUpdateStatus({
        id: reportId,
        reviewerId: userId,
        status: status as 'OPEN' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED',
        resolutionNote,
        removeListing: Boolean(removeListing),
      });

      return res.json({ 
        success: true, 
        data: updated,
        message: 'Report status updated successfully'
      });

    } catch (error: any) {
      console.error('Admin update report status error:', error);
      return res.status(400).json({ 
        success: false, 
        message: error.message || 'Failed to update report status' 
      });
    }
  }
}
