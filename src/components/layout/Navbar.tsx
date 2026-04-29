"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, ShoppingCart, User, Search, Menu, X, ChevronDown } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { PiUserBold } from "react-icons/pi";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { getCategories } from "@/services/api";

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

interface Category {
  id: number;
  name: string;
  href: string;
}

const navLinks = [
  { name: "الرئيسية", href: "/" },
  { name: "الفئات", href: "/categories", hasDropdown: true },
  { name: "تواصل معنا", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [showMobileCategoriesDropdown, setShowMobileCategoriesDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // جلب الفئات من API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const categoriesData = await getCategories();
        
        const transformedCategories: Category[] = categoriesData.map(cat => ({
          id: cat.id,
          name: cat.name,
          href: `/categories/${generateSlug(cat.name)}`
        }));
        
        setCategories(transformedCategories);
      } catch (error) {
        console.error('Error fetching categories for navbar:', error);
        // بيانات افتراضية في حالة الخطأ
        setCategories([
          { id: 1, name: "رجال", href: "/categories/men" },
          { id: 2, name: "نساء", href: "/categories/women" },
          { id: 3, name: "أطفال", href: "/categories/kids" },
          { id: 4, name: "بنات", href: "/categories/girls" },
          { id: 5, name: "بيبي", href: "/categories/baby" },
          { id: 6, name: "فورمال", href: "/categories/formal" },
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus on search input when shown
  useEffect(() => {
    if (showSearchInput && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [showSearchInput]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
      setShowSearchInput(false);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  // Close search input when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSearchInput && searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchInput(false);
        setSearchQuery("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearchInput]);

  // Close categories dropdown when clicking outside (Desktop only)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCategoriesDropdown && categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setShowCategoriesDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCategoriesDropdown]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSearchInput) {
        setShowSearchInput(false);
        setSearchQuery("");
      }
      if (e.key === 'Escape' && showCategoriesDropdown) {
        setShowCategoriesDropdown(false);
      }
      if (e.key === 'Escape' && showMobileCategoriesDropdown) {
        setShowMobileCategoriesDropdown(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showSearchInput, showCategoriesDropdown, showMobileCategoriesDropdown]);

  return (
    <header 
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md' 
          : 'bg-transparent shadow-none'
      }`}
    >
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link 
            href="/" 
            className={`text-[32px] font-bold transition-colors shrink-0 ${
              isScrolled ? 'text-[#EC221F]' : 'text-white'
            }`}
          >
            Logo
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
            {navLinks.map((link) => (
              link.hasDropdown ? (
                <div key={link.href} className="relative" ref={categoriesRef}>
                  <button
                    aria-label="categories"
                    className={`flex items-center gap-1 text-[16px] transition-colors hover:text-[#EC221F] ${
                      isScrolled ? 'text-[#112B40]' : 'text-white'
                    }`}
                    style={{ 
                      color: pathname.startsWith('/categories') ? '#EC221F' : (isScrolled ? '#112B40' : 'white'),
                      fontWeight: pathname.startsWith('/categories') ? '700' : '400'
                    }}
                    onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
                    onMouseEnter={() => setShowCategoriesDropdown(true)}
                  >
                    {link.name}
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showCategoriesDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Categories Dropdown - Desktop */}
                  {showCategoriesDropdown && (
                    <div 
                      className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg border shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200"
                      style={{ borderColor: '#e2e8f0' }}
                      onMouseLeave={() => setShowCategoriesDropdown(false)}
                    >
                      <div className="py-2">
                        {loadingCategories ? (
                          <div className="px-4 py-2 text-sm text-gray-500">جاري التحميل...</div>
                        ) : (
                          categories.map((category) => (
                            <Link
                              key={category.id}
                              href={category.href}
                              className="block px-4 py-2 text-[14px] transition-colors hover:bg-gray-50"
                              style={{ color: '#112B40' }}
                              onClick={() => setShowCategoriesDropdown(false)}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#EC221F'}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#112B40'}
                            >
                              {category.name}
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[16px] transition-colors hover:text-[#EC221F] ${
                    isScrolled ? 'text-[#112B40]' : 'text-white'
                  }`}
                  style={{ 
                    fontWeight: pathname === link.href ? '700' : '400'
                  }}
                >
                  {link.name}
                </Link>
              )
            ))}
          </nav>

          {/* Actions - Desktop */}
          <div className="hidden md:flex items-center gap-1 shrink-0">
            {/* Search Button & Overlay Input */}
            <div className="relative" ref={searchContainerRef}>
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="search"
                onClick={() => setShowSearchInput(!showSearchInput)}
                className="relative z-10 hover:bg-white/30 rounded-[10px]"
                style={{ color: isScrolled ? '#195073' : 'white' }}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Search Overlay for Desktop */}
              {showSearchInput && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-screen max-w-md px-4">
                  <div className="relative">
                    <form onSubmit={handleSearch}>
                      <div className="relative bg-transparent">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#94a3b8' }} />
                        <Input
                          ref={searchInputRef}
                          type="search"
                          placeholder="ابحث عن منتج..."
                          className="w-full h-11 pr-9 border-0 bg-white focus-visible:ring-1 focus-visible:ring-offset-0"
                          style={{ 
                            color: '#195073',
                            '--tw-ring-color': '#EC221F'
                          } as React.CSSProperties}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            aria-label="clear search"
                            onClick={() => setSearchQuery("")}
                            className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
                            style={{ color: '#94a3b8' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#195073'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </form>
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white border-l border-t" style={{ borderColor: '#e2e8f0' }}></div>
                  </div>
                </div>
              )}
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              asChild 
              className="relative hover:bg-white/30 rounded-[10px]"
              aria-label="favorites"
              style={{ color: isScrolled ? '#195073' : 'white' }}
            >
              <Link href="/favorites">
                <span className="text-[12px] me-1 font-bold">1</span>
                <Heart className="h-[20px] w-[20px]" />
              </Link>
            </Button>

            <Button 
              variant="ghost" 
              aria-label="cart"
              size="icon" 
              asChild 
              className="relative hover:bg-white/30 rounded-[10px]"
              style={{ color: isScrolled ? '#195073' : 'white' }}
            >
              <Link href="/cart">
                <span className="text-[12px] me-1 font-bold">{cartCount || 0}</span>
                <ShoppingCart className="h-5 w-5" />
              </Link>
            </Button>

            <Button 
              variant="ghost" 
              asChild 
              aria-label="login"
              className={`hidden sm:inline-flex gap-2 hover:text-white transition-all duration-300 ${
                isScrolled 
                  ? 'bg-[#EC221F] hover:bg-[#a880a6] text-white' 
                  : 'backdrop-blur-sm hover:bg-white/30 text-white'
              } rounded-[16px]`}
            >
              <Link href="/auth/login">
                <PiUserBold className="h-5 w-5" />
                <span className="text-[14px] font-bold">تسجيل دخول</span>
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="show menu"
            className="md:hidden hover:bg-white/30 rounded-[10px]"
            style={{ color: isScrolled ? '#195073' : 'white' }}
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setShowMobileCategoriesDropdown(false);
            }}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Image src="/images/Menu.png" alt="Menu" className="w-[24px] h-[24px]" width={24} height={24} style={{ filter: isScrolled ? 'none' : 'brightness(0) invert(1)' }} />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-4 animate-in slide-in-from-top-2 duration-200 bg-white" style={{ borderColor: '#e2e8f0' }}>
            <form onSubmit={handleSearch} className="relative px-3">
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#94a3b8' }} />
              <Input
                type="search"
                placeholder="ابحث عن منتج..."
                className="w-full h-10 pr-9 bg-gray-50"
                style={{ 
                  color: '#112B40',
                  borderColor: '#e2e8f0'
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="flex items-center justify-around px-3 py-2 border-b border-gray-100">
              <Link 
                href="/favorites" 
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="h-5 w-5" style={{ color: '#195073' }} />
                <span className="text-xs" style={{ color: '#112B40' }}>المفضلة</span>
              </Link>
              
              <Link 
                href="/cart" 
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingCart className="h-5 w-5" style={{ color: '#195073' }} />
                <span className="text-xs" style={{ color: '#112B40' }}>السلة</span>
              </Link>

              <Link 
                href="/auth/login" 
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-5 w-5" style={{ color: '#195073' }} />
                <span className="text-xs" style={{ color: '#112B40' }}>تسجيل دخول</span>
              </Link>
            </div>

            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                link.hasDropdown ? (
                  <div key={link.href} className="space-y-2">
                    <button
                      aria-label="categories"
                      className="px-3 py-3 text-[16px] font-medium rounded-md transition-colors hover:bg-gray-50 flex items-center justify-between w-full"
                      style={{ color: '#112B40' }}
                      onClick={() => setShowMobileCategoriesDropdown(!showMobileCategoriesDropdown)}
                    >
                      {link.name}
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showMobileCategoriesDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* قائمة الفئات في الموبايل */}
                    {showMobileCategoriesDropdown && (
                      <div className="mr-4 space-y-1">
                        {loadingCategories ? (
                          <div className="px-3 py-2 text-sm text-gray-500">جاري التحميل...</div>
                        ) : (
                          categories.map((category) => (
                            <Link
                              key={category.id}
                              href={category.href}
                              className="block px-3 py-2 text-[14px] rounded-md transition-colors hover:bg-gray-50"
                              style={{ color: '#112B40' }}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setShowMobileCategoriesDropdown(false);
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#EC221F'}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#112B40'}
                            >
                              {category.name}
                            </Link>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-3 text-[16px] font-medium rounded-md transition-colors hover:bg-gray-50"
                    style={{ color: '#112B40' }}
                    onClick={() => setMobileMenuOpen(false)}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#EC221F'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#112B40'}
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}