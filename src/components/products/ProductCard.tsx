// src/components/products/ProductCard.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { FaRegStar } from "react-icons/fa";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
  colors?: ColorOption[];
  rating?: number;
  reviewsCount?: number;
  isBestSeller?: boolean;
}

// ❌ تم إزالة DEFAULT_COLORS تماماً

export function ProductCard({ 
  id, 
  name, 
  price, 
  image, 
  hoverImage,
  href,
  originalPrice,
  discount,
  colors,
  rating = 0,
  reviewsCount = 0,
  isBestSeller = false,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImage, setCurrentImage] = useState(image);
  const [isLocalMutating, setIsLocalMutating] = useState(false);
  
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  // الحصول على الحالة الحالية من الـ Context
  const isProductFavorite = isFavorite(id);
  const [localFavorite, setLocalFavorite] = useState(isProductFavorite);

  // مزامنة الحالة المحلية مع الـ Context
  useEffect(() => {
    setLocalFavorite(isProductFavorite);
  }, [isProductFavorite]);

  // ✅ استخدام ألوان المنتج فقط (بدون ألوان افتراضية)
  const displayColors = colors && colors.length > 0 ? colors : [];

  // معالج الضغط على القلب مع التحقق من تسجيل الدخول
  const handleFavoriteClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 🚨 التحقق من حالة المصادقة أولاً
    if (!isAuthenticated) {
      // عرض رسالة توست للمستخدم
      toast.error("يرجى تسجيل الدخول أولاً لإضافة المنتجات إلى المفضلة", {
        duration: 3000,
        position: "top-center",
        icon: "❤️",
      });
      
      return;
    }
    
    // ✅ باقي الكود - المستخدم مسجل دخول
    // منع الضغط المتكرر على نفس المنتج
    if (isLocalMutating || isLoading) return;
    
    // تفعيل حالة التحميل لهذا المنتج فقط
    setIsLocalMutating(true);
    
    // حفظ الحالة القديمة
    const previousState = localFavorite;
    
    // تحديث الواجهة فوراً (لإعطاء استجابة سريعة للمستخدم)
    setLocalFavorite(!previousState);
    
    
    // استدعاء API - تمرير الحالة الحالية
    const success = await toggleFavorite(id, previousState);
    
    if (!success) {
      // إذا فشلت العملية، نرجع الحالة القديمة
      setLocalFavorite(previousState);
      toast.error("حدث خطأ، يرجى المحاولة مرة أخرى");
    } else {
    }
    
    // إلغاء حالة التحميل لهذا المنتج
    setIsLocalMutating(false);
  }, [id, localFavorite, isLocalMutating, isLoading, toggleFavorite, isAuthenticated]);

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

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-[#FA8232] w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-[#FA8232] w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-[#77878F] w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />);
      }
    }
    return stars;
  };

  return (
    <div
      role="article"
      aria-labelledby={`product-name-${id}`}
      className="group relative bg-white transition-all duration-500 ease-out hover:shadow-2xl"
      style={{
        width: '100%',
        maxWidth: '308px',
        height: '402px',
        borderRadius: '16px',
        border: '1px solid #E4E7E9',
        overflow: 'hidden',
        transform: isHovered ? 'translateY(-12px)' : 'translateY(0px)',
        transition: 'transform 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), box-shadow 0.4s ease',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={href} className="block h-full" aria-label={`عرض تفاصيل ${name}`}>
        <div className="relative w-full" style={{ height: 'calc(100% - 120px)' }}>
          <button
            onClick={handleFavoriteClick}
            disabled={isLocalMutating || isLoading}
            className="absolute top-2 left-2 z-10 rounded-full p-1.5 bg-white/80 hover:bg-red-50 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={localFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
            aria-pressed={localFavorite}
          >
            {isLocalMutating ? (
              <div className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-gray-300 border-t-red-500" />
            ) : (
              <Heart 
                className="h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200" 
                style={{ 
                  color: localFavorite ? '#ef4444' : '#112B40',
                  fill: localFavorite ? '#ef4444' : 'none'
                }} 
              />
            )}
          </button>
          
          {isBestSeller && (
            <div className="absolute top-2 right-2 z-10">
              <p className="text-[9px] sm:text-xs font-bold text-white bg-[#EC221F] px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                الاكثر طلبا
              </p>
            </div>
          )}

          {discount && discount > 0 && (
            <div className="absolute bottom-2 right-2 z-10">
              <p className="text-[9px] sm:text-xs font-bold text-white bg-[#23856D] px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                خصم {discount}%
              </p>
            </div>
          )}

          <div className="overflow-hidden rounded-t-lg w-full h-full">
            <Image
              src={currentImage}
              alt={name}
              width={308}
              height={308}
              className="object-cover w-full h-full transition-all duration-500 ease-out"
              style={{
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              }}
              priority={false}
            />
          </div>
        </div>

        <div className="px-3 py-2 flex flex-col" style={{ height: '120px' }}>
          <div className="flex gap-1 items-center mb-1 flex-wrap">
            <p className="text-[#77878F] text-[10px] sm:text-xs">
              ({reviewsCount > 0 ? reviewsCount : 0})
            </p>
            <div className="flex gap-0.5">
              {renderStars()}
            </div>
          </div>
          
          <h3 className="text-[11px] sm:text-[13px] font-medium line-clamp-2 mb-1" style={{ color: '#112B40' }}>
            {name}
          </h3>

          <div className="flex items-center gap-2 mb-2">
            {originalPrice && originalPrice > price ? (
              <>
                <span className="text-sm sm:text-base font-semibold ">
                  {price.toLocaleString()} <span className="text-[10px] sm:text-xs font-semibold">EGP</span>
                </span>
                <span className="text-xs sm:text-sm line-through text-gray-400">
                  {originalPrice.toLocaleString()} EGP
                </span>
              </>
            ) : (
              <span className="text-sm sm:text-base font-semibold">
                {price.toLocaleString()} <span className="text-[10px] sm:text-xs font-semibold">EGP</span>
              </span>
            )}
          </div>

          {/* ✅ عرض الألوان فقط إذا كانت موجودة */}
          {displayColors.length > 0 && (
            <div className="flex items-center justify-center gap-2">
              {displayColors.map((circle, index) => (
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
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </Link>

      <style jsx>{`
        @media (max-width: 640px) {
          .group {
            max-width: 172px !important;
            height: 278px !important;
          }
        }
      `}</style>
    </div>
  );
}