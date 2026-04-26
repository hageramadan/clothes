"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductCard } from "../products/ProductCard";
import { Button } from "../ui/button";

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

const latestProducts: Product[] = [
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
  {
    id: "5",
    name: "Lorem ipsum dolor sit amet consectetur",
    price: 10000,
    originalPrice: 15000,
    discount: 29,
    image: "/images/products/product4.png",
    hoverImage: "/images/products/product4-hover.png",
    href: "/products/5",
    colors: [
      { color: "#252B42", name: "أزرق داكن" },
      { color: "#E77C40", name: "برتقالي" },
      { color: "#23856D", name: "أخضر" },
      { color: "#EC221F", name: "أحمر" },
    ],
  },
  {
    id: "6",
    name: "Lorem ipsum dolor sit amet consectetur",
    price: 10000,
    image: "/images/products/product3.png",
    hoverImage: "/images/products/product3-hover.png",
    href: "/products/6",
    colors: [
      { color: "#252B42", name: "أزرق داكن" },
      { color: "#E77C40", name: "برتقالي" },
      { color: "#23856D", name: "أخضر" },
      { color: "#EC221F", name: "أحمر" },
    ],
  },
  {
    id: "7",
    name: "Lorem ipsum dolor sit amet consectetur",
    price: 10000,
    originalPrice: 20000,
    discount: 37,
    image: "/images/products/product4.png",
    hoverImage: "/images/products/product4-hover.png",
    href: "/products/7",
    colors: [
      { color: "#252B42", name: "أزرق داكن" },
      { color: "#E77C40", name: "برتقالي" },
      { color: "#23856D", name: "أخضر" },
      { color: "#EC221F", name: "أحمر" },
    ],
  },
  {
    id: "8",
    name: "Lorem ipsum dolor sit amet consectetur",
    price: 10000,
    image: "/images/products/product5.png",
    hoverImage: "/images/products/product5-hover.png",
    href: "/products/8",
    colors: [
      { color: "#252B42", name: "أزرق داكن" },
      { color: "#E77C40", name: "برتقالي" },
      { color: "#23856D", name: "أخضر" },
      { color: "#EC221F", name: "أحمر" },
    ],
  },
];

export function LatestProducts() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // محاكاة تحميل المنتجات عند تحميل المكون
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1500); // مدة ظهور السبينر 1.5 ثانية

    return () => clearTimeout(timer);
  }, []);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + 6, latestProducts.length));
      setIsLoadingMore(false);
    }, 500);
  };

  const visibleProducts = latestProducts.slice(0, displayCount);
  const hasMore = displayCount < latestProducts.length;

  // عرض السبينر الرئيسي أثناء التحميل الأولي
  if (isInitialLoading) {
    return (
      <section className="py-6 md:py-12 bg-white">
        <div className="container-custom">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              {/* Spinner تصميم أنيق */}
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#EC221F] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-500 text-sm animate-pulse">
                جاري تحميل أحدث المنتجات...
              </p>
            </div>
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
            أحدث المنتجات
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

        {/* Loading More State - عند التحميل الإضافي */}
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

        {/* زر عرض المزيد - اختياري */}
        {hasMore && !isLoadingMore && (
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