"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, ShoppingCart, User, Search, X, ChevronDown, LogOut, HeartIcon, Package, RotateCcw, UserCircle } from "lucide-react";
import { useCartContext } from "@/contexts/CartContext";
import { PiUserBold } from "react-icons/pi";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { getCategories } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";

// تحويل الاسم العربي إلى slug للإنجليزية (للعرض فقط)
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
  const router = useRouter();
  const { itemCount: cartCount, cart, isGuest } = useCartContext(); // ✅ إضافة isGuest
  const { isAuthenticated, user, logoutUser, loading } = useAuth();
  const { total: favoritesCount } = useFavorites();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [showMobileCategoriesDropdown, setShowMobileCategoriesDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // التحقق من أن الصفحة الحالية هي الهوم
  const isHomePage = pathname === "/";
  const itemsCount = cart?.items?.length || 0;

  // جلب الفئات من API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const categoriesData = await getCategories();
        
        const transformedCategories: Category[] = categoriesData.map(cat => ({
          id: cat.id,
          name: cat.name,
          href: `/products?categories=[${cat.id}]`
        }));
        
        setCategories(transformedCategories);
      } catch (error) {
        console.error('Error fetching categories for navbar:', error);
        setCategories([
          { id: 1, name: "رجال", href: "/products?categories=[1]" },
          { id: 2, name: "نساء", href: "/products?categories=[2]" },
          { id: 3, name: "أطفال", href: "/products?categories=[3]" },
          { id: 4, name: "بنات", href: "/products?categories=[4]" },
          { id: 5, name: "بيبي", href: "/products?categories=[5]" },
          { id: 6, name: "فورمال", href: "/products?categories=[6]" },
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Handle scroll event
  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  // Focus on search input when shown
  useEffect(() => {
    if (showSearchInput && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [showSearchInput]);

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
      if (showUserDropdown && userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCategoriesDropdown, showUserDropdown]);

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
      if (e.key === 'Escape' && showUserDropdown) {
        setShowUserDropdown(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showSearchInput, showCategoriesDropdown, showMobileCategoriesDropdown, showUserDropdown]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchInput(false);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  // تسجيل الخروج
  const handleLogout = async () => {
    await logoutUser();
    setShowUserDropdown(false);
    setMobileMenuOpen(false);
    router.push("/");
    // إعادة تحميل الصفحة لتحديث حالة الناف بار في كل مكان
    window.location.reload();
  };

  // الحرف الأول من اسم المستخدم
  const getUserInitial = () => {
    if (!user) return "";
    return user.name ? user.name.charAt(0).toUpperCase() : (user.email?.charAt(0).toUpperCase() || "U");
  };

  // تحديد ألوان الناف بار
  const getNavbarStyles = () => {
    if (isHomePage) {
      return {
        backgroundColor: isScrolled ? '#FFFFFF' : 'transparent',
        shadow: isScrolled ? 'shadow-md' : 'shadow-none',
        textColor: isScrolled ? '#112B40' : '#FFFFFF',
        logoColor: isScrolled ? '#EC221F' : '#FFFFFF',
        buttonBg: isScrolled ? 'bg-[#EC221F]' : 'backdrop-blur-sm',
        buttonTextColor: isScrolled ? '#FFFFFF' : '#FFFFFF',
      };
    } else {
      return {
        backgroundColor: '#FFFFFF',
        shadow: 'shadow-md',
        textColor: '#000000',
        logoColor: '#EC221F',
        buttonBg: 'bg-[#EC221F]',
        buttonTextColor: '#FFFFFF',
      };
    }
  };

  const styles = getNavbarStyles();

  // عرض شاشة تحميل مؤقتة أثناء التحقق من حالة المستخدم
  if (loading) {
    return (
      <header className="fixed top-0 z-50 w-full bg-white shadow-md">
        <div className="container-custom">
          <div className="flex h-16 items-center justify-between">
            <div className="text-[32px] font-bold text-[#EC221F]">Logo</div>
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header 
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${styles.shadow}`}
      style={{ backgroundColor: styles.backgroundColor }}
    >
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-[32px] font-bold transition-colors shrink-0"
            style={{ color: styles.logoColor }}
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
                    className="flex items-center gap-1 text-[16px] transition-colors hover:text-[#EC221F]"
                    style={{ 
                      color: pathname.startsWith('/products') ? '#EC221F' : styles.textColor,
                      fontWeight: pathname.startsWith('/products') ? '700' : '400'
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
                      className="absolute top-full right-0 mt-2 w-64 bg-white rounded-[8px]  border shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200"
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
                  className="text-[16px] transition-colors hover:text-[#EC221F]"
                  style={{ 
                    color: pathname === link.href ? '#EC221F' : styles.textColor,
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
                style={{ color: styles.textColor }}
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

            {/* Favorites Button with real count */}
            <Button 
              variant="ghost" 
              size="icon" 
              asChild 
              className="relative hover:bg-white/30 rounded-[10px]"
              aria-label="favorites"
              style={{ color: styles.textColor }}
            >
              <Link href="/account/wishlist">
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </span>
                )}
                <Heart className="h-[20px] w-[20px]" />
              </Link>
            </Button>

            {/* Cart Button - ✅ إضافة tooltip للمستخدم الضيف */}
            <Button 
              variant="ghost" 
              aria-label="cart"
              size="icon" 
              asChild 
              className="relative hover:bg-white/30 rounded-[10px] group"
              style={{ color: styles.textColor }}
            >
              <Link href="/cart">
                {itemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {itemsCount > 99 ? '99+' : itemsCount}
                  </span>
                )}
                <ShoppingCart className="h-5 w-5" />
                {/* ✅ إضافة tooltip للمستخدم الضيف */}
                {isGuest && itemsCount > 0 && (
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-gray-800 text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    سلة الضيف
                  </span>
                )}
              </Link>
            </Button>

            {/* Conditional Rendering: User Avatar or Login Button */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 hover:bg-gray-100"
                  style={{ color: styles.textColor }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff6b6b] to-[#ff3c27] flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {getUserInitial()}
                  </div>
                  <span className="text-sm font-medium hidden lg:block">
                    {user.name?.split(' ')[0] || user.email?.split('@')[0] || "مستخدم"}
                  </span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-[8px]  border shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200" style={{ borderColor: '#e2e8f0' }}>
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{user.name || "مستخدم"}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{user.email || user.phone || ""}</p>
                      </div>

                      <Link
                        href="/account/wishlist"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50"
                        style={{ color: '#112B40' }}
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <HeartIcon className="h-4 w-4" />
                        <span>المفضلة {favoritesCount > 0 && `(${favoritesCount})`}</span>
                      </Link>

                      <Link
                        href="/account/orders"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50"
                        style={{ color: '#112B40' }}
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <Package className="h-4 w-4" />
                        <span>الطلبات</span>
                      </Link>

                      <Link
                        href="/account/returns"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50"
                        style={{ color: '#112B40' }}
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>المرتجعات</span>
                      </Link>

                      <Link
                        href="/account"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50"
                        style={{ color: '#112B40' }}
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <UserCircle className="h-4 w-4" />
                        <span>الملف الشخصي</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 border-t border-gray-100 mt-1"
                        style={{ color: '#EC221F' }}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button 
                variant="ghost" 
                asChild 
                aria-label="login"
                className={`hidden sm:inline-flex gap-2 hover:bg-[#EC221F] transition-all duration-300 ${styles.buttonBg} rounded-[16px]`}
                style={{ color: styles.buttonTextColor }}
              >
                <Link href="/auth/login">
                  <PiUserBold className="h-5 w-5" />
                  <span className="text-[14px] font-bold">تسجيل دخول</span>
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="show menu"
            className="md:hidden hover:bg-white/30 rounded-[10px]"
            style={{ color: styles.textColor }}
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setShowMobileCategoriesDropdown(false);
            }}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Image src="/images/Menu.png" alt="Menu" className="w-[24px] h-[24px]" width={2400} height={2400} style={{ filter: isHomePage && !isScrolled ? 'brightness(0) invert(1)' : 'none' }} />}
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
                href="/account/wishlist" 
                className="flex flex-col items-center gap-1 p-2 rounded-[8px]  hover:bg-gray-50 transition-colors relative"
                onClick={() => setMobileMenuOpen(false)}
              >
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </span>
                )}
                <Heart className="h-5 w-5" style={{ color: '#195073' }} />
                <span className="text-xs" style={{ color: '#112B40' }}>المفضلة</span>
              </Link>
              
              <Link 
                href="/cart" 
                className="flex flex-col items-center gap-1 p-2 rounded-[8px]  hover:bg-gray-50 transition-colors relative"
                onClick={() => setMobileMenuOpen(false)}
              >
                {itemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                    {itemsCount > 99 ? '99+' : itemsCount}
                  </span>
                )}
                <ShoppingCart className="h-5 w-5" style={{ color: '#195073' }} />
                <span className="text-xs" style={{ color: '#112B40' }}>
                  السلة {isGuest && itemsCount > 0 && '(ضيف)'}
                </span>
              </Link>

              {isAuthenticated && user ? (
                <div className="flex flex-col items-center gap-1 p-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff6b6b] to-[#ff3c27] flex items-center justify-center text-white font-bold text-sm">
                    {getUserInitial()}
                  </div>
                  <span className="text-xs" style={{ color: '#112B40' }}>حسابي</span>
                </div>
              ) : (
                <Link 
                  href="/auth/login" 
                  className="flex flex-col items-center gap-1 p-2 rounded-[8px]  hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" style={{ color: '#195073' }} />
                  <span className="text-xs" style={{ color: '#112B40' }}>تسجيل دخول</span>
                </Link>
              )}
            </div>

            {/* إذا كان المستخدم مسجل دخول، عرض روابط إضافية في الموبايل */}
            {isAuthenticated && user && (
              <div className="px-3 space-y-1 border-b border-gray-100 pb-3">
                <Link 
                  href="/account/orders" 
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-[8px]  hover:bg-gray-50"
                  style={{ color: '#112B40' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="h-4 w-4" />
                  <span>الطلبات</span>
                </Link>
                <Link 
                  href="/account/returns" 
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-[8px]  hover:bg-gray-50"
                  style={{ color: '#112B40' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>المرتجعات</span>
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-[8px]  hover:bg-gray-50"
                  style={{ color: '#EC221F' }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            )}

            {/* ✅ إضافة رسالة للمستخدم الضيف في الموبايل */}
            {isGuest && itemsCount > 0 && (
              <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg mx-3">
                <p className="text-xs text-blue-700 text-center">
                  🛒 سلة الضيف - سجل دخولك لحفظ المنتجات
                </p>
              </div>
            )}

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