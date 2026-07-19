// src/contexts/FavoritesContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { 
  fetchFavorites, 
  addToFavorites, 
  removeFromFavorites, 
  clearAllFavorites,
  FavoriteProduct,
} from '@/services/favorites';
import toast from 'react-hot-toast';

interface FavoritesContextType {
  favorites: FavoriteProduct[];
  isLoading: boolean;
  isMutating: boolean;
  total: number;
  addFavorite: (productId: string | number) => Promise<boolean>;
  removeFavorite: (productId: string | number) => Promise<boolean>;
  toggleFavorite: (productId: string | number, currentState?: boolean) => Promise<boolean>;
  clearAllFavorites: () => Promise<boolean>;
  refetch: () => Promise<void>;
  isFavorite: (productId: string | number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [total, setTotal] = useState(0);
  
  const favoritesMapRef = useRef<Map<string, boolean>>(new Map());
  const isMountedRef = useRef(true);
  const initialFetchDone = useRef(false);
  const isFetchingRef = useRef(false); // ✅ منع التكرار
  const lastFetchTimeRef = useRef(0); // ✅ تتبع وقت آخر جلب

  // ✅ دالة جلب البيانات المحسنة مع منع التكرار
  const fetchData = useCallback(async (showLoading: boolean = true) => {
    // ✅ منع الجلب المتكرر خلال فترة قصيرة
    const now = Date.now();
    if (isFetchingRef.current) {
      console.log('⏳ Fetch already in progress, skipping...');
      return;
    }
    
    // ✅ منع الجلب المتكرر خلال 2 ثانية
    if (now - lastFetchTimeRef.current < 2000) {
      console.log('⏳ Too soon to fetch again, skipping...');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('🔴 No auth token found, skipping favorites fetch');
      if (isMountedRef.current) {
        setFavorites([]);
        setTotal(0);
        setIsLoading(false);
      }
      return;
    }

    isFetchingRef.current = true;
    lastFetchTimeRef.current = now;

    if (showLoading) {
      setIsLoading(true);
    }
    
    try {
      console.log('🔄 Fetching favorites...');
      const response = await fetchFavorites(1, 100);
      console.log('📦 Favorites response:', response);
      
      if (response.result === true && response.data && Array.isArray(response.data.favorites)) {
        const validFavorites = response.data.favorites.filter((item: FavoriteProduct) => item && item.id);
        
        if (isMountedRef.current) {
          console.log(`✅ Loaded ${validFavorites.length} favorites`);
          setFavorites([...validFavorites]);
          setTotal(validFavorites.length);
          
          const newMap = new Map<string, boolean>();
          validFavorites.forEach((item: FavoriteProduct) => {
            if (item && item.id) {
              newMap.set(item.id.toString(), true);
            }
          });
          favoritesMapRef.current = newMap;
          
          // ✅ إطلاق حدث لتحديث العدد في الناف بار
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('favoritesCountUpdated'));
          }
        }
      } else {
        if (isMountedRef.current) {
          setFavorites([]);
          setTotal(0);
          favoritesMapRef.current = new Map();
          
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('favoritesCountUpdated'));
          }
        }
      }
    } catch (error) {
      console.error('❌ Error fetching favorites:', error);
      if (isMountedRef.current) {
        setFavorites([]);
        setTotal(0);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, []);

  // ✅ جلب البيانات عند تحميل المكون (مرة واحدة فقط)
  useEffect(() => {
    isMountedRef.current = true;
    
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      // ✅ تأخير صغير لتجنب التزاحم مع أحداث أخرى
      setTimeout(() => {
        fetchData(true);
      }, 100);
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData]);

  // ✅ الاستماع لأحداث تسجيل الدخول مع منع التكرار
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        console.log('🔄 Auth changed, fetching favorites...');
        // ✅ تأخير صغير لتجنب التكرار
        setTimeout(() => {
          fetchData(true);
        }, 200);
      } else {
        setFavorites([]);
        setTotal(0);
        favoritesMapRef.current = new Map();
      }
    };

    const handleUserLoggedIn = () => {
      console.log('🔄 User logged in event received, fetching favorites...');
      // ✅ تأخير صغير لتجنب التكرار
      setTimeout(() => {
        fetchData(true);
      }, 200);
    };

    // ✅ استخدام debounce لتجميع الأحداث
    let timeoutId: NodeJS.Timeout;
    const handleDebouncedFetch = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchData(true);
      }, 300);
    };

    window.addEventListener('authChanged', handleDebouncedFetch);
    window.addEventListener('userLoggedIn', handleDebouncedFetch);
    window.addEventListener('favoritesUpdated', handleDebouncedFetch);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('authChanged', handleDebouncedFetch);
      window.removeEventListener('userLoggedIn', handleDebouncedFetch);
      window.removeEventListener('favoritesUpdated', handleDebouncedFetch);
    };
  }, [fetchData]);

  // ✅ إعادة الجلب عند تغيير التوكن (مع منع التكرار)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // ✅ تأخير لتجنب التكرار
        setTimeout(() => {
          fetchData(true);
        }, 200);
      } else {
        setFavorites([]);
        setTotal(0);
        favoritesMapRef.current = new Map();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchData]);

  const addFavorite = async (productId: string | number): Promise<boolean> => {
    setIsMutating(true);
    const productIdStr = productId.toString();
    
    try {
      const response = await addToFavorites(productId);
      
      if (response.result === true && response.data) {
        toast.success('تم إضافة المنتج إلى المفضلة');
        await fetchData(false);
        return true;
      } else {
        if (response.message === "هذا المنتج موجود بالفعل في مفضلتك.") {
          toast.success('المنتج موجود بالفعل في المفضلة');
          favoritesMapRef.current.set(productIdStr, true);
          return true;
        }
        toast.error(response.message || 'فشل في إضافة المنتج');
        return false;
      }
    } catch (error) {
      toast.error('حدث خطأ في إضافة المنتج');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const removeFavorite = async (productId: string | number): Promise<boolean> => {
    setIsMutating(true);
    const productIdStr = productId.toString();
    
    try {
      const response = await removeFromFavorites(productId);
      
      if (response.result === true) {
        toast.success('تم إزالة المنتج من المفضلة');
        await fetchData(false);
        return true;
      } else {
        toast.error(response.message || 'فشل في إزالة المنتج');
        return false;
      }
    } catch (error) {
      toast.error('حدث خطأ في إزالة المنتج');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const toggleFavorite = async (productId: string | number, currentState?: boolean): Promise<boolean> => {
    const productIdStr = productId.toString();
    const isCurrentlyFavorite = currentState !== undefined ? currentState : (favoritesMapRef.current.get(productIdStr) || false);
    
    if (isCurrentlyFavorite) {
      return await removeFavorite(productId);
    } else {
      return await addFavorite(productId);
    }
  };

  const clearAll = async (): Promise<boolean> => {
    setIsMutating(true);
    try {
      const success = await clearAllFavorites();
      if (success) {
        toast.success('تم حذف جميع المنتجات من المفضلة');
        await fetchData(false);
        return true;
      } else {
        toast.error('فشل في حذف جميع المنتجات');
        return false;
      }
    } catch (error) {
      toast.error('حدث خطأ في حذف المنتجات');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const isFavorite = (productId: string | number): boolean => {
    if (!productId) return false;
    return favoritesMapRef.current.get(productId.toString()) || false;
  };

  const value = {
    favorites,
    isLoading,
    isMutating,
    total,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearAllFavorites: clearAll,
    refetch: () => fetchData(true),
    isFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return context;
}