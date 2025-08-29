import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useAuthGate } from '../hooks/useAuthGate';
import { useNotification } from './NotificationContext';
import { api } from '../services/api';

interface Favorite {
  id: string;
  listing_id: string;
  user_id: string;
  created_at: string;
  // Opsiyonel: backend listing join döndürüyorsa
  listing?: {
    id: string;
    title: string;
    price: number;
    km?: number;
    year?: number;
    images?: string[];
    city_name?: string;
    district_name?: string;
    created_at?: string;
    seller_phone?: string;
  };
}

interface FavoritesContextType {
  favorites: Favorite[];
  favoritesCount: number;
  loading: boolean;
  addToFavorites: (listingId: string) => Promise<void>;
  removeFromFavorites: (listingId: string) => Promise<void>;
  isFavorite: (listingId: string) => boolean;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (listingId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, token } = useAuth();
  const authReady = useAuthGate();
  const { showSuccessNotification, showErrorNotification } = useNotification();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const isFavorite = (listingId: string) => favoriteIds.has(listingId);
  const favoritesCount = useMemo(() => favoriteIds.size, [favoriteIds]);

  const syncSets = (list: Favorite[]) => {
    setFavorites(list);
    setFavoriteIds(new Set(list.map(f => f.listing_id)));
  };

  const fetchFavorites = async () => {
    // 🔴 Auth hazır değilse hiçbir şey yapma
    if (!authReady || !token) {
      syncSets([]);
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.get(`/favorites`);
      const list: Favorite[] = res.data?.favorites ?? [];
      syncSets(list);
    } catch (error) {
      console.error('Favoriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (listingId: string) => {
    if (!authReady || !token) {
      showErrorNotification('Favorilere eklemek için giriş yapmalısınız');
      return;
    }
    if (isFavorite(listingId)) return; // dedup
    if (!user) return; // user null check

    // optimistic
    const optimistic: Favorite = {
      id: `optimistic_${listingId}`,
      listing_id: listingId,
      user_id: user.id,
      created_at: new Date().toISOString(),
    };

    // optimistic add (functional)
    setFavorites(prev => {
      const next = [...prev, optimistic];
      setFavoriteIds(new Set(next.map(f => f.listing_id)));
      return next;
    });

    try {
      const res = await api.post('/favorites', { listing_id: listingId });
      if (res.data?.success && (res.data?.favorite?.id || res.data?.favorite?.listing_id)) {
        const real: Favorite = {
          id: res.data.favorite.id ?? `server_${listingId}`,
          listing_id: res.data.favorite.listing_id ?? listingId,
          user_id: user.id,
          created_at: res.data.favorite.created_at ?? new Date().toISOString(),
          listing: res.data.favorite.listing, // varsa
        };

        // optimistic'i gerçek ile değiştir (functional)
        setFavorites(prev => {
          const next = prev.map(f => (f.id === optimistic.id ? real : f));
          setFavoriteIds(new Set(next.map(ff => ff.listing_id)));
          return next;
        });

        showSuccessNotification('Favorilere eklendi!');
      } else {
        throw new Error('Favori ekleme başarısız');
      }
    } catch (e: any) {
      // rollback (functional)
      setFavorites(prev => {
        const next = prev.filter(f => f.id !== optimistic.id);
        setFavoriteIds(new Set(next.map(ff => ff.listing_id)));
        return next;
      });
      console.error('Favorilere eklenirken hata:', e);
      showErrorNotification(e?.response?.data?.message || 'Favorilere eklenirken hata oluştu');
    }
  };

  const removeFromFavorites = async (listingId: string) => {
    if (!isAuthenticated || !user) return;
    if (!isFavorite(listingId)) return;

    // optimistic remove (functional)
    setFavorites(prev => {
      const next = prev.filter(f => f.listing_id !== listingId);
      setFavoriteIds(new Set(next.map(ff => ff.listing_id)));
      return next;
    });

    try {
      const res = await api.delete(`/favorites/${listingId}`);
      if (!res.data?.success) throw new Error('Favoriden çıkarma başarısız');
      showSuccessNotification('Favorilerden çıkarıldı');
    } catch (e: any) {
      // rollback - sunucuyla kesin senkron
      await fetchFavorites();
      console.error('Favorilerden çıkarılırken hata:', e);
      showErrorNotification(e?.response?.data?.message || 'Favorilerden çıkarılırken hata oluştu');
    }
  };

  // ✨ Tek tuşta toggle
  const toggleFavorite = async (listingId: string) => {
    if (isFavorite(listingId)) {
      await removeFromFavorites(listingId);
    } else {
      await addToFavorites(listingId);
    }
  };

  useEffect(() => {
    if (authReady && token) {
      fetchFavorites();
    } else {
      syncSets([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, token]);

  const value: FavoritesContextType = {
    favorites,
    favoritesCount,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    fetchFavorites,
    toggleFavorite,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = (): FavoritesContextType => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider');
  return ctx;
};
