"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductCard } from "../products/ProductCard";
import { Button } from "../ui/button";
import { getMostSellingProducts, ProductData } from "@/services/api";

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
}

// تحويل البيانات من API إلى شكل المنتج المطلوب
const transformProduct = (product: ProductData): Product => {
  const mainImage = product.images && product.images.length > 0 
    ? `https://dukanah.admin.t-carts.com${product.images[0]}`
    : "/images/placeholder.jpg";
    
  const hoverImage = product.images && product.images.length > 1 
    ? `https://dukanah.admin.t-carts.com${product.images[1]}`
    : mainImage;

  // حساب الخصم إذا وجد
  let discount: number | undefined;
  let originalPrice: number | undefined;
  
  if (product.pricing.has_discount && product.pricing.price_after_discount) {
    discount = Math.round(((product.pricing.price - product.pricing.price_after_discount) / product.pricing.price) * 100);
    originalPrice = product.pricing.price;
  }

  return {
    id: product.id.toString(),
    name: product.name,
    price: product.pricing.final_price,
    image: mainImage,
    hoverImage: hoverImage,
    href: `/products/${product.id}`,
    originalPrice: originalPrice,
    discount: discount,
    colors: [
      { color: "#252B42", name: "أزرق داكن" },
      { color: "#E77C40", name: "برتقالي" },
      { color: "#23856D", name: "أخضر" },
      { color: "#EC221F", name: "أحمر" },
    ],
  };
};

// بيانات افتراضية كـ fallback
const getDefaultProducts = (): Product[] => {
  return [
    {
      id: "1",
      name: "Lorem ipsum dolor sit amet consectetur",
      price: 10000,
      originalPrice: 35000,
      discount: 28,
      image: "/images/products/product1.png",
      hoverImage: "/images/products/product1-hover.png",
      href: "/products/1",
      colors: [
        { color: "#252B42", name: "أزرق داكن" },
        { color: "#E77C40", name: "برتقالي" },
        { color: "#23856D", name: "أخضر" },
        { color: "#EC221F", name: "أحمر" },
      ],
    },
    {
      id: "2",
      name: "Lorem ipsum dolor sit amet consectetur",
      price: 10000,
      image: "/images/products/product2.png",
      hoverImage: "/images/products/product2-hover.png",
      href: "/products/2",
      colors: [
        { color: "#252B42", name: "أزرق داكن" },
        { color: "#E77C40", name: "برتقالي" },
        { color: "#23856D", name: "أخضر" },
        { color: "#EC221F", name: "أحمر" },
      ],
    },
    {
      id: "3",
      name: "Lorem ipsum dolor sit amet consectetur",
      price: 10000,
      originalPrice: 60000,
      discount: 25,
      image: "/images/products/product3.png",
      hoverImage: "/images/products/product3-hover.png",
      href: "/products/3",
      colors: [
        { color: "#252B42", name: "أزرق داكن" },
        { color: "#E77C40", name: "برتقالي" },
        { color: "#23856D", name: "أخضر" },
        { color: "#EC221F", name: "أحمر" },
      ],
    },
    {
      id: "4",
      name: "Lorem ipsum dolor sit amet consectetur",
      price: 10000,
      image: "/images/products/product5.png",
      hoverImage: "/images/products/product5-hover.png",
      href: "/products/4",
      colors: [
        { color: "#252B42", name: "أزرق داكن" },
        { color: "#E77C40", name: "برتقالي" },
        { color: "#23856D", name: "أخضر" },
        { color: "#EC221F", name: "أحمر" },
      ],
    },
  ];
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
      setProducts(getDefaultProducts());
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
              <p className="text-gray-500 text-sm animate-pulse">
                جاري تحميل المنتجات...
              </p>
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
              className="px-4 py-2 bg-[#EC221F] text-white rounded-lg hover:bg-[#d11d1a] transition"
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

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center mb-2 md:mb-5">
          {visibleProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-in fade-in zoom-in duration-500"
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