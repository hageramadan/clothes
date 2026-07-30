// components/home/YouMayAlsoLike.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductCard } from "../products/ProductCard";
import { Button } from "../ui/button";
import { getMostSellingProducts, getNewProducts, ProductData, getAllProducts } from "@/services/api";

interface VariantAttribute {
  id: number;
  attribute_type: {
    id: number;
    name: string;
  };
  value: string;
  meta: {
    color?: string;
  } | null;
}
interface ProductVariant {
  id: number;
  sku: string | null;
  price: number;
  has_discount: boolean;
  discount_type: string | null;
  discount_value: number | null;
  price_after_discount: number;
  quantity: number | null;
  is_active: boolean;
  variant_image: string | null;
  attributes: VariantAttribute[];
}
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  hoverImage?: string;
  href: string;
  originalPrice?: number;
  discount?: number;
  colors?: Array<{ color: string; name: string }>;
  rating?: number;
  reviewsCount?: number;
  isBestSeller?: boolean;
}

const extractColorsFromVariants = (variants: ProductVariant[]): Array<{ color: string; name: string }> => {
  const colorMap = new Map<string, string>();
  
  if (!variants || variants.length === 0) return [];
  
  variants.forEach((variant) => {
    if (variant.attributes && Array.isArray(variant.attributes)) {
      variant.attributes.forEach((attr: VariantAttribute) => {
        // إذا كان الـ attribute من نوع "اللون"
        if (attr.attribute_type?.name === "اللون" && attr.value && attr.meta?.color) {
          if (!colorMap.has(attr.value)) {
            colorMap.set(attr.value, attr.meta.color);
          }
        }
      });
    }
  });
  
  return Array.from(colorMap.entries()).map(([name, color]) => ({
    name: name,
    color: color
  }));
};
const transformProduct = (product: ProductData): Product => {
  // معالجة الصور بشكل صحيح
  const cleanImageUrl = (url: string) => {
    if (!url) return "/images/placeholder.jpg";
    if (url.startsWith('/storage')) {
      return `https://fashion.admin.t-carts.com${url}`;
    }
    return `https://fashion.admin.t-carts.com${url}`;
  };
  
  const mainImage = product.images && product.images.length > 0 
    ? cleanImageUrl(product.images[0])
    : "/images/placeholder.jpg";
    
  const hoverImage = product.images && product.images.length > 1 
    ? cleanImageUrl(product.images[1])
    : mainImage;

  // حساب الخصم بشكل ديناميكي
  let discount: number | undefined;
  let originalPrice: number | undefined;
  
  if (product.pricing.has_discount && product.pricing.price_after_discount) {
    discount = Math.round(((product.pricing.price - product.pricing.price_after_discount) / product.pricing.price) * 100);
    originalPrice = product.pricing.price;
  }

  // ✅ استخراج الألوان من جميع الـ variants باستخدام الدالة الجديدة
  let colors: Array<{ color: string; name: string }> = [];
  
  if (product.has_variants && product.variants && product.variants.length > 0) {
    colors = extractColorsFromVariants(product.variants as ProductVariant[]);
  }

  return {
    id: product.id.toString(),
    name: product.name,
    price: product.pricing.final_price,
    image: mainImage,
    hoverImage: hoverImage,
    href: `/product/${product.id}`,
    originalPrice: originalPrice,
    discount: discount,
    colors: colors,
    rating: product.avg_rating || 0,
    reviewsCount: product.total_reviews || 0,
    isBestSeller:product.is_active,
  };
};


