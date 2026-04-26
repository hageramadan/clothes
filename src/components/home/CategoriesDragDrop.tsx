"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FaArrowRightLong } from "react-icons/fa6";

interface Category {
  id: string;
  name: string;
  image: string;
  href: string;
}

const initialCategories: Category[] = [
  {
    id: "1",
    name: "هواتف ذكية",
    image: "/images/categories/cate1.png",
    href: "/",
  },
  {
    id: "2",
    name: "لابتوب & كمبيوتر",
    image: "/images/categories/cat2.png",
    href: "/",
  },
  {
    id: "3",
    name: "اكسسوارات",
    image: "/images/categories/cate3.jpg",
    href: "/",
  },
  {
    id: "4",
    name: "سماعات",
    image: "/images/categories/cate4.png",
    href: "/",
  },
  {
    id: "5",
    name: "هواتف ذكية",
    image: "/images/categories/cate1.png",
    href: "/",
  },
  {
    id: "6",
    name: "لابتوب & كمبيوتر",
    image: "/images/categories/cat2.png",
    href: "/",
  },
  {
    id: "7",
    name: "اكسسوارات",
    image: "/images/categories/cate3.jpg",
    href: "/",
  },
  {
    id: "8",
    name: "سماعات",
    image: "/images/categories/cate4.png",
    href: "/",
  },
];

export function CategoriesDragDrop() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // محاكاة تحميل التصنيفات
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // دوال السحب
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX);
    setScrollStart(sliderRef.current.scrollLeft);
    sliderRef.current.style.cursor = 'grabbing';
    sliderRef.current.style.userSelect = 'none';
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
    setScrollStart(sliderRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollStart - walk;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const x = e.touches[0].pageX;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollStart - walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
      sliderRef.current.style.userSelect = 'auto';
    }
  };

  // دوال أزرار التحريك
  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = direction === 'left' ? -300 : 300;
    sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // عرض السبينر أثناء التحميل
  if (isLoading) {
    return (
      <section className="py-2 md:py-12">
        <div className="container-custom px-4 sm:px-6">
          <div className="flex justify-center items-center min-h-[200px] md:min-h-[300px]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-10 h-10 md:w-12 md:h-12 border-4 border-[#EC221F] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-500 text-xs md:text-sm animate-pulse">
                جاري تحميل التصنيفات...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-2 md:py-12">
      <div className="container-custom px-4 sm:px-6 relative">
        
        {/* زر السهم الأيمن */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#EC221F] rounded-full shadow-lg p-2 md:p-3 hover:bg-[#1f98df] transition-all duration-300 hidden md:block"
          style={{ 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transform: 'translateX(50%) translateY(-50%)'
          }}
          aria-label="التمرير لليسار"
        >
          <FaArrowRightLong className="text-white"/>
        </button>

        {/* زر السهم الأيسر */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#EC221F] rounded-full shadow-lg p-2 md:p-3 hover:bg-[#1f98df] transition-all duration-300 hidden md:block"
          style={{ 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transform: 'translateX(-50%) translateY(-50%)'
          }}
          aria-label="التمرير لليمين"
        >
          <FaArrowLeftLong className="text-white" />
        </button>

        {/* حاوية السحب الأفقية */}
        <div 
          ref={sliderRef}
          className="overflow-x-auto md:h-[236px] h-[100px] pt-12 hide-scrollbar"
          style={{ 
            width: '100%',
            overflowY: 'hidden',
            cursor: 'grab',
            WebkitOverflowScrolling: 'touch',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleDragEnd}
        >
          <div className="flex gap-2 md:gap-[26px] justify-start items-center h-full">
            {initialCategories.map((category, index) => (
              <div
                key={category.id}
                className="flex-shrink-0 flex items-center group transition-all duration-300 hover:-translate-y-2"
              >
                <Link href="#">
                  <div className="flex items-center flex-col transition-all w-[85px] md:w-[220px] duration-300 cursor-pointer pb-7">
                    <div 
                      className="relative bg-gray-100 flex items-center justify-center overflow-hidden rounded-full h-[64px] md:h-[196px] w-[64px] md:w-[196px] transition-transform duration-300"
                    >
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={148}
                        height={148}
                        className="object-contain transition-transform duration-500 w-[32px] h-[32px] md:w-[148px] md:h-[148px]"
                        sizes="148px"
                        // حل مشكلة LCP: تحميل أول 4 صور بشكل فوري
                        loading={index < 4 ? "eager" : "lazy"}
                        // تحسين LCP: إعطاء أولوية عالية للصورة الأولى
                        fetchPriority={index === 0 ? "high" : "auto"}
                      />
                    </div>
                    <div className="text-center mt-2 pb-2 w-full">
                      <h3 
                        className="text-[10px] sm:text-[16px] whitespace-nowrap"
                        style={{ color: '#112B40' }}
                      >
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}