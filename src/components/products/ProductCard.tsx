"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaRegStar } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";

interface ColorOption {
  color: string;
  name: string;
}

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  hoverImage?: string;
  href: string;
  originalPrice?: number;
  discount?: number;
  colors?: ColorOption[]; // إضافة خاصية الألوان
}

export function ProductCard({ 
  id, 
  name, 
  price, 
  image, 
  hoverImage,
  href,
  originalPrice,
  discount,
  colors = [ // ألوان افتراضية إذا لم يتم تمريرها
    { color: "#252B42", name: "أزرق داكن" },
    { color: "#E77C40", name: "برتقالي" },
    { color: "#23856D", name: "أخضر" },
    { color: "#EC221F", name: "أحمر" },
  ]
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImage, setCurrentImage] = useState(image);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // تغيير الصورة عند hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hoverImage) {
      setCurrentImage(hoverImage);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImage(image);
  };

  return (
    <div
      role="article"
      aria-labelledby={`product-name-${id}`}
      className="group w-full max-w-[340px] sm:max-w-[350px] md:max-w-[308px] lg:max-w-[308px] mx-auto h-auto relative bg-white transition-all duration-500 ease-out hover:shadow-2xl"
      style={{
        borderRadius: '16px',
        border: '1px solid #E4E7E9',
        padding: '0 0px 16px 0',
        overflow: 'hidden',
        transform: isHovered ? 'translateY(-12px)' : 'translateY(0px)',
        transition: 'transform 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), box-shadow 0.4s ease',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={href} className="block h-full" aria-label={`عرض تفاصيل ${name}`}>
        {/* Image Container */}
        <div 
          className="relative mx-auto transition-all duration-500 w-full"
          style={{
            borderRadius: '5px',
          }}
        >
          {/* Heart Icon - Top Left Corner */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-1 left-2 z-10 rounded-full p-1.5  hover:bg-red-50 transition-all duration-200 hover:scale-110"
            style={{ color: isFavorite ? '#ef4444' : '#112B40' }}
            aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
            aria-pressed={isFavorite}
          >
            <Heart className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" fill={isFavorite ? '#ef4444' : 'none'} />
          </button>
          
          {/* Best Seller Badge */}
          <div className="absolute top-2 right-2 z-10">
            <p className="text-[9px] sm:text-xs font-bold text-white bg-[#EC221F] px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
              الاكثر مبيعا
            </p>
          </div>

          {/* Image with scale effect on hover */}
          <div className="overflow-hidden rounded-t-lg">
            <Image
              src={currentImage}
              alt={name}
              width={340}
              height={340}
              className="object-cover w-full h-auto aspect-square transition-all duration-500 ease-out"
              style={{
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          </div>
        </div>

        {/* Product Info with slide up effect */}
        <div 
          className="px-2 sm:px-3 flex flex-col gap-0 mt-2 transition-all duration-500 ease-out"
          style={{
            transform: isHovered ? 'translateY(-4px)' : 'translateY(0px)',
          }}
        >
          {/* Rating Section */}
          <div className="flex gap-1 items-center mb-1 flex-wrap">
            <p className="text-[#77878F] text-[10px] sm:text-xs md:text-sm">(994)</p>
            <div className="flex gap-0.5">
              <FaRegStar className="text-[#77878F] w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4"/>
              <FaStar className="text-[#FA8232] w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
              <FaStar className="text-[#FA8232] w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
              <FaStar className="text-[#FA8232] w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
              <FaStar className="text-[#FA8232] w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
            </div>
          </div>
          
          {/* Product Name */}
          <h3 className="text-[11px] sm:text-[13px] md:text-[14px] font-medium line-clamp-2 mb-1" style={{ color: '#112B40' }}>
            {name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm sm:text-base md:text-[17px] font-semibold" >
              {price.toLocaleString()} <span className="text-[10px] sm:text-xs md:text-[12px] font-semibold">EGP</span>
            </span>
          </div>

          {/* Color Circles */}
          <div className="flex items-center justify-center gap-2 mt-1 mb-1">
            {colors.map((circle, index) => (
              <button
                key={index}
                className="w-4 h-4 rounded-full transition-all duration-200 hover:scale-110 hover:ring-2 hover:ring-offset-1"
                style={{ 
                  backgroundColor: circle.color,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
                aria-label={`لون ${circle.name}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log(`Selected color: ${circle.name}`);
                }}
              />
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}