// دالة لخلط المنتجات عشوائياً
const shuffleProducts = (products: Product[]): Product[] => {
  const shuffled = [...products];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function YouMayAlsoLike() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // استخدام useRef لمنع التحديثات المتكررة
  const isMounted = useRef(true);
  const fetchingRef = useRef(false);

  // جلب المنتجات من API (منتجات عشوائية من الأكثر مبيعاً)
  const fetchProducts = useCallback(async (page: number, append: boolean = false) => {
    if (fetchingRef.current) return;
    
    try {
      fetchingRef.current = true;
      
      if (page === 1) {
        setIsInitialLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      // جلب المنتجات من API (الأكثر مبيعاً أو الأحدث)
      let productsData: ProductData[] = [];
      
      try {
        // محاولة جلب المنتجات الأكثر مبيعاً أولاً
        productsData = await getMostSellingProducts(page, 12);
        
        // إذا لم تكن هناك منتجات، جلب المنتجات الجديدة
        if (productsData.length === 0) {
          productsData = await getNewProducts(page, 12);
        }
        
        // إذا كان لا يزال لا توجد منتجات، جلب جميع المنتجات
        if (productsData.length === 0) {
          const { products: allProducts } = await getAllProducts({page: 1,
        per_page: 12});
          productsData = allProducts;
        }
      } catch (err) {
        console.error('Error fetching from most selling, trying new products:', err);
        productsData = await getNewProducts(page, 12);
      }
      
      if (!isMounted.current) return;
      
      if (productsData.length === 0) {
        setHasMore(false);
      }
      
      let transformedProducts = productsData.map(transformProduct);
      
      // خلط المنتجات عشوائياً لظهور منتجات مختلفة في كل مرة
      if (page === 1 && !append) {
        transformedProducts = shuffleProducts(transformedProducts);
      }
      
      if (append) {
        setProducts(prev => [...prev, ...transformedProducts]);
      } else {
        setProducts(transformedProducts);
      }
      
      setTotalProducts(productsData.length);
      setHasMore(productsData.length === 12);
      
    } catch (err) {
      console.error('Error fetching products:', err);
      if (!isMounted.current) return;
      setError('فشل في تحميل المنتجات');
      setProducts([]);
    } finally {
      if (!isMounted.current) return;
      setIsInitialLoading(false);
      setIsLoadingMore(false);
      fetchingRef.current = false;
    }
  }, []);

  // استخدام useEffect منفصل للتحميل الأولي
  useEffect(() => {
    isMounted.current = true;
    
    const timeoutId = setTimeout(() => {
      fetchProducts(1, false);
    }, 100); // تأخير بسيط لتجنب التحميل المتزامن مع أحدث المنتجات
    
    return () => {
      isMounted.current = false;
      clearTimeout(timeoutId);
    };
  }, [fetchProducts]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingMore && !fetchingRef.current) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchProducts(nextPage, true);
    }
  }, [hasMore, isLoadingMore, currentPage, fetchProducts]);

  const visibleProducts = products.slice(0, displayCount);
  const showLoadMoreButton = hasMore && products.length >= displayCount && products.length < totalProducts;

  // عرض السبينر الرئيسي أثناء التحميل الأولي
  if (isInitialLoading) {
    return (
      <section className="py-6 md:py-12 bg-gray-50">
        <div className="container-custom">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#EC221F] border-t-transparent rounded-full animate-spin"></div>
              </div>
              {/* <p className="text-gray-500 text-sm animate-pulse">
                جاري تحميل المنتجات...
              </p> */}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // عرض رسالة خطأ
  if (error && products.length === 0) {
    return (
      <section className="py-6 md:py-12 bg-gray-50">
        <div className="container-custom">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => fetchProducts(1, false)}
              className="px-4 py-2 bg-[#EC221F] text-white rounded-[8px]  hover:bg-[#d11d1a] transition"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 md:py-12 bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-2 md:mb-5 flex justify-between items-center">
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#112B40' }}>
            قد يعجبك أيضاً
          </h2>
          <Link 
            href="/products" 
            className="text-[#EC221F] text-[16px] font-bold hover:underline transition-all duration-300 flex items-center gap-1"
          >
            عرض المزيد
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-2 md:mb-5">
          {visibleProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-in fade-in zoom-in duration-500 flex justify-center w-full"
              style={{ 
                animationFillMode: 'both',
                animationDelay: `${index * 100}ms`
              }}
            >
              <ProductCard 
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                hoverImage={product.hoverImage}
                href={product.href}
                originalPrice={product.originalPrice}
                discount={product.discount}
                colors={product.colors}
                rating={product.rating}
                reviewsCount={product.reviewsCount}
                isBestSeller={product.isBestSeller}
              />
            </div>
          ))}
        </div>

        {/* Loading More State */}
        {isLoadingMore && (
          <div className="flex justify-center items-center py-4 md:py-8">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 border-3 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-8 h-8 border-3 border-[#EC221F] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-400 text-xs">جاري التحميل...</p>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {showLoadMoreButton && !isLoadingMore && (
          <div className="text-center mt-4">
            <Button
              onClick={handleLoadMore}
              className="px-6 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'transparent',
                color: '#EC221F',
                border: '2px solid #EC221F',
                borderRadius: '8px'
              }}
            >
              عرض المزيد
            </Button>
          </div>
        )}

        {/* No Products Message */}
        {products.length === 0 && !isInitialLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">لا توجد منتجات حالياً</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </section>
  );
}