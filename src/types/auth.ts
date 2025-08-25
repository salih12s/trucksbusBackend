import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  body: any;
  params: any;
  query: any;
  headers: any;
  ip: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  body: any;
  params: any;
  query: any;
  headers: any;
  ip: string;
}
