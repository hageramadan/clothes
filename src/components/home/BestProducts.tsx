"use client";

import { useState } from "react";
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
  colors?: Array<{ color: string; name: string }>; // إضافة خاصية الألوان
}

const latestProducts: Product[] = [
  {
    id: "1",
    name: "Lorem ipsum dolor sit amet consectetur",
    price: 10000,
    originalPrice: 35000,
    discount: 28,
    image: "/images/products/product1.png",
    hoverImage: "/images/products/product1-hover.png", // أضيفي الصورة الثانية
    href: "/products/1",
    colors: [ // أضيفي الألوان لكل منتج
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

export function BestProducts() {
  const [displayCount, setDisplayCount] = useState(8);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = () => {
    setIsLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + 6, latestProducts.length));
      setIsLoading(false);
    }, 500);
  };

  const visibleProducts = latestProducts.slice(0, displayCount);
  const hasMore = displayCount < latestProducts.length;

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
                colors={product.colors} // تمرير الألوان
              />
            </div>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-4 md:py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EC221F]"></div>
          </div>
        )}
      </div>
    </section>
  );
}