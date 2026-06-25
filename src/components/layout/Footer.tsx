"use client";

import Image from "next/image";
import Link from "next/link";
import { PiLineVerticalThin } from "react-icons/pi";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { getCategories } from "@/services/api";
import { useSettings } from "@/hooks/useSettings";

export function Footer() {
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [footerCategories, setFooterCategories] = useState<
    { id: number; name: string }[]
  >([]);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // استخدام Hook الإعدادات
  const { settings, loading: settingsLoading } = useSettings();

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getCategories();
        setFooterCategories(
          categories.map((category) => ({
            id: category.id,
            name: category.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showCategoriesDropdown &&
        categoriesRef.current &&
        !categoriesRef.current.contains(event.target as Node)
      ) {
        setShowCategoriesDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCategoriesDropdown]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showCategoriesDropdown) {
        setShowCategoriesDropdown(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showCategoriesDropdown]);

  // بناء روابط التواصل الاجتماعي للفوتر - مع الصور
  const getSocialLinks = () => {
    if (!settings) return [];
    
    const links = [];
    
    // انستجرام
    if (settings.instagram) {
      links.push({ 
        href: settings.instagram, 
        label: "Instagram",
        imagePath: "/images/social/insta.png"
      });
    }
    
    // فيسبوك
    if (settings.facebook) {
      links.push({ 
        href: settings.facebook, 
        label: "Facebook",
        imagePath: "/images/social/face.png"
      });
    }
    
    // واتساب
    if (settings.whatsapp) {
      const whatsappUrl = settings.whatsapp.startsWith('https://') 
        ? settings.whatsapp 
        : `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`;
      links.push({ 
        href: whatsappUrl, 
        label: "WhatsApp",
        imagePath: "/images/social/wats.png"
      });
    }

    // تويتر (X)
    if (settings.twitter) {
      links.push({ 
        href: settings.twitter, 
        label: "Twitter",
        imagePath: "/images/social/x.png"
      });
    }

    // سناب شات
    if (settings.snapchat) {
      links.push({ 
        href: settings.snapchat, 
        label: "Snapchat",
        imagePath: "/images/social/snap.png"
      });
    }

    // لينكد إن
    if (settings.linkedin) {
      links.push({ 
        href: settings.linkedin, 
        label: "LinkedIn",
        imagePath: "/images/social/linkedin.png"
      });
    }

    return links;
  };

  const socialLinks = getSocialLinks();

  return (
    <footer className="border-t mt-auto bg-[#141718] text-white pt-6 md:pt-10">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* القسم العلوي */}
        <div className="flex flex-wrap md:flex-row flex-col items-center justify-center md:justify-between gap-8 mb-8">
          {/* اللوجو */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h1 className="text-[#FFFFFF] text-xl md:text-2xl font-bold">
                {settingsLoading ? "جاري التحميل..." : settings?.name || "LoGo"}
              </h1>
              <PiLineVerticalThin className="w-6 h-8 text-[#E8ECEF]" />
              <p className="text-white/70 text-sm leading-relaxed">
                {settingsLoading ? "..." : settings?.address || "متجرك المثالي هنا كل ما تريد"}
              </p>
            </div>
          </div>

          {/* روابط */}
          <div className="flex md:flex-row flex-col justify-center gap-7 items-center text-[14px]">
            <Link
              href="/"
              className="font-bold hover:text-[#EC221F] transition-colors"
            >
              الرئيسية
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() =>
                  setShowCategoriesDropdown(!showCategoriesDropdown)
                }
                onMouseEnter={() => setShowCategoriesDropdown(true)}
                className="flex items-center gap-1 hover:text-[#EC221F] transition-colors"
              >
                الفئات
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    showCategoriesDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showCategoriesDropdown && (
                <div
                  className="absolute bottom-full right-0 mb-2 w-36 lg:w-48 bg-white rounded-[8px] border shadow-xl z-50"
                  onMouseLeave={() => setShowCategoriesDropdown(false)}
                >
                  <div className="absolute -bottom-1.5 right-4 w-3 h-3 rotate-45 bg-white border-r border-b"></div>

                  <div className="py-2">
                    {footerCategories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/products?categories=[${category.id}]`}
                        className="block px-4 py-2 text-[14px] transition-colors hover:bg-gray-50 text-right"
                        style={{ color: "#112B40" }}
                        onClick={() => setShowCategoriesDropdown(false)}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#EC221F")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#112B40")
                        }
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/contact"
              className="hover:text-[#EC221F] transition-colors"
            >
              تواصل معنا
            </Link>
          </div>
        </div>

        {/* footer bottom */}
        <div className="border-t border-white/20 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 font-bold text-sm">
              © جميع الحقوق محفوظة | {new Date().getFullYear()}
            </p>

            <div className="flex gap-6">
              <Link 
                href={settings?.terms_and_conditions ? "/terms" : "#"} 
                className="hover:text-[#EC221F] text-white"
              >
                الشروط والأحكام
              </Link>
              <Link 
                href={settings?.privacy_policy ? "/privacy" : "#"} 
                className="hover:text-[#EC221F] text-white"
              >
                سياسة الخصوصية
              </Link>
            </div>

            {/* social - استخدام الصور بدلاً من الأيقونات */}
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity hover:scale-110 transform duration-200"
                  aria-label={social.label}
                >
                  <Image
                    src={social.imagePath}
                    alt={social.label}
                    width={26}
                    height={26}
                    className="w-[26px] h-[26px] object-contain"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}