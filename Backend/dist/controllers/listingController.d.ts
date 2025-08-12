import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getListings: (req: Request, res: Response) => Promise<void>;
export declare const getListingById: (req: Request, res: Response) => Promise<void>;
export declare const createListing: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateListing: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteListing: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserListings: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCategories: (req: Request, res: Response) => Promise<void>;
export declare const getVehicleTypes: (req: Request, res: Response) => Promise<void>;
export declare const getBrands: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=listingController.d.ts.map