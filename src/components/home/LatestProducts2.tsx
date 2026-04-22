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
  href: string;
  originalPrice?: number;
  discount?: number;
}

const latestProducts: Product[] = [
  {
    id: "1",
    name: "Lorem ipsum dolor sit amet consectetur. Accumsan massa mauris nunc lacus.",
    price: 10000,
    originalPrice: 35000,
    discount: 28,
    image: "/images/products/pro11.png",
    href: "/products/1",
  },
  {
    id: "2",
     name: "Lorem ipsum dolor sit amet consectetur. Accumsan massa mauris nunc lacus.",
    price: 10000,
    image: "/images/products/pro12.png",
    href: "/products/2",
  },
  {
    id: "3",
    name: "Lorem ipsum dolor sit amet consectetur. Accumsan massa mauris nunc lacus.",
    price: 10000,
    originalPrice: 60000,
    discount: 25,
    image: "/images/products/pro13.png",
    href: "/products/3",
  },
  {
    id: "4",
       name: "Lorem ipsum dolor sit amet consectetur. Accumsan massa mauris nunc lacus.",
    price: 10000,
    image: "/images/products/pro14.png",
    href: "/products/4",
  },
  {
    id: "5",
     name: "Lorem ipsum dolor sit amet consectetur. Accumsan massa mauris nunc lacus.",
    price: 10000,
    originalPrice: 15000,
    discount: 29,
    image: "/images/products/pro15.png",
    href: "/products/5",
  },
  {
    id: "6",
    name: "Lorem ipsum dolor sit amet consectetur. Accumsan massa mauris nunc lacus.",
    price: 10000,
    image: "/images/products/pro16.png",
    href: "/products/6",
  },
  {
    id: "7",
     name: "Lorem ipsum dolor sit amet consectetur. Accumsan massa mauris nunc lacus.",
    price: 10000,
    originalPrice: 20000,
    discount: 37,
    image: "/images/products/pro17.png",
    href: "/products/7",
  },
  {
    id: "8",
     name: "Lorem ipsum dolor sit amet consectetur. Accumsan massa mauris nunc lacus.",
    price: 10000,
    image: "/images/products/pro5.png",
    href: "/products/8",
  },
];

export function LatestProducts2() {
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
    <section className="py-6 md:py-12  bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className=" mb-2 md:mb-5 flex justify-between">
          <h2 className="text-2xl md:text-3xl  font-bold mb-3" style={{ color: '#112B40' }}>
            أحدث المنتجات
          </h2>
        <p className="text-[#08B2A7] text-[16px] font-bold">
          عرض المزيد
        </p>
          
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
              <ProductCard {...product} />
            </div>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C092BD]"></div>
          </div>
        )}

        {/* View More Button */}
        {/* {hasMore && !isLoading && (
          <div className="text-center">
            <Button
              onClick={handleLoadMore}
              className="group px-8 py-6 text-base font-semibold transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'white',
                color: '#C092BD',
                border: '2px solid #C092BD',
                borderRadius: '12px'
              }}
            >
              عرض المزيد
              <ChevronLeft className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        )} */}

        {/* View All Link */}
        {/* {!hasMore && displayCount > 0 && (
          <div className="text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-[#C092BD] hover:text-[#1a8fd0] font-semibold transition-colors duration-300"
            >
              عرض جميع المنتجات
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </div>
        )} */}


      </div>
    </section>
  );
}