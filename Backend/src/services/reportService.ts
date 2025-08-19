import { PrismaClient } from '@prisma/client';
import { ReportStatus, ReportReason, NotificationType, ModerationStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Socket yayın helper'larını import et (mevcut projen için uyarlayacaksın)
// import { emitToAdmins, emitToUser } from '../realtime/sockets';

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
    select: { id: true, moderation_status: true, user_id: true, title: true } 
  });

  if (!listing) throw new Error("Listing not found");
  if (listing.moderation_status === ModerationStatus.REMOVED_BY_MODERATION) {
    throw new Error("Listing already moderated");
  }

  if (listing.user_id === reporterId) throw new Error("You cannot report your own listing");

  // 24 saat içinde aynı ilan için tekrar raporlama engeli
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await prisma.reports.findFirst({
    where: { listing_id: listingId, reporter_id: reporterId, created_at: { gte: since } },
  });
  if (recent) throw new Error("You already reported this listing in the last 24h");

  // Kayıt + history (transaction)
  const created = await prisma.$transaction(async (tx) => {
    const report = await tx.reports.create({
      data: {
        listing_id: listingId,
        reporter_id: reporterId,
        owner_id: listing.user_id,
        reason,
        description,
        status: ReportStatus.OPEN,
      },
      include: {
        reporter: { select: { id: true, first_name: true, last_name: true } },
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

  // Socket yayını ekleyeceksin (mevcut socket service'ini kullan)
  // emitToAdmins("admin:report:new", {
  //   reportId: created.id,
  //   listingId,
  //   reason,
  //   reporter: { id: created.reporter.id, name: `${created.reporter.first_name} ${created.reporter.last_name}` },
  //   createdAt: created.created_at,
  // });

  return created;
}

export async function listMyReports(userId: string, q: { status?: ReportStatus; page?: number; limit?: number }) {
  const page = q.page && q.page > 0 ? q.page : 1;
  const limit = q.limit && q.limit > 0 ? q.limit : 10;
  const where: any = { reporter_id: userId };
  if (q.status) where.status = q.status;

  const [items, total] = await Promise.all([
    prisma.reports.findMany({
      where,
      include: {
        listing: { select: { id: true, title: true, moderation_status: true } },
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
  status?: ReportStatus;
  reason?: ReportReason;
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
  if (params.q) {
    where.OR = [
      { description: { contains: params.q, mode: 'insensitive' } },
      { reporter: { 
        OR: [
          { first_name: { contains: params.q, mode: 'insensitive' } },
          { last_name: { contains: params.q, mode: 'insensitive' } },
        ] 
      } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.reports.findMany({
      where,
      include: {
        listing: { select: { id: true, title: true } },
        reporter: { select: { id: true, first_name: true, last_name: true } },
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
      listing: { select: { id: true, title: true, moderation_status: true, price: true } },
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
  status: ReportStatus;
  resolutionNote?: string;
  removeListing?: boolean;
}) {
  const report = await prisma.reports.findUnique({ where: { id } });
  if (!report) throw new Error('Report not found');

  if (status === ReportStatus.REJECTED && !resolutionNote) {
    throw new Error('Resolution note is required when rejecting');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const prev = report.status;

    const r = await tx.reports.update({
      where: { id },
      data: {
        status,
        resolution_note: resolutionNote ?? null,
        reviewer_id: reviewerId,
      },
      include: {
        reporter: { select: { id: true } },
        owner: { select: { id: true } },
        listing: { select: { id: true, title: true, moderation_status: true } },
      },
    });

    await tx.report_history.create({
      data: {
        report_id: r.id,
        actor_id: reviewerId,
        action: 'STATUS_CHANGE',
        from_status: prev,
        to_status: status,
        note: resolutionNote ?? undefined,
      },
    });

    if (status === ReportStatus.ACCEPTED && removeListing) {
      await tx.listings.update({
        where: { id: r.listing_id },
        data: { moderation_status: ModerationStatus.REMOVED_BY_MODERATION },
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

  // Bildirimler + Socket (mevcut notification service'ini kullan)
  if (status === 'ACCEPTED') {
    // emitToUser(updated.reporter.id, "user:report:resolved", {
    //   reportId: updated.id,
    //   status: updated.status,
    //   resolutionNote,
    //   listingId: updated.listing_id,
    // });
    
    await prisma.notifications.create({
      data: {
        user_id: updated.reporter.id,
        type: NotificationType.REPORT_RESOLVED_ACCEPTED,
        data: { reportId: updated.id, listingId: updated.listing_id, note: resolutionNote ?? null },
      },
    });
    
    if (removeListing) {
      // emitToUser(updated.owner.id, "owner:listing:moderated", {
      //   listingId: updated.listing_id,
      //   action: "REMOVED_BY_MODERATION",
      //   reportId: updated.id,
      //   resolutionNote,
      // });
      
      await prisma.notifications.create({
        data: {
          user_id: updated.owner.id,
          type: NotificationType.LISTING_REMOVED,
          data: { listingId: updated.listing_id, reportId: updated.id, note: resolutionNote ?? null },
        },
      });
    }
  } else if (status === 'REJECTED') {
    // emitToUser(updated.reporter.id, "user:report:resolved", {
    //   reportId: updated.id,
    //   status: updated.status,
    //   resolutionNote,
    //   listingId: updated.listing_id,
    // });
    
    await prisma.notifications.create({
      data: {
        user_id: updated.reporter.id,
        type: NotificationType.REPORT_RESOLVED_REJECTED,
        data: { reportId: updated.id, listingId: updated.listing_id, note: resolutionNote ?? null },
      },
    });
  }

  return updated;
}
