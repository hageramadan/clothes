// app/search/page.tsx
"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Pagination from "@/components/products/Pagination";
import toast from "react-hot-toast";
import Link from "next/link";

const API_URL = 'https://dukanah.admin.t-carts.com/api';

// دالة جلب التوكن
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// دالة جلب نتائج البحث باستخدام endpoint /products?search=
const searchProducts = async (query: string, page: number = 1, perPage: number = 12) => {
  try {
    const token = getToken();
    console.log(`🟢 Searching products for "${query}" page ${page}`);
    
    const response = await fetch(
      `${API_URL}/products?page=${page}&per_page=${perPage}&search=${encodeURIComponent(query)}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );
    
    const data = await response.json();
    console.log(`📥 Search response for page ${page}:`, data);
    return data;
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};

// دالة تحويل المنتج لنفس صيغة ProductCard
const transformProductForCard = (product: any) => {
  let colors: Array<{ color: string; name: string }> = [];
  
  // جلب الألوان من المتغيرات إذا وجدت
  if (product.has_variants && product.variants && product.variants.length > 0) {
    const firstVariant = product.variants[0];
    if (firstVariant.attributes) {
      colors = firstVariant.attributes
        .filter((attr: any) => attr.attribute_type?.name === "اللون")
        .map((attr: any) => ({
          color: attr.meta?.color || '#000000',
          name: attr.value
        }));
    }
  }

  const cleanImageUrl = (url: string) => {
    if (!url) return '/placeholder-image.jpg';
    if (url.startsWith('/storage')) {
      return `https://dukanah.admin.t-carts.com${url}`;
    }
    return url;
  };

  // حساب السعر النهائي
  const finalPrice = product.pricing?.final_price || product.pricing?.price || 0;
  const originalPrice = product.pricing?.price;
  const hasDiscount = product.pricing?.has_discount || false;
  
  let discount = undefined;
  if (hasDiscount && originalPrice && originalPrice > finalPrice) {
    discount = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
  }

  return {
    id: product.id.toString(),
    name: product.name,
    price: finalPrice,
    image: cleanImageUrl(product.images?.[0]),
    hoverImage: product.images?.[1] ? cleanImageUrl(product.images[1]) : cleanImageUrl(product.images?.[0]),
    href: `/product/${product.id}`,
    originalPrice: hasDiscount ? originalPrice : undefined,
    discount: discount,
    colors: colors,
    rating: product.avg_rating || 0,
    reviewsCount: product.total_reviews || 0,
    isBestSeller: (product.avg_rating || 0) >= 4.5,
  };
};

