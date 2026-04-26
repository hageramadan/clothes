"use client";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

const categories = [
  { id: 1, name: "رجال", image: "/images/categories/cate1.png", slug: "electronics" },
  { id: 2, name: "نساء", image: "/images/categories/cate2.png", slug: "fashion" },
  { id: 3, name: "أطفال", image: "/images/categories/cate3.jpg", slug: "home" },
  { id: 4, name: "أطفال", image: "/images/categories/cate4.jpg", slug: "beauty" },
  { id: 5, name: "أطفال", image: "/images/categories/cate5.jpg", slug: "shoes" },
  { id: 6, name: "أطفال", image: "/images/categories/cate6.jpg", slug: "shoes" },
];

export function CategoriesSection() {
  return (
    <section className="py-4 md:py-8 container mx-auto px-4" style={{ minHeight: '568px' }}>
      <h2 className="text-3xl font-bold  mb-4 md:mb-10text-[#112B40]">الاقسام</h2>
      
      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 auto-rows-[270px]">
        
        {/* العنصر الأول: رجال */}
        <Link 
          href={`/categories/${categories[0].slug}`} 
          className="lg:col-span-1 lg:row-span-2 block"
        >
          <div className="group relative h-full w-full overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
            <Image
              src={categories[0].image}
              alt={categories[0].name}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              style={{
                objectPosition: 'center 20%', 
              }}
            />
            
            {/* Overlay متدرج جذاب */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 opacity-80 group-hover:opacity-90 transition-all duration-500" />
            
            {/* Category Name - تصميم محسن */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              {/* خلفية زجاجية خفيفة للنص */}
              <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 transform translate-y-0 group-hover:translate-y-[-8px] transition-all duration-500">
                <h3 className="text-white text-2xl md:text-3xl font-bold text-center">
                  {categories[0].name}
                </h3>
                {/* خط زخرفي تحت النص */}
                <div className="w-12 h-0.5 bg-[#EC221F] mx-auto mt-2 rounded-full group-hover:w-20 transition-all duration-500" />
              </div>
            </div>
          </div>
        </Link>

        {/* العنصر الثاني: نساء */}
        <Link 
          href={`/categories/${categories[1].slug}`} 
          className="lg:col-span-1 lg:row-span-2 block"
        >
          <div className="group relative h-full w-full overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
            <Image
              src={categories[1].image}
              alt={categories[1].name}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 50vw"
              style={{
                objectPosition: 'center 20%', 
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 opacity-80 group-hover:opacity-90 transition-all duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 transform translate-y-0 group-hover:translate-y-[-8px] transition-all duration-500">
                <h3 className="text-white text-2xl md:text-3xl font-bold text-center">
                  {categories[1].name}
                </h3>
                <div className="w-12 h-0.5 bg-[#EC221F] mx-auto mt-2 rounded-full group-hover:w-20 transition-all duration-500" />
              </div>
            </div>
          </div>
        </Link>

        {/* العنصر الثالث: أطفال */}
        <Link 
          href={`/categories/${categories[2].slug}`} 
          className="lg:col-span-1 row-span-1 block"
        >
          <div className="group relative h-full w-full overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
            <Image
              src={categories[2].image}
              alt={categories[2].name}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 opacity-80 group-hover:opacity-90 transition-all duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 transform translate-y-0 group-hover:translate-y-[-8px] transition-all duration-500">
                <h3 className="text-white text-xl md:text-2xl font-bold text-center">
                  {categories[2].name}
                </h3>
                <div className="w-10 h-0.5 bg-[#EC221F] mx-auto mt-1.5 rounded-full group-hover:w-16 transition-all duration-500" />
              </div>
            </div>
          </div>
        </Link>

        {/* العنصر الرابع: أطفال */}
        <Link 
          href={`/categories/${categories[3].slug}`} 
          className="lg:col-span-1 block"
        >
          <div className="group relative h-full w-full overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
            <Image
              src={categories[3].image}
              alt={categories[3].name}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 opacity-80 group-hover:opacity-90 transition-all duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 transform translate-y-0 group-hover:translate-y-[-8px] transition-all duration-500">
                <h3 className="text-white text-xl md:text-2xl font-bold text-center">
                  {categories[3].name}
                </h3>
                <div className="w-10 h-0.5 bg-[#EC221F] mx-auto mt-1.5 rounded-full group-hover:w-16 transition-all duration-500" />
              </div>
            </div>
          </div>
        </Link>

        {/* العنصر الخامس: أطفال */}
        <Link 
          href={`/categories/${categories[4].slug}`} 
          className="lg:col-span-1 block"
        >
          <div className="group relative h-full w-full overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
            <Image
              src={categories[4].image}
              alt={categories[4].name}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 opacity-80 group-hover:opacity-90 transition-all duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 transform translate-y-0 group-hover:translate-y-[-8px] transition-all duration-500">
                <h3 className="text-white text-xl md:text-2xl font-bold text-center">
                  {categories[4].name}
                </h3>
                <div className="w-10 h-0.5 bg-[#EC221F] mx-auto mt-1.5 rounded-full group-hover:w-16 transition-all duration-500" />
              </div>
            </div>
          </div>
        </Link>

        {/* العنصر السادس: أطفال */}
        <Link 
          href={`/categories/${categories[5].slug}`} 
          className="lg:col-span-1 block"
        >
          <div className="group relative h-full w-full overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
            <Image
              src={categories[5].image}
              alt={categories[5].name}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 opacity-80 group-hover:opacity-90 transition-all duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 transform translate-y-0 group-hover:translate-y-[-8px] transition-all duration-500">
                <h3 className="text-white text-xl md:text-2xl font-bold text-center">
                  {categories[5].name}
                </h3>
                <div className="w-10 h-0.5 bg-[#ff0000] mx-auto mt-1.5 rounded-full group-hover:w-16 transition-all duration-500" />
              </div>
            </div>
          </div>
        </Link>

      </div>
    </section>
  );
}