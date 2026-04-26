"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaArrowLeft } from "react-icons/fa";

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadedImages, setLoadedImages] = useState<{ [key: number]: boolean }>({});

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
    setImageLoaded(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setImageLoaded(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentSlide(index);
    setImageLoaded(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleImageLoad = (index: number) => {
    if (index === currentSlide) {
      setImageLoaded(true);
    }
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  };

  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100">
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
                loading="eager"
                className={`object-cover transition-opacity duration-500 ${
                  loadedImages[index] ? "opacity-100" : "opacity-0"
                }`}
                priority={index === 0}
                quality={100}
                sizes="100vw"
                onLoad={() => handleImageLoad(index)}
                style={{
                  objectPosition: "center center",
                }}
              />
            </div>

            {/* Content - Centered for mobile, right-aligned for larger screens */}
            <div className="absolute inset-0 z-20 flex items-center justify-center md:justify-start">
              <div className="container-custom px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-3xl mx-auto md:mx-0 text-center md:text-right">
                  {/* Title - smaller on mobile */}
                  <h1 className="text-xl sm:text-2xl md:text-5xl lg:text-[58px] font-bold mb-2 md:mb-4 animate-in fade-in slide-in-from-bottom-5 duration-700 drop-shadow-lg text-white">
                    {slide.title}
                  </h1>
                  
                  {/* Description - smaller on mobile */}
                  <p className="text-white mt-2 md:mt-5 text-xs sm:text-sm md:text-base lg:text-[20px] mb-4 md:mb-8 max-w-xl mx-auto md:mx-0 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100 leading-relaxed">
                    {slide.description}
                  </p>
                  
                  {/* Button - smaller on mobile */}
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