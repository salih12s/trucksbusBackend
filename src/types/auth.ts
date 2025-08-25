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
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
  io?: any; // Socket.IO instance
}

export interface AuthRequest extends Request {
  user?: User;
  body: any;
  params: any;
  query: any;
  headers: any;
  ip: string;
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
  io?: any; // Socket.IO instance
}

export interface AuthResponse extends Response {}

export interface AuthNextFunction extends NextFunction {}
