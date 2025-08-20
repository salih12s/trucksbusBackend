import { prisma } from '../utils/database';
import { getIO, emitToAdmins, emitToUser } from '../utils/socket';
import { NotificationService } from './notificationService';
import { ReportReason, ModerationStatus } from '@prisma/client';

export async function createReport({
  listingId,
  reporterId,
  description,
  reason,
}: {
  listingId: string;
  reporterId: string;
  description: string;
  reason: ReportReason;
}) {
  const listing = await prisma.listings.findUnique({ 
    where: { id: listingId }, 
    select: { id: true, user_id: true, title: true } 
  });

  if (!listing) throw new Error("Listing not found");

  if (listing.user_id === reporterId) throw new Error("You cannot report your own listing");

  // 24 saat içinde aynı ilan için tekrar raporlama engeli
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await prisma.reports.findFirst({
    where: { listing_id: listingId, reporter_id: reporterId, created_at: { gte: since } },
  });
  if (recent) {
    const e: any = new Error("You already reported this listing in the last 24h");
    e.code = 429;
    throw e;
  }

  // Kayıt + history (transaction)
  const created = await prisma.$transaction(async (tx) => {
    const report = await tx.reports.create({
      data: {
        listing_id: listingId,
        reporter_id: reporterId,
        owner_id: listing.user_id,
        reason,
        description,
        status: 'OPEN',
      },
      include: {
        reporter: { select: { id: true, first_name: true, last_name: true } },
        listing: { select: { title: true } },
      },
    });

    await tx.report_history.create({
      data: {
        report_id: report.id,
        action: 'CREATE',
        note: 'Report created',
      },
    });

    return report;
  });

  // Socket.IO event - Room-based notification to admins
  emitToAdmins('admin:report:new', {
    reportId: created.id,
    listingId,
    listingTitle: created.listing?.title || 'İlan',
    reporterName: `${created.reporter.first_name} ${created.reporter.last_name}`,
    reason,
    createdAt: created.created_at,
  });

  // Kalıcı admin bildirimi - offline admin'ler için
  try {
    const admins = await prisma.users.findMany({ 
      where: { role: 'ADMIN', is_active: true }, 
      select: { id: true } 
    });
    
    if (admins.length) {
      await prisma.notifications.createMany({
        data: admins.map(a => ({
          id: `admin_report_${created.id}_${a.id}_${Date.now()}`,
          user_id: a.id,
          type: 'REPORT_NEW',
          title: 'Yeni şikayet',
          message: `"${created.listing?.title ?? 'İlan'}" için şikayet oluşturuldu`,
          data: { reportId: created.id, listingId } as any,
        }))
      });
    }
  } catch (error) {
    console.error('Error creating admin notifications:', error);
  }

  return created;
}

