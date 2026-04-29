"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/services/api";

interface Category {
  id: number;
  name: string;
  image: string;
  slug: string;
}

// تحويل الاسم العربي إلى slug للإنجليزية
const generateSlug = (name: string): string => {
  const slugMap: { [key: string]: string } = {
    "رجال": "men",
    "نساء": "women",
    "أطفال": "kids",
    "بنات": "girls",
    "بيبي": "baby",
    "فورمال": "formal"
  };
  
  return slugMap[name] || name.toLowerCase().replace(/\s+/g, '-');
};

// ✅ تعريف الدالة أولاً قبل استخدامها
const getDefaultCategories = (): Category[] => {
  return [
    { id: 1, name: "رجال", image: "/images/categories/cate1.png", slug: "men" },
    { id: 2, name: "نساء", image: "/images/categories/cate2.png", slug: "women" },
    { id: 3, name: "أطفال", image: "/images/categories/cate3.jpg", slug: "kids" },
    { id: 4, name: "بنات", image: "/images/categories/cate4.jpg", slug: "girls" },
    { id: 5, name: "بيبي", image: "/images/categories/cate5.jpg", slug: "baby" },
    { id: 6, name: "فورمال", image: "/images/categories/cate6.jpg", slug: "formal" },
  ];
};

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await getCategories();
        
        // تحويل البيانات من API إلى شكل مناسب
        const transformedCategories: Category[] = categoriesData.map(cat => ({
          id: cat.id,
          name: cat.name,
          image: `https://dukanah.admin.t-carts.com${cat.image}`,
          slug: generateSlug(cat.name)
        }));
        
        setCategories(transformedCategories);
        
        // If no categories from API, use default fallback
        if (transformedCategories.length === 0) {
          setCategories(getDefaultCategories());
        }
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('فشل في تحميل الأقسام');
        // استخدام بيانات افتراضية في حالة الخطأ
        setCategories(getDefaultCategories());
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-4 md:py-8 container mx-auto px-7" style={{ minHeight: '568px' }}>
        <h2 className="text-3xl font-bold mb-4 md:mb-10 text-[#112B40]">الاقسام</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 auto-rows-[270px]">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-full"></div>
          ))}
        </div>
      </section>
    );
  }

  if (error && categories.length === 0) {
    return (
      <section className="py-4 md:py-8 container mx-auto px-7" style={{ minHeight: '568px' }}>
        <h2 className="text-3xl font-bold mb-4 md:mb-10 text-[#112B40]">الاقسام</h2>
        <div className="text-center py-12">
          <p className="text-red-600">عذراً، حدث خطأ في تحميل الأقسام</p>
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

  // ترتيب الأقسام حسب الأولوية للعرض
  const getLayoutOrder = () => {
    const order = ['رجال', 'نساء', 'أطفال', 'بنات', 'بيبي', 'فورمال'];
    return [...categories].sort((a, b) => {
      const indexA = order.indexOf(a.name);
      const indexB = order.indexOf(b.name);
      return indexA - indexB;
    });
  };

  const orderedCategories = getLayoutOrder();

  return (
    <section className="py-4 md:py-8 container mx-auto px-7" style={{ minHeight: '568px' }}>
      <h2 className="text-3xl font-bold mb-4 md:mb-10 text-[#112B40]">الاقسام</h2>
      
      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 auto-rows-[270px]">
        
        {orderedCategories.map((category, index) => {
          // تحديد الـ layout بناءً على الترتيب
          let layoutClass = "";
          let isLarge = false;
          
          if (index === 0 || index === 1) {
            // أول عنصرين (رجال ونساء) يكونون large
            layoutClass = "lg:col-span-1 lg:row-span-2";
            isLarge = true;
          } else {
            // باقي العناصر
            layoutClass = "lg:col-span-1 row-span-1";
            isLarge = false;
          }

          return (
            <Link 
              key={category.id}
              href={`/categories/${category.slug}`} 
              className={`${layoutClass} block`}
            >
              <div className="group relative h-full w-full overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  style={{
                    objectPosition: 'center 20%', 
                  }}
                  onError={(e) => {
                    // في حالة فشل تحميل الصورة، استخدم الصورة الافتراضية
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder.jpg';
                  }}
                />
                
                {/* Overlay متدرج جذاب */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 opacity-80 group-hover:opacity-90 transition-all duration-500" />
                
                {/* Category Name - تصميم محسن */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  {/* خلفية زجاجية خفيفة للنص */}
                  <div className={`backdrop-blur-sm bg-white/10 rounded-xl ${
                    isLarge ? 'p-4' : 'p-3'
                  } transform translate-y-0 group-hover:translate-y-[-8px] transition-all duration-500`}>
                    <h3 className={`text-white font-bold text-center ${
                      isLarge ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
                    }`}>
                      {category.name}
                    </h3>
                    {/* خط زخرفي تحت النص */}
                    <div className={`h-0.5 bg-[#EC221F] mx-auto mt-2 rounded-full transition-all duration-500 ${
                      isLarge ? 'w-12 group-hover:w-20' : 'w-10 group-hover:w-16'
                    }`} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}