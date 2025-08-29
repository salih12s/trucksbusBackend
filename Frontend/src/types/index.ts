// User Types
export interface User {
  id: string;
  email: string;
  username?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  city?: string;
  district?: string;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
  is_email_verified: boolean;
  avatar?: string; // Added for profile picture
  created_at: Date;
  updated_at: Date;
}

// Listing Types
export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  category: Category;
  userId: string;
  user: User;
  images: string[];
  location: string;
  status: ListingStatus;
  isApproved: boolean;
  views?: number; // Added for compatibility
  isFavorite?: boolean; // Added for compatibility
  features?: string[]; // Added for compatibility
  createdAt: Date;
  updatedAt: Date;
  // Vehicle specific fields
  year?: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  brand?: string;
  model?: string;
  variant?: string;
}

export enum ListingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SOLD = 'SOLD'
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  children?: Category[];
  createdAt: Date;
}

// 🔧 Message Types - messageService ile aynı şema (content field, backend compatible)
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  users: {
    id: string;
    first_name: string;
    last_name: string;
    username?: string;
  };
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  listing_id?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  listing?: {
    id: string;
    title: string;
    price?: number;
    images?: string[];
  };
  otherParticipant: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
  };
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
    sender_name: string;
  };
  unreadCount: number;
}




// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: any;
  createdAt: Date;
}

export enum NotificationType {
  LISTING_APPROVED = 'LISTING_APPROVED',
  LISTING_REJECTED = 'LISTING_REJECTED',
  LISTING_EXPIRED = 'LISTING_EXPIRED',
  NEW_MESSAGE = 'NEW_MESSAGE',
  LISTING_INTEREST = 'LISTING_INTEREST',
  FEEDBACK_RESPONSE = 'FEEDBACK_RESPONSE',
  LISTING_PUBLISHED = 'LISTING_PUBLISHED',
  GENERAL = 'GENERAL'
}

// Report Types
export interface Report {
  id: string;
  reporterId: string;
  reporter: User;
  listingId: string;
  listing: Listing;
  reason: string;
  description?: string;
  status: ReportStatus;
  createdAt: Date;
}

export enum ReportStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  kvkkAccepted: boolean;
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Listing Form Types
export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  location: string;
  images?: File[];
  features?: string[];
}

export interface UpdateListingData {
  title?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  location?: string;
  features?: string[];
  status?: ListingStatus;
}
