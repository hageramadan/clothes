// src/components/home/SectionProducts.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ProductCard } from "../products/ProductCard";
import { 
  getActiveSections,
  getSectionById,
  getSectionByName,
  SectionData,
   
} from "@/services/api";

// واجهات البيانات
interface VariantAttribute {
  id: number;
  attribute_type: {
    id: number;
    name: string;
  };
  value: string;
  meta: {
    color?: string;
  } | null;
}

interface ProductVariant {
  id: number;
  sku: string | null;
  price: number;
  has_discount: boolean;
  discount_type: string | null;
  discount_value: number | null;
  price_after_discount: number;
  quantity: number | null;
  is_active: boolean;
  variant_image: string | null;
  attributes: VariantAttribute[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  hoverImage?: string;
  href: string;
  originalPrice?: number;
  discount?: number;
  colors?: Array<{ color: string; name: string }>;
  rating?: number;
  reviewsCount?: number;
  isBestSeller?: boolean;
}

interface Section {
  id: number;
  name: string;
  is_active: boolean;
  products: Product[];
}

// دالة استخراج الألوان من الـ variants
const extractColorsFromVariants = (variants: ProductVariant[]): Array<{ color: string; name: string }> => {
  const colorMap = new Map<string, string>();
  
  if (!variants || variants.length === 0) return [];
  
  variants.forEach((variant) => {
    if (variant.attributes && Array.isArray(variant.attributes)) {
      variant.attributes.forEach((attr: VariantAttribute) => {
        if (attr.attribute_type?.name === "اللون" && attr.value && attr.meta?.color) {
          if (!colorMap.has(attr.value)) {
            colorMap.set(attr.value, attr.meta.color);
          }
        }
      });
    }
  });
  
  return Array.from(colorMap.entries()).map(([name, color]) => ({
    name: name,
    color: color
  }));
};

// تحويل البيانات من API إلى شكل المنتج المطلوب
const transformProduct = (product: any): Product => {
  const cleanImageUrl = (url: string) => {
    if (!url) return "/images/placeholder.jpg";
    if (url.startsWith('/storage')) {
      return `https://dukanah.admin.t-carts.com${url}`;
    }
    return `https://dukanah.admin.t-carts.com${url}`;
  };
  
  const mainImage = product.images && product.images.length > 0 
    ? cleanImageUrl(product.images[0])
    : "/images/placeholder.jpg";
    
  const hoverImage = product.images && product.images.length > 1 
    ? cleanImageUrl(product.images[1])
    : mainImage;

  let discount: number | undefined;
  let originalPrice: number | undefined;
  
  if (product.pricing?.has_discount && product.pricing?.price_after_discount) {
    discount = Math.round(((product.pricing.price - product.pricing.price_after_discount) / product.pricing.price) * 100);
    originalPrice = product.pricing.price;
  }

  let colors: Array<{ color: string; name: string }> = [];
  
  if (product.has_variants && product.variants && product.variants.length > 0) {
    colors = extractColorsFromVariants(product.variants as ProductVariant[]);
  }

  return {
    id: product.id.toString(),
    name: product.name,
    price: product.pricing?.final_price || product.pricing?.price || 0,
    image: mainImage,
    hoverImage: hoverImage,
    href: `/product/${product.id}`,
    originalPrice: originalPrice,
    discount: discount,
    colors: colors,
    rating: product.avg_rating || 0,
    reviewsCount: product.total_reviews || 0,
    isBestSeller: product.is_active,
  };
};

interface SectionProductsProps {
  sectionId?: number;
  sectionName?: string;
  showAllSections?: boolean;
  initialDisplayCount?: number;
}

export function SectionProducts({ 
  sectionId, 
  sectionName, 
  showAllSections = false,
  initialDisplayCount = 8 
}: SectionProductsProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(initialDisplayCount);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const fetchSections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let sectionsData: SectionData[] = [];
      
      // جلب البيانات حسب المعايير المطلوبة
      if (sectionId) {
        const section = await getSectionById(sectionId);
        if (section) {
          sectionsData = [section];
        }
      } else if (sectionName) {
        const section = await getSectionByName(sectionName);
        if (section) {
          sectionsData = [section];
        }
      } else if (showAllSections) {
        // جلب جميع الأقسام
        const response = await fetch('https://dukanah.admin.t-carts.com/api/sections', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        sectionsData = result.data.sections || [];
      } else {
        // جلب الأقسام النشطة فقط
        sectionsData = await getActiveSections();
      }
      
      if (!isMounted.current) return;
      
      // تحويل البيانات
      const transformedSections = sectionsData.map((section: SectionData) => ({
        id: section.id,
        name: section.name,
        is_active: section.is_active,
        products: (section.products || []).map(transformProduct)
      }));
      
      setSections(transformedSections);
      
    } catch (err) {
      console.error('Error fetching sections:', err);
      if (!isMounted.current) return;
      setError('فشل في تحميل الأقسام');
      setSections([]);
    } finally {
      if (!isMounted.current) return;
      setIsLoading(false);
    }
  }, [sectionId, sectionName, showAllSections]);

  useEffect(() => {
    isMounted.current = true;
    
    const timeoutId = setTimeout(() => {
      fetchSections();
    }, 0);
    
    return () => {
      isMounted.current = false;
      clearTimeout(timeoutId);
    };
  }, [fetchSections]);

  // عرض السبينر أثناء التحميل
  if (isLoading) {
    return (
      <section className="py-6 md:py-12 bg-white">
        <div className="container-custom">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#EC221F] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // عرض رسالة خطأ
  if (error) {
    return (
      <section className="py-6 md:py-12 bg-white">
        <div className="container-custom">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchSections}
              className="px-4 py-2 bg-[#EC221F] text-white rounded-[8px] hover:bg-[#d11d1a] transition"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </section>
    );
  }

  // إذا لم توجد أقسام
  if (sections.length === 0) {
    return (
      <section className="py-6 md:py-12 bg-white">
        <div className="container-custom">
          <div className="text-center py-12">
            <p className="text-gray-500">لا توجد أقسام لعرضها</p>
          </div>
        </div>
      </section>
    );
  }

  // عرض الأقسام
  return (
    <>
      {sections.map((section) => {
        const visibleProducts = section.products.slice(0, displayCount);
        const hasMore = section.products.length > displayCount;

        return (
          <section key={section.id} className="py-6 md:py-12 bg-white">
            <div className="container-custom">
              {/* Header */}
              <div className="mb-2 md:mb-5 flex justify-between items-center">
                <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#112B40' }}>
                  {section.name}
                </h2>
                <Link 
                  href="/products" 
                  className="text-[#EC221F] text-[16px] font-bold hover:underline transition-all duration-300"
                >
                  عرض المزيد
                </Link>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-2 md:mb-5">
                {visibleProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-in fade-in zoom-in duration-500 flex justify-center w-full"
                    style={{ 
                      animationFillMode: 'both',
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <ProductCard 
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      image={product.image}
                      hoverImage={product.hoverImage}
                      href={product.href}
                      originalPrice={product.originalPrice}
                      discount={product.discount}
                      colors={product.colors}
                      rating={product.rating}
                      reviewsCount={product.reviewsCount}
                      isBestSeller={product.isBestSeller}
                    />
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setDisplayCount(prev => prev + 8)}
                    className="px-6 py-2 border border-[#EC221F] text-[#EC221F] rounded-[8px] hover:bg-[#EC221F] hover:text-white transition-all duration-300"
                  >
                    تحميل المزيد
                  </button>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}