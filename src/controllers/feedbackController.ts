import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import type { AuthenticatedRequest } from '../types/auth';
import { ulid } from 'ulid';
import { emitToAdmins, emitToUser } from '../utils/socket';

// Kullanıcı feedback gönderme
export const createFeedback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        console.log('createFeedback called with body:', req.body);
        const { type, subject, message, priority } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
            return;
        }

        if (!subject || !message) {
            res.status(400).json({ error: 'Konu ve mesaj alanları gereklidir' });
            return;
        }

        const feedback = await prisma.feedback.create({
            data: {
                id: ulid(),
                user_id: userId,
                type: type || 'GENERAL',
                subject,
                message,
                priority: priority || 'MEDIUM'
            },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true
                    }
                }
            }
        });

        // Admin'lere yeni feedback bildirimi gönder
        const admins = await prisma.users.findMany({
            where: { role: 'ADMIN' },
            select: { id: true }
        });

        // Her admin'e bildirim gönder
        for (const admin of admins) {
            await prisma.notifications.create({
                data: {
                    id: ulid(),
                    user_id: admin.id,
                    type: 'GENERAL',
                    title: 'Yeni Geri Bildirim',
                    message: `${feedback.user.first_name} ${feedback.user.last_name} tarafından "${feedback.subject}" konulu yeni geri bildirim gönderildi.`,
                    data: {
                        feedback_id: feedback.id,
                        feedback_type: feedback.type,
                        feedback_priority: feedback.priority,
                        user_name: `${feedback.user.first_name} ${feedback.user.last_name}`
                    }
                }
            });
        }

        // Socket ile admin'lere real-time bildirim gönder
        emitToAdmins('notification', {
            id: ulid(),
            type: 'GENERAL',
            title: 'Yeni Geri Bildirim',
            message: `${feedback.user.first_name} ${feedback.user.last_name} tarafından "${feedback.subject}" konulu yeni geri bildirim gönderildi.`,
            data: {
                feedback_id: feedback.id,
                feedback_type: feedback.type,
                feedback_priority: feedback.priority,
                user_name: `${feedback.user.first_name} ${feedback.user.last_name}`
            },
            created_at: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Geri bildiriminiz başarıyla gönderildi',
            data: feedback
        });
    } catch (error) {
        console.error('Feedback oluşturma hatası:', error);
        res.status(500).json({ error: 'İç sunucu hatası' });
    }
};

// Kullanıcının kendi feedback'lerini getirme
export const getUserFeedbacks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
            return;
        }

        const feedbacks = await prisma.feedback.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            include: {
                admin: {
                    select: {
                        first_name: true,
                        last_name: true
                    }
                }
            }
        });

        res.json({ 
            success: true, 
            data: feedbacks 
        });
    } catch (error) {
        console.error('Feedback listeleme hatası:', error);
        res.status(500).json({ error: 'İç sunucu hatası' });
    }
};

// Admin: Tüm feedback'leri getirme
export const getAllFeedbacks = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('getAllFeedbacks called with query:', req.query);
        const { page = 1, limit = 10, status, type, priority } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        // Filtreleme koşulları
        const where: any = {};
        if (status) where.status = status;
        if (type) where.type = type;
        if (priority) where.priority = priority;
        
        console.log('Filter conditions:', where);

        const [feedbacks, total] = await Promise.all([
            prisma.feedback.findMany({
                where,
                skip: offset,
                take: Number(limit),
                orderBy: [
                    { priority: 'desc' },
                    { created_at: 'desc' }
                ],
                include: {
                    user: {
                        select: {
                            first_name: true,
                            last_name: true,
                            email: true
                        }
                    },
                    admin: {
                        select: {
                            first_name: true,
                            last_name: true
                        }
                    }
                }
            }),
            prisma.feedback.count({ where })
        ]);

        console.log('Found feedbacks:', feedbacks.length, 'Total:', total);

        res.json({
            success: true,
            data: {
                feedbacks,
                pagination: {
                    current_page: Number(page),
                    total_pages: Math.ceil(total / Number(limit)),
                    total_items: total,
                    items_per_page: Number(limit)
                }
            }
        });
    } catch (error) {
        console.error('Feedback admin listeleme hatası:', error);
        res.status(500).json({ error: 'İç sunucu hatası' });
    }
};

