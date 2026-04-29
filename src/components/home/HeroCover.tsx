"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSliders } from "@/services/api";

interface Slide {
  id: number;
  image: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

// ✅ تعريف الدالة أولاً قبل استخدامها
const getDefaultSlides = (): Slide[] => {
  return [
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
};

export function Hero() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loadedImages, setLoadedImages] = useState<{ [key: number]: boolean }>({});
  
  // Touch swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  
  const minSwipeDistance = 50;

  // Fetch sliders from API
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        setLoading(true);
        const slidersData = await getSliders();
        
        // Transform API data to match our Slide interface
        const transformedSlides: Slide[] = slidersData.map(slider => ({
          id: slider.id,
          // Build full image URL
          image: `https://dukanah.admin.t-carts.com${slider.image}`,
          title: slider.name,
          description: slider.description,
          buttonText: "تسوق الآن",
          buttonLink: slider.link || "/",
        }));
        
        setSlides(transformedSlides);
        
        // If no slides from API, use default fallback
        if (transformedSlides.length === 0) {
          setSlides(getDefaultSlides());
        }
      } catch (err) {
        console.error('Error loading sliders:', err);
        setError('فشل في تحميل البيانات');
        // Use default slides as fallback
        setSlides(getDefaultSlides());
      } finally {
        setLoading(false);
      }
    };
    
    fetchSliders();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToNextSlide = () => {
    if (slides.length === 0) return;
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevSlide = () => {
    if (slides.length === 0) return;
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
      goToNextSlide();
    } else if (isRightSwipe) {
      goToPrevSlide();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Preload adjacent images
  useEffect(() => {
    if (slides.length === 0) return;
    
    const nextIndex = (currentSlide + 1) % slides.length;
    const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    
    [nextIndex, prevIndex].forEach(index => {
      if (!loadedImages[index] && slides[index]) {
        const img = document.createElement('img');
        img.src = slides[index].image;
        img.onload = () => handleImageLoad(index);
      }
    });
  }, [currentSlide, loadedImages, slides]);

  // Show loading state
  if (loading) {
    return (
      <section className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] text-[#EC221F]"></div>
          <p className="mt-4 text-gray-600">جاري تحميل اسليدر...</p>
        </div>
      </section>
    );
  }

  // Show error state but with slides if available
  if (error && slides.length === 0) {
    return (
      <section className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">عذراً، حدث خطأ في تحميل اسليدر</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#EC221F] text-white rounded-lg hover:bg-[#d11d1a] transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return null;
  }

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
                priority={index === 0}
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

      {/* Navigation Buttons */}
      {slides.length > 1 && (
        <>
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
        </>
      )}
    </section>
  );
}