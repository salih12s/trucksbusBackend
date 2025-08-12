import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getAdminListings: (req: Request, res: Response) => Promise<void>;
export declare const approveListing: (req: AuthRequest, res: Response) => Promise<void>;
export declare const rejectListing: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getDashboardStats: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=adminController.d.ts.map