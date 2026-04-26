"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: number;
  image: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: "/images/hero/hero1.jpg",
    title: "حيث تلتقي الأناقة بالثقة",
    description: 'اكتشف مجموعة مختارة بعناية تجمع بين الراحة والجودة لتناسب جميع مناسباتك.',
    buttonText: "تسوق الآن",
    buttonLink: "/",
  },
  {
    id: 2,
    image: "/images/hero/hero2.jpg",
    title: "حيث تلتقي الأناقة بالثقة",
    description: 'اكتشف مجموعة مختارة بعناية تجمع بين الراحة والجودة لتناسب جميع مناسباتك.',
    buttonText: "تسوق الآن",
    buttonLink: "/",
  },
  {
    id: 3,
    image: "/images/hero/hero1.jpg",
    title: "حيث تلتقي الأناقة بالثقة",
    description: 'اكتشف مجموعة مختارة بعناية تجمع بين الراحة والجودة لتناسب جميع مناسباتك.',
    buttonText: "تسوق الآن",
    buttonLink: "/",
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loadedImages, setLoadedImages] = useState<{ [key: number]: boolean }>({});
  
  // Touch swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  
  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToNextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentSlide(index);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  };

  // Touch event handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    // Pause auto-play while touching
    setIsAutoPlaying(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsAutoPlaying(true);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      // Swipe left -> next slide
      goToNextSlide();
    } else if (isRightSwipe) {
      // Swipe right -> previous slide
      goToPrevSlide();
    }
    
    // Reset touch values
    setTouchStart(null);
    setTouchEnd(null);
    
    // Resume auto-play after swipe
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Preload adjacent images for smoother transitions
  useEffect(() => {
    const nextIndex = (currentSlide + 1) % slides.length;
    const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    
    [nextIndex, prevIndex].forEach(index => {
      if (!loadedImages[index]) {
        const img = document.createElement('img');
        img.src = slides[index].image;
        img.onload = () => handleImageLoad(index);
      }
    });
  }, [currentSlide, loadedImages]);

  return (
    <section 
      ref={sectionRef}
      className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div className="relative w-full h-full">
              {!loadedImages[index] && index === currentSlide && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse z-5" />
              )}
              
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                loading={index === 0 ? "eager" : "lazy"}
                className={`object-cover transition-opacity duration-500 ${
                  loadedImages[index] ? "opacity-100" : "opacity-0"
                }`}
                quality={100}
                sizes="100vw"
                onLoad={() => handleImageLoad(index)}
                style={{
                  objectPosition: "center center",
                }}
              />
            </div>

            {/* Content */}
            <div className="absolute inset-0 z-20 flex items-center justify-center md:justify-start pointer-events-none">
              <div className="container-custom px-4 sm:px-6 lg:px-8 w-full pointer-events-auto">
                <div className="max-w-3xl mx-auto md:mx-0 text-center md:text-right">
                  <h1 className="text-xl sm:text-2xl md:text-5xl lg:text-[58px] font-bold mb-2 md:mb-4 animate-in fade-in slide-in-from-bottom-5 duration-700 drop-shadow-lg text-white">
                    {slide.title}
                  </h1>
                  
                  <p className="text-white mt-2 md:mt-5 text-xs sm:text-sm md:text-base lg:text-[20px] mb-4 md:mb-8 max-w-xl mx-auto md:mx-0 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100 leading-relaxed">
                    {slide.description}
                  </p>
                  
                  <Button
                    asChild
                    className="animate-in text-white text-[12px] sm:text-[14px] md:text-[16px] font-bold fade-in slide-in-from-bottom-5 duration-700 delay-200 rounded-xl hover:scale-105 transition-all shadow-lg mx-auto md:mx-0"
                    style={{ 
                      backgroundColor: '#EC221F',
                      width: '130px',
                      height: '40px',
                    }}
                  >
                    <Link href={slide.buttonLink} className="flex items-center justify-center gap-2">
                      {slide.buttonText}
                      <FaArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons - Hidden on mobile, visible on desktop */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 hidden md:block"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={goToNextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 hidden md:block"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Swipe Indicator for Mobile */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 md:hidden pointer-events-none opacity-0 animate-pulse">
        <div className="flex gap-4 text-white/50">
          <ChevronRight className="h-8 w-8" />
          <ChevronLeft className="h-8 w-8" />
        </div>
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? "w-8 h-2 bg-[#EC221F]"
                : "w-2 h-2 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}