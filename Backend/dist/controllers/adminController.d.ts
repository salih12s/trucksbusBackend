import { Request, Response } from 'express';
export declare const getUsers: (req: Request, res: Response) => Promise<void>;
export declare const getUser: (req: Request, res: Response) => Promise<void>;
export declare const updateUser: (req: Request, res: Response) => Promise<void>;
export declare const deleteUser: (req: Request, res: Response) => Promise<void>;
export declare const getListings: (req: Request, res: Response) => Promise<void>;
export declare const approveListing: (req: Request, res: Response) => Promise<void>;
export declare const rejectListing: (req: Request, res: Response) => Promise<void>;
export declare const getDashboardStats: (req: Request, res: Response) => Promise<void>;
export declare const getPendingListings: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=adminController.d.ts.map