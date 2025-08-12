// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  name: string; // Added for compatibility
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  role: 'user' | 'admin'; // Added for compatibility
  createdAt: Date;
  updatedAt: Date;
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

// Message Types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  listingId?: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
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
  NEW_MESSAGE = 'NEW_MESSAGE',
  LISTING_INTEREST = 'LISTING_INTEREST'
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
}

export interface RegisterRequest {
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
