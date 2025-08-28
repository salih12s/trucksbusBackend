import { Request, Response, NextFunction } from 'express';

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
  app: any; // Express app instance
}

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
  app: any; // Express app instance
}

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

// Default export to make this a proper module
export default {};

export interface AuthProvider {
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
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

// Default export for module compatibility
export default {
  User,
  AuthenticatedRequest,
  AuthMiddleware,
  JWTPayload,
  AuthResponse,
  LoginCredentials,
  RegisterData
};
