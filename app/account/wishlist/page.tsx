// app/account/wishlist/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo, useReducer } from "react";
import Link from "next/link";
import { Heart, Trash2, ArrowRight, X, ChevronRight } from "lucide-react";
import Pagination from "@/components/products/Pagination";
import { ProductCard } from "@/components/products/ProductCard";
import { useFavorites, transformFavoriteToProductCard } from "@/hooks/useFavorites";
import toast, { Toaster } from "react-hot-toast";

// ========== مكون عنوان الصفحة ==========
const PageHeader = ({ title }: { title: string }) => (
  <div className="page-with-padding">
    <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
      <Link href="/" className="hover:text-[#EC221F] transition">الرئيسية</Link>
      <ChevronRight className="w-4 h-4" />
      <Link href="/account" className="hover:text-[#EC221F] transition">حسابي</Link>
      <ChevronRight className="w-4 h-4" />
      <span className="text-[#EC221F]">{title}</span>
    </div>
  </div>
);

// ========== مكون المفضلة فارغة ==========
const WishlistEmpty = () => (
  <div className="container h-[80vh]">
    <PageHeader title="قائمة المفضلة" />
    
    <div className="text-center rounded-2xl mt-5">
      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
        <Heart className="w-12 h-12 text-gray-400" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        قائمة المفضلة فارغة
      </h2>
      <p className="text-gray-500 mb-6">
        لم تقم بإضافة أي منتجات إلى قائمة المفضلة بعد
      </p>
      <Link
        href="/products"
        className="inline-block bg-[#EC221F] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#d41d1a] transition-all duration-300 shadow-md hover:shadow-lg"
      >
        استكشاف المنتجات
      </Link>
    </div>
  </div>
);

// ========== تعريف الأنواع ==========
interface TransformedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  hoverImage: string;
  href: string;
  originalPrice?: number;
  discount?: number;
  colors?: Array<{ color: string; name: string }>;
  rating?: number;
  reviewsCount?: number;
  isBestSeller?: boolean;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  next_page: number | null;
  previous_page: number | null;
}

// ========== State Management using useReducer ==========
interface WishlistState {
  items: TransformedProduct[];
  pagination: PaginationData;
  currentPage: number;
}

type WishlistAction = 
  | { type: 'SET_ITEMS'; payload: { items: TransformedProduct[]; total: number; currentPage: number } }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'CLEAR_ITEMS' };

const initialState: WishlistState = {
  items: [],
  currentPage: 1,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 8,
    total: 0,
    from: 0,
    to: 0,
    next_page: null,
    previous_page: null
  }
};

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  const itemsPerPage = 8;
  
  switch (action.type) {
    case 'SET_ITEMS': {
      const { items, total, currentPage } = action.payload;
      const last_page = Math.ceil(total / itemsPerPage) || 1;
      
      return {
        ...state,
        items,
        currentPage,
        pagination: {
          ...state.pagination,
          current_page: currentPage,
          total,
          from: total > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0,
          to: total > 0 ? Math.min(currentPage * itemsPerPage, total) : 0,
          last_page,
          next_page: currentPage < last_page ? currentPage + 1 : null,
          previous_page: currentPage > 1 ? currentPage - 1 : null
        }
      };
    }
    
    case 'SET_PAGE': {
      const newPage = action.payload;
      const { total, last_page } = state.pagination;
      
      if (newPage < 1 || newPage > last_page) return state;
      
      return {
        ...state,
        currentPage: newPage,
        pagination: {
          ...state.pagination,
          current_page: newPage,
          from: total > 0 ? (newPage - 1) * itemsPerPage + 1 : 0,
          to: total > 0 ? Math.min(newPage * itemsPerPage, total) : 0,
          next_page: newPage < last_page ? newPage + 1 : null,
          previous_page: newPage > 1 ? newPage - 1 : null
        }
      };
    }
    
    case 'CLEAR_ITEMS': {
      return {
        ...state,
        items: [],
        currentPage: 1,
        pagination: {
          ...state.pagination,
          total: 0,
          from: 0,
          to: 0,
          last_page: 1,
          current_page: 1,
          next_page: null,
          previous_page: null
        }
      };
    }
    
    default:
      return state;
  }
}

