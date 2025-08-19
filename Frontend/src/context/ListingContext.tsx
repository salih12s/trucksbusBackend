import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Simplified listing interface
export interface SimpleListing {
  id: string;
  title: string;
  price: number;
  category: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  location: string;
  image: string;
  images?: string[]; // Birden fazla resim için
  user_id?: string; // İlan sahibinin ID'si
  seller: {
    name: string;
    phone: string;
  };
  owner: {
    name: string;
    phone: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isFavorite?: boolean;
  createdAt: string;
}

interface ListingState {
  listings: SimpleListing[];
  pendingListings: SimpleListing[];
  approvedListings: SimpleListing[];
  rejectedListings: SimpleListing[];
  loading: boolean;
  error: string | null;
}

type ListingAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LISTINGS'; payload: SimpleListing[] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_LISTING'; payload: SimpleListing }
  | { type: 'UPDATE_LISTING_STATUS'; payload: { id: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' } }
  | { type: 'DELETE_LISTING'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: string };

const initialState: ListingState = {
  listings: [],
  pendingListings: [],
  approvedListings: [],
  rejectedListings: [],
  loading: false,
  error: null,
};

const listingReducer = (state: ListingState, action: ListingAction): ListingState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_LISTINGS':
      return {
        ...state,
        listings: action.payload,
        pendingListings: action.payload.filter(l => l.status === 'PENDING'),
        approvedListings: action.payload.filter(l => l.status === 'APPROVED'),
        rejectedListings: action.payload.filter(l => l.status === 'REJECTED'),
        loading: false,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case 'ADD_LISTING':
      const newListings = [...state.listings, action.payload];
      return {
        ...state,
        listings: newListings,
        pendingListings: newListings.filter(l => l.status === 'PENDING'),
        approvedListings: newListings.filter(l => l.status === 'APPROVED'),
        rejectedListings: newListings.filter(l => l.status === 'REJECTED'),
      };

    case 'UPDATE_LISTING_STATUS': {
      const updatedListings = state.listings.map(listing =>
        listing.id === action.payload.id
          ? { ...listing, status: action.payload.status }
          : listing
      );

      return {
        ...state,
        listings: updatedListings,
        pendingListings: updatedListings.filter(l => l.status === 'PENDING'),
        approvedListings: updatedListings.filter(l => l.status === 'APPROVED'),
        rejectedListings: updatedListings.filter(l => l.status === 'REJECTED'),
      };
    }

    case 'DELETE_LISTING': {
      const filteredListings = state.listings.filter(listing => listing.id !== action.payload);
      return {
        ...state,
        listings: filteredListings,
        pendingListings: filteredListings.filter(l => l.status === 'PENDING'),
        approvedListings: filteredListings.filter(l => l.status === 'APPROVED'),
        rejectedListings: filteredListings.filter(l => l.status === 'REJECTED'),
      };
    }

    case 'TOGGLE_FAVORITE': {
      const updatedListings = state.listings.map(listing =>
        listing.id === action.payload
          ? { ...listing, isFavorite: !listing.isFavorite }
          : listing
      );

      return {
        ...state,
        listings: updatedListings,
        pendingListings: updatedListings.filter(l => l.status === 'PENDING'),
        approvedListings: updatedListings.filter(l => l.status === 'APPROVED'),
        rejectedListings: updatedListings.filter(l => l.status === 'REJECTED'),
      };
    }

    default:
      return state;
  }
};

interface ListingContextType {
  state: ListingState;
  setLoading: (loading: boolean) => void;
  setListings: (listings: SimpleListing[]) => void;
  setError: (error: string | null) => void;
  addListing: (listing: SimpleListing) => void;
  updateListingStatus: (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') => void;
  deleteListing: (id: string) => void;
  toggleFavorite: (id: string) => void;
  approveListing: (id: string) => void;
  rejectListing: (id: string) => void;
}

const ListingContext = createContext<ListingContextType | undefined>(undefined);

export const useListingContext = () => {
  const context = useContext(ListingContext);
  if (!context) {
    throw new Error('useListingContext must be used within a ListingProvider');
  }
  return context;
};

interface ListingProviderProps {
  children: ReactNode;
}

export const ListingProvider: React.FC<ListingProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(listingReducer, initialState);

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setListings = (listings: SimpleListing[]) => {
    dispatch({ type: 'SET_LISTINGS', payload: listings });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const addListing = (listing: SimpleListing) => {
    dispatch({ type: 'ADD_LISTING', payload: listing });
  };

  const updateListingStatus = (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    dispatch({ type: 'UPDATE_LISTING_STATUS', payload: { id, status } });
  };

  const deleteListing = (id: string) => {
    dispatch({ type: 'DELETE_LISTING', payload: id });
  };

  const toggleFavorite = (id: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: id });
  };

  const approveListing = (id: string) => {
    updateListingStatus(id, 'APPROVED');
  };

  const rejectListing = (id: string) => {
    updateListingStatus(id, 'REJECTED');
  };

  const value: ListingContextType = {
    state,
    setLoading,
    setListings,
    setError,
    addListing,
    updateListingStatus,
    deleteListing,
    toggleFavorite,
    approveListing,
    rejectListing,
  };

  return (
    <ListingContext.Provider value={value}>
      {children}
    </ListingContext.Provider>
  );
};
