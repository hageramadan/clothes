"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, ShoppingCart, User, Search, Menu, X, ChevronDown } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { PiUserBold  } from "react-icons/pi";
// import { useFavorites } from "@/contexts/FavoritesContext";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

const navLinks = [
  { name: "الرئيسية", href: "/" },
  { name: "الفئات", href: "/categories", hasDropdown: true },
  { name: "تواصل معنا", href: "/contact" },
];

// Categories dropdown items
const categories = [
  { name: "إلكترونيات", href: "/categories/electronics" },
  { name: "ملابس", href: "/categories/clothing" },
  { name: "أحذية", href: "/categories/shoes" },
  { name: "مستحضرات تجميل", href: "/categories/beauty" },
  { name: "منزل ومطبخ", href: "/categories/home" },
  { name: "رياضة", href: "/categories/sports" },
];

export function Navbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  // const { favoritesCount } = useFavorites();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

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

  // Close categories dropdown when clicking outside
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
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showSearchInput, showCategoriesDropdown]);

  return (
    <header 
      className="sticky top-0 z-50 w-full shadow-md" 
      style={{ backgroundColor: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
    >
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-[32px] font-bold transition-colors shrink-0"
            style={{ color: '#973BD9' }}
          >
            Logo
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
            {navLinks.map((link) => (
              link.hasDropdown ? (
                <div key={link.href} className="relative" ref={categoriesRef}>
                  <button
                  aria-label="search"
                    className="flex items-center gap-1 text-[16px] transition-colors hover:text-[#C092BD]"
                    style={{ 
                      color: pathname.startsWith('/categories') ? '#C092BD' : '#112B40',
                      fontWeight: pathname.startsWith('/categories') ? '700' : '400'
                    }}
                    onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
                    onMouseEnter={() => setShowCategoriesDropdown(true)}
                  >
                    {link.name}
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showCategoriesDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Categories Dropdown */}
                  {showCategoriesDropdown && (
                    <div 
                      className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg border shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200"
                      style={{ borderColor: '#e2e8f0' }}
                      onMouseLeave={() => setShowCategoriesDropdown(false)}
                    >
                      <div className="py-2">
                        {categories.map((category) => (
                          <Link
                            key={category.href}
                            href={category.href}
                            className="block px-4 py-2 text-[14px] transition-colors hover:bg-gray-50"
                            style={{ color: '#112B40' }}
                            onClick={() => setShowCategoriesDropdown(false)}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#C092BD'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#112B40'}
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[16px] transition-colors hover:text-[#C092BD]"
                  style={{ 
                    color: pathname === link.href ? '#C092BD' : '#112B40',
                    fontWeight: pathname === link.href ? '700' : '400'
                  }}
                >
                  {link.name}
                </Link>
              )
            ))}
          </nav>

          {/* Actions - Desktop فقط، في الموبايل تختفي */}
          <div className="hidden md:flex items-center gap-1 shrink-0">
            {/* Search Button & Overlay Input */}
            <div className="relative" ref={searchContainerRef}>
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="search"
                onClick={() => setShowSearchInput(!showSearchInput)}
                className="relative z-10 hover:bg-gray-100"
                style={{ color: '#195073' }}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Search Overlay for Desktop */}
              {showSearchInput && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-screen max-w-md px-4">
                  <div className="relative">
                    <form onSubmit={handleSearch}>
                      <div className="relative bg-transparent " >
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#94a3b8' }} />
                        <Input
                          ref={searchInputRef}
                          type="search"
                          placeholder="ابحث عن منتج..."
                          className="w-full h-11 pr-9 border-0 bg-white focus-visible:ring-1 focus-visible:ring-offset-0"
                          style={{ 
                            color: '#195073',
                            '--tw-ring-color': '#C092BD'
                          } as React.CSSProperties}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            aria-label="search"
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
              className="relative hover:bg-gray-100"
              aria-label="favorites"
              style={{ color: '#195073' }}
            >
              <Link href="/favorites" >
              {/* {favoritesCount > 0 && (
                  <span className="  text-[12px] text-[#195073] me-1 font-bold " >
                    {favoritesCount}
                  </span>
                )} */}
                <span className="  text-[12px] text-[#195073] me-1 font-bold " >
                    1
                  </span>
                <Heart className="h-[20px] w-[20px]" />
                
              </Link>
            </Button>

            <Button 
              variant="ghost" 
              aria-label="cart"
              size="icon" 
              asChild 
              className="relative hover:bg-gray-100"
              style={{ color: '#195073' }}
            >
              <Link href="/cart" >
               <span className="  text-[12px] text-[#195073] me-1 font-bold " >
                    1
                  </span>
                <ShoppingCart className="h-5 w-5" />
                {/* {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-[10px] text-white flex items-center justify-center" style={{ backgroundColor: '#C092BD' }}>
                    {cartCount}
                  </span>
                )} */}
              </Link>
            </Button>

            <Button 
              variant="ghost" 
              asChild 
              aria-label="search"
              className="hidden sm:inline-flex text-white rounded-[16px] bg-[#C092BD] hover:bg-[#a880a6] gap-2"
              style={{ color: '#195073' }}
            >
              <Link href="/auth/login">
                <PiUserBold  className="h-5 w-5 text-white" />
                <span className="text-[14px] font-bold text-white">تسجيل دخول</span>
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button - يظهر فقط في الموبايل */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="show menu"
            className="md:hidden hover:bg-gray-100"
            style={{ color: '#195073' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Image src="/images/Menu.png" alt="Menu" className="w-[24px] h-[24x]" width={120} height={120} />}
          </Button>
        </div>

        {/* Mobile Menu - يحتوي على البحث والمفضلة والسلة */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-4 animate-in slide-in-from-top-2 duration-200" style={{ borderColor: '#e2e8f0' }}>
            {/* Search in mobile menu */}
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

            {/* Favorites and Cart in mobile menu */}
            <div className="flex items-center justify-around px-3 py-2 border-b border-gray-100">
              <Link 
                href="/favorites" 
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="relative">
                   {/* <span className="  text-[12px] text-[#195073] me-1 font-bold " >
                    1
                  </span> */}
                  <Heart className="h-5 w-5" style={{ color: '#195073' }} />
                  {/* {favoritesCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full text-[10px] text-white flex items-center justify-center" style={{ backgroundColor: '#ef4444' }}>
                      {favoritesCount}
                    </span>
                  )} */}
                </div>
                <span className="text-xs" style={{ color: '#112B40' }}>المفضلة</span>
              </Link>
              
              <Link 
                href="/cart" 
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" style={{ color: '#195073' }} />
                  {/* {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full text-[10px] text-white flex items-center justify-center" style={{ backgroundColor: '#C092BD' }}>
                      {cartCount}
                    </span>
                  )} */}
                </div>
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

            {/* Navigation Links in mobile menu */}
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                link.hasDropdown ? (
                  <div key={link.href} className="space-y-2">
                    <button
                    aria-label="search"
                      className="px-3 py-3 text-[16px] font-medium rounded-md transition-colors hover:bg-gray-50 flex items-center justify-between w-full"
                      style={{ color: '#112B40' }}
                      onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
                    >
                      {link.name}
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showCategoriesDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showCategoriesDropdown && (
                      <div className="mr-4 space-y-1">
                        {categories.map((category) => (
                          <Link
                            key={category.href}
                            href={category.href}
                            className="block px-3 py-2 text-[14px] rounded-md transition-colors hover:bg-gray-50"
                            style={{ color: '#112B40' }}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setShowCategoriesDropdown(false);
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#C092BD'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#112B40'}
                          >
                            {category.name}
                          </Link>
                        ))}
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
                    onMouseEnter={(e) => e.currentTarget.style.color = '#C092BD'}
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