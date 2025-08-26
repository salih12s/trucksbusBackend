import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export async function requireConversationParticipant(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    const conversationId = req.params.id || req.body.conversationId;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        error: 'Unauthorized - authentication required' 
      });
      return;
    }
    
    if (!conversationId) {
      res.status(400).json({ 
        success: false, 
        error: 'Bad Request - conversation ID required' 
      });
      return;
    }
    
    // Check if conversation exists
    // @ts-ignore - Prisma model type issue
    const conversation = await prisma.conversations.findUnique({
      where: { id: conversationId }
    });
    
    if (!conversation) {
      res.status(404).json({ 
        success: false, 
        error: 'Conversation not found' 
      });
      return;
    }
    
    // Check if user is a participant
    // @ts-ignore - Prisma field names issue
    const isParticipant = [conversation.least_user_id, conversation.greatest_user_id].includes(userId);
    
    if (!isParticipant) {
      res.status(403).json({ 
        success: false, 
        error: 'Forbidden - not a participant in this conversation' 
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error in requireConversationParticipant middleware:', error);
    next(error);
  }
}

export default requireConversationParticipant;