export async function listMyReports(userId: string, q: { status?: string; page?: number; limit?: number }) {
  const page = q.page && q.page > 0 ? q.page : 1;
  const limit = q.limit && q.limit > 0 ? q.limit : 10;
  const where: any = { reporter_id: userId };
  if (q.status) where.status = q.status;

  const [items, total] = await Promise.all([
    prisma.reports.findMany({
      where,
      include: {
        listing: { select: { id: true, title: true } },
        history: { 
          include: { actor: { select: { id: true, first_name: true, last_name: true } } },
          orderBy: { created_at: 'asc' } 
        },
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.reports.count({ where }),
  ]);

  return { items, total, page, limit };
}

export async function adminListReports(params: {
  status?: string;
  reason?: string;
  listingId?: string;
  q?: string;
  page?: number;
  limit?: number;
}) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 20;

  const where: any = {};
  if (params.status) where.status = params.status;
  if (params.reason) where.reason = params.reason;
  if (params.listingId) where.listing_id = params.listingId;

  // Enhanced search with OR logic across multiple fields
  if (params.q && params.q.trim()) {
    const searchTerm = params.q.trim();
    where.OR = [
      { description: { contains: searchTerm, mode: 'insensitive' } },
      { listing: { title: { contains: searchTerm, mode: 'insensitive' } } },
      { 
        reporter: {
          OR: [
            { first_name: { contains: searchTerm, mode: 'insensitive' } },
            { last_name: { contains: searchTerm, mode: 'insensitive' } },
          ]
        }
      },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.reports.findMany({
      where,
      include: {
        listing: { select: { id: true, title: true } },
        reporter: { select: { id: true, first_name: true, last_name: true } },
        reviewer: { select: { id: true, first_name: true, last_name: true } },
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.reports.count({ where }),
  ]);

  return { items, total, page, limit };
}

export async function adminGetReport(id: string) {
  const report = await prisma.reports.findUnique({
    where: { id },
    include: {
      listing: { select: { id: true, title: true, price: true } },
      reporter: { select: { id: true, first_name: true, last_name: true } },
      owner: { select: { id: true, first_name: true, last_name: true } },
      reviewer: { select: { id: true, first_name: true, last_name: true } },
      history: { 
        include: { actor: { select: { id: true, first_name: true, last_name: true } } },
        orderBy: { created_at: 'asc' } 
      },
    },
  });
  if (!report) throw new Error('Report not found');
  return report;
}

export async function adminUpdateStatus({
  id,
  reviewerId,
  status,
  resolutionNote,
  removeListing,
}: {
  id: string;
  reviewerId: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';
  resolutionNote?: string;
  removeListing?: boolean;
}) {
  const report = await prisma.reports.findUnique({ where: { id } });
  if (!report) throw new Error('Report not found');

  if (status === 'REJECTED' && !resolutionNote) {
    throw new Error('Resolution note is required when rejecting');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const prev = report.status;

    const r = await tx.reports.update({
      where: { id },
      data: {
        status: status as any,
        resolution_note: resolutionNote ?? null,
        reviewer_id: reviewerId,
      },
      include: {
        reporter: { select: { id: true, first_name: true, last_name: true } },
        owner: { select: { id: true } },
        listing: { select: { id: true, title: true } },
        reviewer: { select: { id: true, first_name: true, last_name: true } }, // 👈 ekle
      },
    });

    await tx.report_history.create({
      data: {
        report_id: r.id,
        actor_id: reviewerId,
        action: 'STATUS_CHANGE',
        from_status: prev as any,
        to_status: status as any,
        note: resolutionNote ?? undefined,
      },
    });

    if (status === 'ACCEPTED' && removeListing) {
      await tx.listings.update({
        where: { id: r.listing_id },
        data: { moderation_status: 'REMOVED_BY_MODERATION', is_active: false },
      });
      await tx.report_history.create({
        data: {
          report_id: r.id,
          actor_id: reviewerId,
          action: 'LISTING_REMOVED',
          note: 'Listing removed by moderation',
        },
      });
    }

    return r;
  });

  // Room-based Socket.IO notifications with persistent storage
  try {
    // Notify reporter about status change
    if (status === 'REJECTED') {
      // Reddetme durumunda gerekçeyi de ekle
      await NotificationService.createReportNotification(
        updated.reporter_id,
        'REPORT_RESOLVED_REJECTED',
        'Şikayetiniz Reddedildi',
        `"${updated.listing?.title || 'İlan'}" için şikayetiniz reddedildi.\n\nRed Gerekçesi: ${resolutionNote}`,
        {
          reportId: updated.id,
          reportTitle: updated.listing?.title || 'İlan',
          oldStatus: report.status,
          newStatus: status,
          resolutionNote,
        }
      );
    } else {
      await NotificationService.createReportNotification(
        updated.reporter_id,
        status === 'ACCEPTED' ? 'REPORT_RESOLVED_ACCEPTED' : 'GENERAL',
        'Şikayet Durumu Güncellendi',
        `"${updated.listing?.title || 'İlan'}" için şikayetinizin durumu ${status === 'ACCEPTED' ? 'kabul edildi' : 'güncellendi'}.`,
        {
          reportId: updated.id,
          reportTitle: updated.listing?.title || 'İlan',
          oldStatus: report.status,
          newStatus: status,
        }
      );
    }

    // Notify listing owner if listing is removed
    if (status === 'ACCEPTED' && removeListing && updated.owner_id !== updated.reporter_id) {
      await NotificationService.createReportNotification(
        updated.owner_id,
        'LISTING_REMOVED',
        'İlanınız Moderasyon Sonucu Kaldırıldı',
        `"${updated.listing?.title || 'İlan'}" adlı ilanınız şikayet sonucu kaldırılmıştır.`,
        {
          reportId: updated.id,
          reportTitle: updated.listing?.title || 'İlan',
        }
      );
    }

    // Notify all admins about the resolution
    emitToAdmins('admin:report:resolved', {
      reportId: updated.id,
      listingTitle: updated.listing?.title || 'İlan',
      status,
      reviewerName: `${updated.reviewer?.first_name ?? ''} ${updated.reviewer?.last_name ?? ''}`.trim(), // ✅
      resolvedAt: new Date(),
    });

  } catch (error) {
    console.error('Error sending notifications:', error);
  }

  return updated;
}
