// components/home/AdsSection.tsx

'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'
import Image from 'next/image'
import { getAds, AdData } from '@/services/api'

// ✅ 1. إضافة Interface مع onLoad
interface AdsSectionProps {
  variant?: 'dark' | 'light';
  onLoad?: () => void;
}

// استخراج نسبة الخصم من النص (مثال: "خصم 32%" -> 32)
const extractDiscount = (text: string): number | null => {
  const match = text.match(/(\d+)%/);
  return match ? parseInt(match[1]) : null;
};

// ✅ 2. دالة للتحقق من انتهاء العرض
const isOfferExpired = (endDate: string | null | undefined): boolean => {
  if (!endDate) return false;
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  return now > end;
};

// ✅ 3. دالة لتنسيق التاريخ
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return '';
  }
};

// حساب الوقت المتبقي من تاريخ الانتهاء
const calculateTimeLeft = (endDate?: string) => {
  if (endDate) {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const difference = end - now;
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    }
  }
  
  return {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };
};

export function AdsSection({ variant = 'dark', onLoad }: AdsSectionProps) {
  const [ads, setAds] = useState<AdData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  
  const isMounted = useRef(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // بيانات افتراضية
  const getDefaultAds = (): AdData[] => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    
    return [
      {
        id: 1,
        sub_title: null,
        name: "لفتره محدودة خصم 32%",
        description: "Lorem ipsum dolor sit amet consectetur.",
        link: null,
        image: "/images/sale.png",
        is_active: 1,
        created_at: "",
        updated_at: "",
        end_date: futureDate.toISOString().split('T')[0],
        start_date: new Date().toISOString().split('T')[0],
        type: "خصم",
        type_label: "discount"
      },
      {
        id: 2,
        sub_title: null,
        name: "خصومات خصم50%",
        description: "Lorem ipsum dolor sit amet consectetur. Massa libero massa morbi condimentum tellus.",
        link: null,
        image: "/images/sale1.png",
        is_active: 1,
        created_at: "",
        updated_at: "",
        end_date: futureDate.toISOString().split('T')[0],
        start_date: new Date().toISOString().split('T')[0],
        type: "عادي",
        type_label: "normal"
      }
    ];
  };

  // استدعاء onLoad بعد التحميل
  useEffect(() => {
    if (!loading && !isDataLoaded && onLoad) {
      setIsDataLoaded(true);
      setTimeout(() => {
        onLoad();
      }, 0);
    }
  }, [loading, isDataLoaded, onLoad]);

  // استدعاء onLoad في حالة عدم وجود إعلانات
  useEffect(() => {
    if (!loading && ads.length === 0 && !isDataLoaded && onLoad) {
      setIsDataLoaded(true);
      setTimeout(() => {
        onLoad();
      }, 0);
    }
  }, [loading, ads.length, isDataLoaded, onLoad]);

  // استدعاء onLoad في حالة انتهاء العرض
  useEffect(() => {
    if (!loading && isExpired && !isDataLoaded && onLoad) {
      setIsDataLoaded(true);
      setTimeout(() => {
        onLoad();
      }, 0);
    }
  }, [loading, isExpired, isDataLoaded, onLoad]);

  // جلب الإعلانات من API
  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ getAds ترجع AdData[] مباشرة
      const adsData = await getAds();
      
      if (!isMounted.current) return;
      
      // ✅ adsData هي مصفوفة من الإعلانات النشطة بالفعل
      if (adsData.length === 0) {
        setAds(getDefaultAds());
      } else {
        setAds(adsData);
      }
    } catch (err) {
      console.error('Error fetching ads:', err);
      if (!isMounted.current) return;
      setError('فشل في تحميل الإعلانات');
      setAds(getDefaultAds());
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    const timeoutId = setTimeout(() => {
      fetchAds();
    }, 0);
    
    return () => {
      isMounted.current = false;
      clearTimeout(timeoutId);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [fetchAds]);

  // تحديث المؤقت عند تغيير الإعلانات أو تاريخ الانتهاء
  useEffect(() => {
    const currentAd = ads[variant === 'dark' ? 0 : 1];
    
    if (!currentAd) {
      setIsExpired(true);
      return;
    }
    
    // ✅ التحقق من انتهاء العرض
    const expired = isOfferExpired(currentAd.end_date);
    setIsExpired(expired);
    
    if (expired) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }
    
    // حساب الوقت المتبقي
    const newTimeLeft = calculateTimeLeft(currentAd.end_date);
    setTimeLeft(newTimeLeft);

    // تنظيف المؤقت القديم
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // تشغيل المؤقت الجديد
    timerRef.current = setInterval(() => {
      const currentAd = ads[variant === 'dark' ? 0 : 1];
      if (!currentAd) {
        clearInterval(timerRef.current!);
        return;
      }
      
      const newTime = calculateTimeLeft(currentAd.end_date);
      setTimeLeft(newTime);
      
      // ✅ التحقق من انتهاء العرض أثناء التحديث
      if (isOfferExpired(currentAd.end_date)) {
        setIsExpired(true);
        clearInterval(timerRef.current!);
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [ads, variant]);

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  const currentAd = ads[variant === 'dark' ? 0 : 1];
  const discount = currentAd ? extractDiscount(currentAd.name) : 32;
  const imageUrl = currentAd?.image 
    ? (currentAd.image.startsWith('http') 
        ? currentAd.image 
        : `https://fashion.admin.t-carts.com${currentAd.image}`)
    : (variant === 'dark' ? '/images/sale.png' : '/images/sale1.png');
  
  // ✅ تنسيق التاريخ للعرض
  const formattedEndDate = formatDate(currentAd?.end_date);
  
  // التحقق من وجود وقت متبقي
  const hasTimer = timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0;

  // ✅ إذا انتهى العرض أو لا يوجد إعلان، لا تعرض شيئاً
  if (isExpired || !currentAd) {
    return null;
  }

  if (loading) {
    return (
      <section className={`overflow-hidden ${variant === 'dark' ? 'bg-[#141718]' : 'bg-gradient-to-r from-[#FFF5F4] to-[#FFE8E6]'}`}>
        <div className="flex justify-center items-center min-h-[200px] md:min-h-[300px]">
          <div className="relative">
            <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-8 h-8 md:w-12 md:h-12 border-4 border-[#EC221F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'dark') {
    // الإعلان الأول (الخلفية الداكنة)
    return (
      <section className="bg-[#141718] overflow-hidden">
        <div className="flex flex-row items-center justify-between gap-2 md:gap-10">
          {/* Left Content */}
          <div className="flex px-3 py-4 sm:ps-[2%] md:ps-[4%] lg:ps-[10%] xl:ps-[13%] mx-auto flex-col gap-1 md:gap-[22px] w-1/2 order-1">
            <p className="text-[8px] md:text-right md:text-[16px] font-semibold py-0.5 px-1.5 md:px-3 text-[#BE4646] text-center md:text-right">
              لفتره محدودة
            </p>
            
            <div className="flex items-center gap-2 md:gap-3 md:justify-start justify-center">
              <p className="text-[12px] md:text-[32px] font-bold py-0.5 px-1.5 md:px-3 text-[#FFF5F4] w-fit rounded-md text-center">
                خصم {discount}%
              </p>
            </div>
            
            <p className="text-[8px] text-center md:text-right md:text-[22px] text-[#FFF5F4] w-full md:w-[80%] leading-[1.3] md:leading-[1.5]">
              {currentAd?.description || "Lorem ipsum dolor sit amet consectetur."}
            </p>
            
            {/* ✅ عرض تاريخ الانتهاء في النسخة الداكنة */}
            {formattedEndDate && (
              <p className="text-[8px] text-center md:text-right text-gray-400">
                صالحة حتى: {formattedEndDate}
              </p>
            )}
            
            {/* ✅ Countdown Timer - يظهر فقط إذا لم ينته العرض */}
            {hasTimer && !isExpired && (
              <div className="mt-1 md:mt-4">
                <p className="text-[6px] text-center md:text-right md:text-base text-gray-300 mb-1 md:mb-3">سينتهي الخصم خلال</p>
                <div className="flex justify-center md:justify-end gap-1.5 md:gap-5" dir='ltr'>
                  <div className="text-center">
                    <div className="bg-white text-[#191C1F] rounded-[8px] px-1 py-0.5 md:px-4 md:py-2 min-w-[35px] md:min-w-[70px]">
                      <span className="text-[10px] md:text-3xl font-bold">{formatNumber(timeLeft.days)}</span>
                    </div>
                    <p className="text-[6px] md:text-xs text-gray-500 mt-0.5 md:mt-1">أيام</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white text-[#191C1F] rounded-[8px] px-1 py-0.5 md:px-4 md:py-2 min-w-[35px] md:min-w-[70px]">
                      <span className="text-[10px] md:text-3xl font-bold">{formatNumber(timeLeft.hours)}</span>
                    </div>
                    <p className="text-[6px] md:text-xs text-gray-500 mt-0.5 md:mt-1">ساعات</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white text-[#191C1F] rounded-[8px] px-1 py-0.5 md:px-4 md:py-2 min-w-[35px] md:min-w-[70px]">
                      <span className="text-[10px] md:text-3xl font-bold">{formatNumber(timeLeft.minutes)}</span>
                    </div>
                    <p className="text-[6px] md:text-xs text-gray-500 mt-0.5 md:mt-1">دقائق</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white text-[#191C1F] rounded-[8px] px-1 py-0.5 md:px-4 md:py-2 min-w-[35px] md:min-w-[70px]">
                      <span className="text-[10px] md:text-3xl font-bold">{formatNumber(timeLeft.seconds)}</span>
                    </div>
                    <p className="text-[6px] md:text-xs text-gray-500 mt-0.5 md:mt-1">ثواني</p>
                  </div>
                </div>
              </div>
            )}
            
            <Button
              asChild
              aria-label='buy now'
              className="w-full md:w-[180px] md:h-[60px] animate-in text-[8px] md:text-[16px] font-bold fade-in slide-in-from-bottom-5 duration-700 delay-200 rounded-xl mt-1 md:mt-4"
              style={{ backgroundColor: '#EC221F' }}
            >
              <Link href={currentAd?.link || "/products"} className="flex items-center justify-center gap-1 md:gap-2 text-white">
                تسوق الان
                <FaArrowLeft className="h-2 w-2 md:h-4 md:w-4" />
              </Link>
            </Button>
          </div>
          
          {/* Right Image */}
          <div className="w-1/2 md:w-1/2 md:ps-30 order-2">
            <Image 
              src={imageUrl} 
              alt="Advertisement" 
              className="w-full h-auto md:w-[100%] md:h-[532px] object-cover" 
              width={500} 
              height={300} 
              style={{ objectPosition: 'center 0%' }}
              priority
            />
          </div>
        </div>
      </section>
    );
  }

  // الإعلان الثاني (الخلفية الفاتحة)
  return (
    <section className="bg-gradient-to-r from-[#FFF5F4] to-[#FFE8E6] overflow-hidden py-0">
      <div className="container mx-auto px-2 sm:px-6 lg:px-8 py-0">
        <div className="flex flex-row items-center justify-between gap-2 md:gap-8">
          {/* Right Image */}
          <div className="w-1/2 md:w-1/2 flex justify-center md:justify-end my-0 py-0">
            <div className="relative w-full max-w-[140px] md:max-w-full my-0 py-0">
              <Image 
                src={imageUrl} 
                alt="Advertisement" 
                className="w-full h-auto object-contain my-0 py-0"
                width={600} 
                height={600} 
                quality={100}
                priority
                sizes="(max-width: 768px) 50vw, 50vw"
                style={{ 
                  objectPosition: 'center',
                  filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.1))',
                }}
              />
            </div>
          </div>

          {/* Left Content */}
          <div className="w-1/2 md:w-1/2 text-center md:text-right pt-2 md:pt-0">
            <div className="max-w-xl mx-auto md:mx-0">
              <div className="inline-block">
                <p className="text-[8px] md:text-[16px] font-semibold px-1.5 py-0.5 md:px-4 md:py-1.5 bg-[#EC221F]/10 text-[#EC221F] rounded-full inline-block">
                  لفترة محدودة
                </p>
              </div>
              
              <div className="mt-1 md:mt-6">
                <p className="text-[14px] md:text-[48px] font-bold text-[#EC221F]">
                  خصم {discount}%
                </p>
                <div className="w-10 md:w-20 h-0.5 md:h-1 bg-[#EC221F] rounded-full mt-0.5 md:mt-2 mx-auto md:mx-0"></div>
              </div>
              
              <p className="text-[#4A5568] text-[7px] md:text-[20px] mt-1 md:mt-6 leading-tight md:leading-relaxed">
                {currentAd?.description || "Lorem ipsum dolor sit amet consectetur"}
              </p>
              
              {/* ✅ عرض تاريخ الانتهاء في النسخة الفاتحة */}
              {formattedEndDate && (
                <p className="text-[8px] md:text-sm text-gray-500 mt-1 md:mt-2">
                  صالحة حتى: {formattedEndDate}
                </p>
              )}
              
              <Button
                asChild
                aria-label='buy now'
                className="rounded-xl mt-2 md:mt-8 w-full sm:w-auto px-3 md:px-10 mb-2 md:mb-0 py-1 md:py-6 text-[8px] md:text-[18px] font-bold hover:scale-105 transition-all duration-300 shadow-lg"
                style={{ backgroundColor: '#EC221F' }}
              >
                <Link href={currentAd?.link || "/products"} className="flex items-center justify-center gap-1 md:gap-2 text-white">
                  تسوق الان
                  <FaArrowLeft className="h-2 w-2 md:h-5 md:w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}