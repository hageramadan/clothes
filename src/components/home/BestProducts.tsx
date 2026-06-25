// src/components/home/BestProducts.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductCard } from "../products/ProductCard";
import { Button } from "../ui/button";
import { getMostSellingProducts, ProductData } from "@/services/api";

// ✅ إضافة الواجهات المطلوبة
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

// ✅ دالة استخراج الألوان من الـ variants
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

// تحويل البيانات من API إلى شكل المنتج المطلوب - ديناميكي بالكامل
const transformProduct = (product: ProductData): Product => {
  // معالجة الصور بشكل صحيح
  const cleanImageUrl = (url: string) => {
    if (!url) return "/images/placeholder.jpg";
    if (url.startsWith('/storage')) {
      return `https://dukanah.admin.t-carts.com${url}`;
    }
    return `https://dukanah.admin.t-carts.com${url}`;
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
    isBestSeller: product.is_active,
  };
};

export function BestProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const isMounted = useRef(true);
  const fetchingRef = useRef(false);

  // جلب المنتجات من API
  const fetchProducts = useCallback(async (page: number, append: boolean = false) => {
    // منع جلب البيانات إذا كان هناك جلب جاري
    if (fetchingRef.current) return;
    
    try {
      fetchingRef.current = true;
      
      if (page === 1) {
        setIsInitialLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const productsData = await getMostSellingProducts(page, 12);
      
      // التحقق من أن المكون لا يزال موجوداً قبل تحديث الحالة
      if (!isMounted.current) return;
      
      if (productsData.length === 0) {
        setHasMore(false);
      }
      
      const transformedProducts = productsData.map(transformProduct);
      
      if (append) {
        setProducts(prev => [...prev, ...transformedProducts]);
      } else {
        setProducts(transformedProducts);
      }
      
      setTotalProducts(productsData.length);
      setHasMore(productsData.length === 12);
      
    } catch (err) {
      console.error('Error fetching most selling products:', err);
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

  useEffect(() => {
    isMounted.current = true;
    
    // استخدام setTimeout لتأخير التحميل ومنع التحديثات المتزامنة
    const timeoutId = setTimeout(() => {
      fetchProducts(1, false);
    }, 0);
    
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
      <section className="py-6 md:py-12 bg-white">
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
      <section className="py-6 md:py-12 bg-white">
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
    <section className="py-6 md:py-12 bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-2 md:mb-5 flex justify-between items-center">
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#112B40' }}>
            الاكثر طلبا
          </h2>
          <Link 
            href="/products" 
            className="text-[#EC221F] text-[16px] font-bold hover:underline transition-all duration-300"
          >
            عرض المزيد
          </Link>
        </div>

        {/* Products Grid - معدل لضمان أحجام متساوية */}
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

        {/* Load More Button - يظهر فقط عند وجود المزيد من المنتجات */}
        {showLoadMoreButton && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-6 py-2 border border-[#EC221F] text-[#EC221F] rounded-[8px]  hover:bg-[#EC221F] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? 'جاري التحميل...' : 'تحميل المزيد'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}