// ========== المكون الرئيسي ==========
export default function WishlistPage() {
  const { 
    favorites, 
    isLoading, 
    isMutating,
    total,
    clearAllFavorites,
    refetch
  } = useFavorites();
  
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const itemsPerPage = 8;

  // ✅ تحويل البيانات من useFavorites إلى المنتجات المحولة
  const transformFavorites = useCallback((favoritesData: any[]) => {
    const transformedItems: TransformedProduct[] = [];
    favoritesData.forEach((favorite: any) => {
      try {
        const transformed = transformFavoriteToProductCard(favorite);
        if (transformed && transformed.id && transformed.id !== '0') {
          transformedItems.push(transformed);
        }
      } catch (error) {
        console.error("❌ Error transforming favorite:", error);
      }
    });
    
    // إزالة التكرارات
    return Array.from(
      new Map(transformedItems.map(item => [item.id, item])).values()
    );
  }, []);

  // ✅ تحديث البيانات عند تغيير favorites (بدون setState مباشر في useEffect)
  useEffect(() => {
    if (favorites && favorites.length > 0) {
      console.log(`🟢 Transforming ${favorites.length} favorites`);
      const transformed = transformFavorites(favorites);
      dispatch({ 
        type: 'SET_ITEMS', 
        payload: { 
          items: transformed, 
          total: favorites.length, 
          currentPage: state.currentPage 
        } 
      });
    } else {
      dispatch({ type: 'CLEAR_ITEMS' });
    }
  }, [favorites, transformFavorites]); // ✅ إزالة state.currentPage من التبعيات

  // ✅ تحديث الصفحة
  const handlePageChange = useCallback((page: number) => {
    console.log(`🔄 Changing to page ${page}`);
    if (page >= 1 && page <= state.pagination.last_page) {
      dispatch({ type: 'SET_PAGE', payload: page });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [state.pagination.last_page]);

  // ✅ عرض العناصر حسب الصفحة الحالية
  const currentItems = useMemo(() => {
    const startIndex = (state.currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return state.items.slice(startIndex, endIndex);
  }, [state.items, state.currentPage, itemsPerPage]);

  // ✅ تحديث القائمة بعد الحذف
  const handleClearAll = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

  const confirmClearAll = useCallback(async () => {
    try {
      await clearAllFavorites();
      setShowClearConfirm(false);
      await refetch();
      toast.success("تم حذف جميع المنتجات من المفضلة");
    } catch (error) {
      console.error("❌ Error clearing favorites:", error);
      toast.error("حدث خطأ في حذف المفضلة");
    }
  }, [clearAllFavorites, refetch]);

  const cancelClearAll = useCallback(() => {
    setShowClearConfirm(false);
  }, []);

  const cleanImageUrl = useCallback((url: string) => {
    if (!url) return "/images/placeholder.jpg";
    if (url.startsWith('http')) return url;
    if (url.startsWith('/storage')) {
      return `https://dukanah.admin.t-carts.com${url}`;
    }
    return url;
  }, []);

  // ========== عرض حالة التحميل ==========
  if (isLoading && state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#EC221F] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== عرض حالة فارغة ==========
  if (state.items.length === 0) {
    return <WishlistEmpty />;
  }

  // ========== عرض المنتجات ==========
  return (
    <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b]">
      <div className="container mx-auto">
        <PageHeader title="قائمة المفضلة" />

        {/* ✅ شريط التحكم */}
        <div className="flex flex-wrap justify-between items-center gap-4 mt-6 mb-8">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-[#EC221F] fill-current" />
            <span className="text-sm text-gray-600">
              <span className="font-bold text-[#EC221F]">{state.items.length}</span> منتج
            </span>
          </div>
          
          {state.items.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={isMutating}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 transition disabled:opacity-50 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف الكل</span>
            </button>
          )}
        </div>

        {/* ✅ شبكة المنتجات */}
        <div 
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
          style={{ justifyItems: 'center' }}
        >
          {currentItems.map((item) => (
            <div 
              key={item.id}
              className="flex justify-center w-full"
            >
              <ProductCard
                id={item.id}
                name={item.name}
                price={item.price}
                image={cleanImageUrl(item.image)}
                hoverImage={cleanImageUrl(item.hoverImage)}
                href={item.href}
                originalPrice={item.originalPrice}
                discount={item.discount}
                colors={item.colors}
                rating={item.rating}
                reviewsCount={item.reviewsCount}
                isBestSeller={item.isBestSeller}
              />
            </div>
          ))}
        </div>

        {/* ✅ Pagination */}
        {state.pagination.last_page > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={state.pagination.current_page}
              lastPage={state.pagination.last_page}
              onPageChange={handlePageChange}
              total={state.pagination.total}
            />
          </div>
        )}
      </div>

      {/* ✅ نافذة تأكيد الحذف */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-bold text-gray-800">تأكيد الحذف</h3>
              <button 
                onClick={cancelClearAll} 
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-gray-700 text-lg font-medium mb-2">
                  هل أنت متأكد من حذف جميع المنتجات؟
                </p>
                <p className="text-gray-500 text-sm">
                  سيتم حذف <span className="font-bold text-[#EC221F]">{state.items.length}</span> منتج من قائمة المفضلة بشكل نهائي.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button 
                onClick={cancelClearAll} 
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-[8px] hover:bg-gray-50 transition font-medium"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmClearAll} 
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-[8px] hover:bg-red-700 transition font-medium"
              >
                حذف الكل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}