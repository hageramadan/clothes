"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaRegStar } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  href: string;
  originalPrice?: number;
  discount?: number;
}

export function ProductCard({ 
  id, 
  name, 
  price, 
  image, 
  href,
  originalPrice,
  discount 
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Add to cart logic here
    console.log("Added to cart:", id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Quick view logic here
    console.log("Quick view:", id);
  };

  return (
    <div
      role="article"
      aria-labelledby={`product-name-${id}`}
      className="group w-[150px] sm:w-[160px] md:w-[308px] h-[310px] md:h-[494px] relative bg-white transition-all duration-500 ease-out hover:shadow-2xl"
      style={{
        borderRadius: '16px',
        border: '1px solid #E4E7E9',
        padding: '0 0px 16px 0',
        overflow: 'hidden',
        transform: isHovered ? 'translateY(-12px)' : 'translateY(0px)',
        transition: 'transform 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), box-shadow 0.4s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={href} className="block h-full" aria-label={`عرض تفاصيل ${name}`}>
        {/* Image Container */}
        <div 
          className="relative mx-auto transition-all duration-500"
          style={{
            width: '100%',
            borderRadius: '5px',
          }}
        >
          {/* Heart Icon - Top Left Corner */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-1 bg-white shadow left-2 z-10 rounded-full p-1.5 hover:bg-red-50 transition-all duration-200 hover:scale-110"
            style={{ color: isFavorite ? '#ef4444' : '#112B40' }}
            aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
            aria-pressed={isFavorite}
          >
            <Heart className="h-5 w-5 md:h-6 md:w-6" fill={isFavorite ? '#ef4444' : 'none'} />
          </button>
          
          {/* Best Seller Badge */}
          <div className="absolute top-2 right-2 z-10">
            <p className="text-[9px] md:text-xs font-bold text-white bg-[#08B2A7] p-1 md:p-1.5 rounded">
              الاكثر مبيعا
            </p>
          </div>

          {/* Image with scale effect on hover */}
          <div className="overflow-hidden rounded-t-lg">
            <Image
              src={image}
              alt={name}
              width={340}
              height={340}
              className="object-cover w-[166px] h-[166px] md:w-[308px] md:h-1/5 lg:h-1/2 transition-transform duration-500 ease-out group-hover:scale-105"
              style={{
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          </div>
        </div>

        {/* Product Info with slide up effect */}
        <div 
          className="px-2 flex flex-col gap-0.5 sm:gap-2 mt-2 transition-all duration-500 ease-out"
          style={{
            transform: isHovered ? 'translateY(-4px)' : 'translateY(0px)',
          }}
        >
          <div className="flex gap-1 items-center mb-1">
            <p className="text-[#77878F] text-xs md:text-sm">(994)</p>
            <div className="flex gap-0.5">
              <FaRegStar className="text-[#77878F] w-3 h-3 md:w-4 md:h-4"/>
              <FaStar className="text-[#FA8232] w-3 h-3 md:w-4 md:h-4" />
              <FaStar className="text-[#FA8232] w-3 h-3 md:w-4 md:h-4" />
              <FaStar className="text-[#FA8232] w-3 h-3 md:w-4 md:h-4" />
              <FaStar className="text-[#FA8232] w-3 h-3 md:w-4 md:h-4" />
            </div>
          </div>
          
          {/* Product Name */}
          <h3 className="text-[12px] md:text-[14px] font-medium line-clamp-2 mb-1" style={{ color: '#112B40' }}>
            {name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-sm md:text-[17px] font-semibold relative" style={{ color: '#08B2A7' }}>
              {price.toLocaleString()} <span className="text-[12px] font-semibold">EGP</span>
            </span>
            {/* {originalPrice && (
              <span className="text-xs md:text-sm text-gray-400 line-through">
                {originalPrice.toLocaleString()} EGP
              </span>
            )} */}
          </div>
          
          {/* Discount badge if exists */}
          {/* {discount && (
            <div className="absolute top-20 left-2 md:top-24 md:left-3 z-10">
              <span className="bg-red-500 text-white text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                -{discount}%
              </span>
            </div>
          )}
           */}
          {/* Add to cart button with slide/fade effect */}
          <div
            style={{
              opacity: isHovered ? 1 : 0.9,
              transition: 'opacity 0.3s ease 0.1s',
            }}
          >
            <Button
              onClick={handleAddToCart}
              className="w-full text-[12px] md:text-[16px] font-semibold rounded-[24px] bg-[#C092BD] hover:bg-[#8C6D8A]
               transition-all duration-300 text-white py-0 md:py-5 px-[32px] border-2 border-[#C092BD] hover:border-[#8C6D8A] flex items-center justify-center gap-2 hover:scale-[1.02]"  
            >
              <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
              إضافة إلى السلة
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
}

// Example usage with multiple products
export function ProductsGrid() {
  const products = [
    {
      id: "1",
      name: "سماعات لاسلكية عالية الجودة مع قاعدة شحن",
      price: 360,
      originalPrice: 35000,
      discount: 28,
      image: "/images/products/pro1.png",
      href: "/",
    },
    {
      id: "2",
      name: "ساعة ذكية رياضية",
      price: 360,
      image: "/images/products/pro2.png",
      href: "/",
    },
    {
      id: "3",
      name: "حقيبة ظهر عصرية",
      price: 360,
      originalPrice: 60000,
      discount: 25,
      image: "/images/products/pro3.png",
      href: "/",
    },
    {
      id: "4",
      name: "سماعة ألعاب احترافية",
      price: 360,
      image: "/images/products/pro4.png",
      href: "/",
    },
  ];

  return (
    <section className="py-2 md:py-12 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: '#112B40' }}>
          منتجات مميزة
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}