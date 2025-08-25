import { Request, Response, NextFunction } from 'express';

// User interface
export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  phone?: string;
  isEmailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Authenticated request interface
export interface AuthenticatedRequest extends Request {
  user?: User;
  body: any;
  params: any;
  query: any;
  headers: any;
  ip: string;
  file?: any;
  files?: any[];
  io?: any;
  app: any;
}

// Auth request interface
export interface AuthRequest extends Request {
  user?: User;
  body: any;
  params: any;
  query: any;
  headers: any;
  ip: string;
  file?: any;
  files?: any[];
  io?: any;
  app: any;
}

// Middleware types
export type AuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => void;

export type AuthenticatedMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => void;

// Auth data interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}