// مكون البحث الرئيسي
function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true); // ✅ حالة للتحميل الأولي
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchInput, setSearchInput] = useState(query);
  const [sortBy, setSortBy] = useState("newest");
  
  const perPage = 12;

  // ✅ استخدام ref لمنع التكرار
  const hasLoadedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isSearchChangeRef = useRef(false);

  // ✅ دالة جلب نتائج البحث المحسنة
  const fetchSearchResults = useCallback(async () => {
    if (!query) {
      setProducts([]);
      setTotalProducts(0);
      setLastPage(1);
      setIsLoading(false);
      setIsFirstLoad(false);
      return;
    }

    // ✅ إلغاء الطلب السابق
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    // ✅ تعيين حالة التحميل
    setIsLoading(true);
    
    try {
      const result = await searchProducts(query, currentPage, perPage);
      
      if (!abortControllerRef.current?.signal.aborted) {
        // التعامل مع استجابة الـ API
        if (result.result === true && result.data) {
          const productsData = result.data.products || [];
          const paginationData = result.data.pagination;
          
          console.log(`✅ Found ${productsData.length} products for page ${currentPage}`);
          
          setProducts(productsData);
          
          if (paginationData) {
            setLastPage(paginationData.last_page || 1);
            setTotalProducts(paginationData.total || productsData.length);
          } else {
            setLastPage(1);
            setTotalProducts(productsData.length);
          }
          hasLoadedRef.current = true;
        } else {
          setProducts([]);
          setTotalProducts(0);
          setLastPage(1);
        }
      }
    } catch (error) {
      if (!abortControllerRef.current?.signal.aborted) {
        console.error("Error fetching search results:", error);
        toast.error("حدث خطأ أثناء جلب نتائج البحث");
        setProducts([]);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        // ✅ تأخير إيقاف التحميل قليلاً لمنع الوميض
        setTimeout(() => {
          setIsLoading(false);
          setIsFirstLoad(false);
        }, 200);
      }
    }
  }, [query, currentPage, perPage]);

  // ✅ جلب النتائج عند تحميل الصفحة أو تغيير البحث
  useEffect(() => {
    if (query) {
      setIsFirstLoad(true);
      fetchSearchResults();
    } else {
      setProducts([]);
      setTotalProducts(0);
      setLastPage(1);
      setIsLoading(false);
      setIsFirstLoad(false);
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, fetchSearchResults]);

  // ✅ إعادة تعيين الصفحة عند تغيير البحث
  useEffect(() => {
    if (query) {
      isSearchChangeRef.current = true;
      setCurrentPage(1);
    }
  }, [query]);

  // ✅ تغيير الصفحة
  useEffect(() => {
    if (currentPage > 1 && query) {
      fetchSearchResults();
    }
  }, [currentPage, query, fetchSearchResults]);

  // ✅ إعادة الترتيب عند تغيير خيار الترتيب (فلتر محلي)
  useEffect(() => {
    if (products.length > 0) {
      const sortedProducts = [...products];
      switch (sortBy) {
        case "price_asc":
          sortedProducts.sort((a, b) => (a.pricing?.final_price || a.pricing?.price || 0) - (b.pricing?.final_price || b.pricing?.price || 0));
          break;
        case "price_desc":
          sortedProducts.sort((a, b) => (b.pricing?.final_price || b.pricing?.price || 0) - (a.pricing?.final_price || a.pricing?.price || 0));
          break;
        case "newest":
          sortedProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case "popular":
          sortedProducts.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
          break;
        default:
          break;
      }
      setProducts(sortedProducts);
    }
  }, [sortBy, products.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      isSearchChangeRef.current = true;
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const handlePageChange = (page: number) => {
    console.log(`🔄 Changing to page ${page}`);
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ✅ عرض معلومات Pagination
  const getPaginationInfo = () => {
    if (totalProducts === 0) return '';
    const from = (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, totalProducts);
    return `عرض ${from} - ${to} من ${totalProducts} نتيجة`;
  };

  // ✅ عرض التحميل
  if (isFirstLoad || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="جاري البحث..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen page-with-padding">
      <div className="container mx-auto px-4 pb-16">
        {/* مسار الصفحة (Breadcrumb) */}
        <div className="flex items-center gap-1 mb-6 text-sm">
          <Link href="/" className="text-[#726C6C] hover:text-[#EC221F] transition">
            الرئيسية
          </Link>
          <span className="text-[#726C6C]">/</span>
          <span className="text-[#180100] font-medium">البحث</span>
          {query && (
            <>
              <span className="text-[#726C6C]">/</span>
              <span className="text-[#EC221F]">{query}</span>
            </>
          )}
        </div>

        {/* عنوان الصفحة وشريط البحث */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            نتائج البحث
          </h1>
          
          {/* شريط البحث */}
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ابحث عن منتجات..."
              className="w-full px-6 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EC221F] focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#EC221F] transition"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* عدد النتائج وشريط الترتيب */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <p className="text-gray-600">
            {totalProducts > 0 ? (
              <>تم العثور على <span className="font-bold text-[#EC221F]">{totalProducts}</span> نتيجة لـ `{query}`</>
            ) : (
              <>لم يتم العثور على نتائج لـ `{query}`</>
            )}
          </p>
          
          {/* ترتيب النتائج */}
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="px-4 py-2 border border-gray-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#EC221F]"
          >
            <option value="newest">الأحدث</option>
            <option value="popular">الأكثر مبيعاً</option>
            <option value="price_asc">السعر: من الأقل للأعلى</option>
            <option value="price_desc">السعر: من الأعلى للأقل</option>
          </select>
        </div>

        {/* قائمة المنتجات */}
        {products.length > 0 ? (
          <>
            {/* ✅ عرض معلومات Pagination */}
            <div className="text-sm text-gray-500 mb-4">
              {getPaginationInfo()}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => {
                const cardData = transformProductForCard(product);
                return (
                  <div
                    key={cardData.id}
                    className="flex justify-center w-full"
                  >
                    <ProductCard
                      id={cardData.id}
                      name={cardData.name}
                      price={cardData.price}
                      image={cardData.image}
                      hoverImage={cardData.hoverImage}
                      href={cardData.href}
                      originalPrice={cardData.originalPrice}
                      discount={cardData.discount}
                      colors={cardData.colors}
                      rating={cardData.rating}
                      reviewsCount={cardData.reviewsCount}
                      isBestSeller={cardData.isBestSeller}
                    />
                  </div>
                );
              })}
            </div>
            
            {/* ✅ استخدام مكون Pagination الموحد */}
            {lastPage > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  lastPage={lastPage}
                  onPageChange={handlePageChange}
                  total={totalProducts}
                />
              </div>
            )}
          </>
        ) : (
          // ✅ حالة عدم وجود نتائج - تظهر فقط بعد انتهاء التحميل
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد نتائج</h3>
            <p className="text-gray-500">
              لم نتمكن من العثور على منتجات مطابقة لـ `{query}`
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 text-[#EC221F] hover:underline"
            >
              العودة إلى الرئيسية
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// المكون الرئيسي مع Suspense
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="جاري التحميل..." />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}