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
    image: "/images/hero/hero1.png",
    title: "تجربة تقنية متكاملة",
    description: "منتجات أصلية من أشهر العلامات التجارية مع ضمان وجودة تستحقها اكتشف  عروض حصرية وتوصيل سريع.",
    buttonText: "تسوق الآن",
    buttonLink: "/",
  },
  {
    id: 2,
    image: "/images/hero/hero2.png",
    title: "تجربة تقنية متكاملة",
    description: "منتجات أصلية من أشهر العلامات التجارية مع ضمان وجودة تستحقها اكتشف  عروض حصرية وتوصيل سريع.",
    buttonText: "تسوق الآن",
    buttonLink: "/",
  },
  {
    id: 3,
    image: "/images/hero/hero1.png",
   title: "تجربة تقنية متكاملة",
    description: "منتجات أصلية من أشهر العلامات التجارية مع ضمان وجودة تستحقها اكتشف  عروض حصرية وتوصيل سريع.",
    buttonText: "تسوق الآن",
    buttonLink: "/",
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToNextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentSlide(index);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="relative w-full h-[70vh] overflow-hidden ">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Background Image */}
            <div className="relative w-full h-full">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                loading="eager"
                className="object-cover"
                priority={index === 0}
              />
              {/* Dark Overlay */}
              {/* <div className="absolute inset-0 bg-black/10" /> */}
            </div>

            {/* Content */}
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="container-custom  text-[#110322] gap-3">
                <h1 className="text-3xl md:text-5xl lg:text-[58px] font-bold mb-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
                  {slide.title}
                </h1>
                <p className="text-[#110322] mt-5 md:text-lg lg:text-[20px] mb-8 max-w-2xl  animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                  {slide.description}
                </p>
              <Button
              asChild
              className="animate-in text-white text-[16px] font-bold fade-in slide-in-from-bottom-5 duration-700 delay-200 rounded-xl"
              style={{ 
                backgroundColor: '#08B2A7',
                width: '177px',
                height: '56px'
              }}
            >
              <Link href={slide.buttonLink} className="flex items-center justify-center gap-2">
                {slide.buttonText}
                <FaArrowLeft  className="h-4 w-4" />
              </Link>
            </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevSlide}
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30  hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-300 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-8 w-8 text-white" />
      </button>

      <button
        onClick={goToNextSlide}
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30  hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-300 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="h-8 w-8 text-white" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? "w-8 h-2 bg-[#C092BD]"
                : "w-2 h-2 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

    
    </section>
  );
}