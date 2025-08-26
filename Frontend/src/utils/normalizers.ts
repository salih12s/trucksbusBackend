// utils/normalizers.ts
export const S = (v: unknown) => (v == null ? '' : String(v));

export const normalizeMessage = (raw: any) => ({
  id: S(raw.id),
  conversation_id: S(raw.conversation_id ?? raw.conversationId),
  sender_id: S(raw.sender_id ?? raw.senderId),
  content: raw.content ?? raw.body ?? '',
  is_read: Boolean(raw.is_read ?? raw.isRead ?? false),
  is_edited: Boolean(raw.is_edited ?? raw.isEdited ?? false),
  created_at: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
  updated_at:
    raw.updated_at ?? raw.updatedAt ?? raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
  users: raw.users ?? raw.user ?? {
    id: S(raw.user_id ?? raw.userId ?? ''),
    first_name: raw.first_name ?? raw.firstName ?? '',
    last_name: raw.last_name ?? raw.lastName ?? '',
    username: raw.username ?? undefined,
  },
});

export const normalizeConversation = (conv: any) => ({
  ...conv,
  id: S(conv.id),
  participant1_id: S(conv.participant1_id),
  participant2_id: S(conv.participant2_id),
  listing_id: conv.listing_id != null ? S(conv.listing_id) : undefined,
  lastMessage: conv.lastMessage
    ? {
        ...conv.lastMessage,
        content: conv.lastMessage.content ?? conv.lastMessage.body ?? '',
        sender_id: S(conv.lastMessage.sender_id ?? conv.lastMessage.senderId ?? ''),
      }
    : undefined,
  unreadCount: Number(conv.unreadCount ?? conv.unread_count ?? 0),
});
