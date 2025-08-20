import { Request, Response } from 'express';
export declare const createListing: (req: Request, res: Response) => Promise<void>;
export declare const getListings: (req: Request, res: Response) => Promise<void>;
export declare const debugListingData: (req: Request, res: Response) => Promise<void>;
export declare const getListingById: (req: Request, res: Response) => Promise<void>;
export declare const updateListing: (req: Request, res: Response) => Promise<void>;
export declare const deleteListing: (req: Request, res: Response) => Promise<void>;
export declare const debugListingImages: (req: Request, res: Response) => Promise<void>;
export declare const getUserListings: (req: Request, res: Response) => Promise<void>;
export declare const toggleFavorite: (req: Request, res: Response) => Promise<void>;
export declare const getFavorites: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=listingController.d.ts.map