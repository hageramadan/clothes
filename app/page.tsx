// app/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AdsSection } from "@/components/home/AdsSection";
import { BestProducts } from "@/components/home/BestProducts";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { Hero } from "@/components/home/HeroCover";
import { LatestProducts } from "@/components/home/LatestProducts";
import { SectionProducts } from "@/components/home/SectionProducts";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState({
    hero: false,
    categories: false,
    latestProducts: false,
    // adsLight: false,
    bestProducts: false,
    // adsDark: false,
    sectionProducts: false,
  });

  // التحقق من تحميل كل البيانات
  useEffect(() => {
    const allLoaded = Object.values(dataLoaded).every(value => value === true);
    
    if (allLoaded) {
      console.log("✅ All components loaded!");
      // إضافة تأخير بسيط لإخفاء الـ Loading Screen بشكل سلس
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [dataLoaded]);

  // دوال لتحديث حالة تحميل كل كمبوننت
  const handleHeroLoad = useCallback(() => {
    setDataLoaded(prev => ({ ...prev, hero: true }));
  }, []);

  const handleCategoriesLoad = useCallback(() => {
    setDataLoaded(prev => ({ ...prev, categories: true }));
  }, []);

  const handleLatestProductsLoad = useCallback(() => {
    setDataLoaded(prev => ({ ...prev, latestProducts: true }));
  }, []);

  const handleAdsLightLoad = useCallback(() => {
    setDataLoaded(prev => ({ ...prev, adsLight: true }));
  }, []);

  const handleBestProductsLoad = useCallback(() => {
    setDataLoaded(prev => ({ ...prev, bestProducts: true }));
  }, []);

  const handleAdsDarkLoad = useCallback(() => {
    setDataLoaded(prev => ({ ...prev, adsDark: true }));
  }, []);

  const handleSectionProductsLoad = useCallback(() => {
    setDataLoaded(prev => ({ ...prev, sectionProducts: true }));
  }, []);

  return (
    <>
      {/* Loading Screen */}
      {isLoading && <LoadingScreen />}
      
      {/* Main Content - يظهر بعد انتهاء التحميل */}
      <div className={isLoading ? "opacity-0" : "opacity-100 transition-opacity duration-500"}>
        <Hero onLoad={handleHeroLoad} />
        <CategoriesSection onLoad={handleCategoriesLoad} />
        <LatestProducts onLoad={handleLatestProductsLoad} />
        <AdsSection variant="light" onLoad={handleAdsLightLoad} />
        <BestProducts onLoad={handleBestProductsLoad} />
        <AdsSection variant="dark" onLoad={handleAdsDarkLoad} />
        <SectionProducts onLoad={handleSectionProductsLoad} />
      </div>
    </>
  );
}