// Admin: Feedback'e yanıt verme
export const respondToFeedback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { response, status } = req.body;
        const adminId = req.user?.id;

        if (!adminId) {
            res.status(401).json({ error: 'Admin yetkisi gerekli' });
            return;
        }

        if (!response) {
            res.status(400).json({ error: 'Yanıt metni gereklidir' });
            return;
        }

        // Feedback'i güncelle
        const feedback = await prisma.feedback.update({
            where: { id },
            data: {
                admin_response: response,
                admin_id: adminId,
                status: status || 'RESOLVED',
                responded_at: new Date()
            },
            include: {
                user: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true
                    }
                }
            }
        });

        // Kullanıcıya bildirim gönder
        await prisma.notifications.create({
            data: {
                id: ulid(),
                user_id: feedback.user_id,
                type: 'FEEDBACK_RESPONSE',
                title: 'Geri Bildiriminize Yanıt',
                message: `"${feedback.subject}" konulu geri bildiriminize yanıt verildi.`,
                data: {
                    feedback_id: feedback.id,
                    feedback_subject: feedback.subject,
                    admin_response: response
                }
            }
        });

        // Socket ile kullanıcıya real-time bildirim gönder
        emitToUser(feedback.user_id, 'notification', {
            id: ulid(),
            type: 'FEEDBACK_RESPONSE',
            title: 'Geri Bildiriminize Yanıt',
            message: `"${feedback.subject}" konulu geri bildiriminize yanıt verildi.`,
            data: {
                feedback_id: feedback.id,
                feedback_subject: feedback.subject,
                admin_response: response
            },
            created_at: new Date()
        });

        res.json({
            success: true,
            message: 'Yanıt başarıyla gönderildi',
            data: feedback
        });
    } catch (error) {
        console.error('Feedback yanıtlama hatası:', error);
        res.status(500).json({ error: 'İç sunucu hatası' });
    }
};

// Admin: Feedback detayı
export const getFeedbackDetail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const feedback = await prisma.feedback.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true,
                        phone: true
                    }
                },
                admin: {
                    select: {
                        first_name: true,
                        last_name: true
                    }
                }
            }
        });

        if (!feedback) {
            res.status(404).json({ error: 'Geri bildirim bulunamadı' });
            return;
        }

        res.json({ 
            success: true, 
            data: feedback 
        });
    } catch (error) {
        console.error('Feedback detay hatası:', error);
        res.status(500).json({ error: 'İç sunucu hatası' });
    }
};

// Admin: Feedback durumu güncelleme
export const updateFeedbackStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const feedback = await prisma.feedback.update({
            where: { id },
            data: { status }
        });

        res.json({
            success: true,
            message: 'Durum başarıyla güncellendi',
            data: feedback
        });
    } catch (error) {
        console.error('Feedback durum güncelleme hatası:', error);
        res.status(500).json({ error: 'İç sunucu hatası' });
    }
};

// Admin: Dashboard istatistikleri
export const getFeedbackStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const [
            totalFeedbacks,
            openFeedbacks,
            resolvedFeedbacks,
            urgentFeedbacks,
            todayFeedbacks
        ] = await Promise.all([
            prisma.feedback.count(),
            prisma.feedback.count({ where: { status: 'OPEN' } }),
            prisma.feedback.count({ where: { status: 'RESOLVED' } }),
            prisma.feedback.count({ where: { priority: 'URGENT' } }),
            prisma.feedback.count({
                where: {
                    created_at: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            })
        ]);

        const typeStats = await prisma.feedback.groupBy({
            by: ['type'],
            _count: { _all: true }
        });

        const priorityStats = await prisma.feedback.groupBy({
            by: ['priority'],
            _count: { _all: true }
        });

        res.json({
            success: true,
            data: {
                total: totalFeedbacks,
                open: openFeedbacks,
                resolved: resolvedFeedbacks,
                urgent: urgentFeedbacks,
                today: todayFeedbacks,
                byType: typeStats,
                byPriority: priorityStats
            }
        });
    } catch (error) {
        console.error('Feedback istatistik hatası:', error);
        res.status(500).json({ error: 'İç sunucu hatası' });
    }
};
