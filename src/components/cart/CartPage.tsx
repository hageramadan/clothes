// components/cart/CartPage.tsx
"use client";

import { useState, useEffect } from "react";
import { CartItemCard } from "./CartCard";
import { CartSummary } from "./CartSummary";
import { CartEmpty } from "./CartEmpty";
import { useCartContext } from "@/contexts/CartContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Link from "next/link";
import { ChevronRight, Info } from "lucide-react"; // ✅ إضافة Info

export interface Ibrand {
  id: number;
  name: string;
}

// واجهة بيانات المنتج في السلة للعرض
export interface CartItemDisplay {
  id: string;
  productId: string;
  name: string;
  brand: Ibrand;
  price: number;
  originalPrice?: number;
  image: string; // ستكون هذه صورة الـ variant أو الصورة الرئيسية
  variantImage?: string | null; // صورة الـ variant المختارة
  productImage?: string; // الصورة الرئيسية للمنتج
  color: string;
  size: string;
  quantity: number;
  discount?: number;
  totalPrice: number;
}

export function CartPage() {
  const { cart, isLoading, updateQuantity, removeItem, refetchCart, isGuest } = useCartContext(); // ✅ إضافة isGuest
  const [cartItems, setCartItems] = useState<CartItemDisplay[]>([]);

  // ✅ عدد العناصر (المنتجات المختلفة) وليس الكميات
  const itemsCount = cart?.items?.length || 0;

  // استخراج اللون والمقاس من الـ variant
  const extractColorAndSize = (variant: any) => {
    let color = "";
    let size = "";
    
    if (variant && variant.attributes && Array.isArray(variant.attributes)) {
      for (const attr of variant.attributes) {
        const attrName = attr.attribute_type?.name;
        if (attrName === "اللون") {
          color = attr.value || "";
        } else if (attrName === "مقاس" || attrName === "المقاس") {
          size = attr.value || "";
        }
      }
    }
    
    return { color, size };
  };

  // الحصول على brand object
  const getBrandObject = (product: any): Ibrand => {
    // إذا كان brand موجود كـ object كامل
    if (product.brand && typeof product.brand === 'object' && product.brand.id && product.brand.name) {
      return {
        id: product.brand.id,
        name: product.brand.name
      };
    }
    // إذا كان brand مجرد اسم (string)
    if (product.brand && typeof product.brand === 'string') {
      return {
        id: 0,
        name: product.brand
      };
    }
    // القيمة الافتراضية
    return {
      id: 0,
      name: "ماركة"
    };
  };

  const cleanImageUrl = (url: string | null | undefined) => {
    if (!url) return "/images/placeholder.jpg";
    if (url.startsWith("/storage")) {
      return `https://dukanah.admin.t-carts.com${url}`;
    }
    return url;
  };

  // تحويل بيانات السلة من الـ API إلى الشكل المطلوب للعرض
  useEffect(() => {
    if (cart && cart.items && cart.items.length > 0) {
      const transformedItems: CartItemDisplay[] = cart.items.map((item) => {
        const { color, size } = extractColorAndSize(item.variant);
        
        // ✅ الأولوية: صورة الـ variant إذا وجدت، وإلا استخدم الصورة الرئيسية للمنتج
        const variantImage = item.variant?.variant_image || null;
        const productMainImage = item.product.images?.[0] || "";
        
        // ✅ نختار الصورة التي نعرضها (الأولوية لصورة الـ variant)
        const displayImage = variantImage || productMainImage;
        
        return {
          id: item.id.toString(),
          productId: item.product.id.toString(),
          name: item.product.name,
          brand: getBrandObject(item.product),
          price: item.final_price,
          originalPrice: item.price ,
          image: cleanImageUrl(displayImage), 
          variantImage: variantImage ? cleanImageUrl(variantImage) : null, 
          productImage: cleanImageUrl(productMainImage), 
          color: color,
          size: size,
          quantity: item.quantity,
          discount: item.discount_amount || undefined,
          totalPrice: item.total_price,
        };
      });
      
      setCartItems(transformedItems);
    } else {
      setCartItems([]);
    }
  }, [cart]);

  // ✅ حساب المجاميع من السلة مباشرة
  const subtotal = cart?.subtotal || 0;
  const totalDiscount = cart?.discount_amount || 0;
  const deliveryFee = cart?.delivery_fee || 0;
  const total = cart?.total_amount || 0;
  
  // ✅ استخراج بيانات الكوبون من السلة مباشرة
  const promoDiscount = cart?.coupon_discount || 0;
  const promoCode = cart?.applied_coupon_code || "";

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateQuantity(parseInt(cartItemId), newQuantity);
  };

  const handleRemoveItem = async (cartItemId: string) => {
    await removeItem(parseInt(cartItemId));
  };

  const saveForLater = (id: string) => {
  };

  const applyPromoCode = async (code: string, discount: number) => {
    // ✅ إعادة تحميل السلة للحصول على البيانات المحدثة من الـ API
    await refetchCart();
  };

  const removePromoCode = async () => {
    // ✅ إعادة تحميل السلة للحصول على البيانات المحدثة من الـ API
    await refetchCart();
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="جاري تحميل السلة..." />
      </div>
    );
  }

  if (!cart || cartItems.length === 0) {
    return <CartEmpty />;
  }

  return (
    <div className="bg-gradient-to-l min-h-[80vh] from-[#bdcbf12a] to-[#feecea3b]">
      <div className="container page-with-padding">
        <PageHeader title="سلة التسوق" itemCount={itemsCount} />

       

        <div className="grid grid-cols-1 lg:grid-cols-3 md:gap-8 gap-4">
          <div className="lg:col-span-2 space-y-4 bg-white rounded-[16px] p-4 mb-5">
            {cartItems.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
                onSaveForLater={saveForLater}
              />
            ))}
          </div>

          <div className="lg:col-span-1">
            <CartSummary
              subtotal={subtotal}
              totalDiscount={totalDiscount}
              promoDiscount={promoDiscount}
              promoCode={promoCode}
              deliveryFee={deliveryFee}
              total={total}
              onApplyPromoCode={applyPromoCode}
              onRemovePromoCode={removePromoCode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// مكون عنوان الصفحة
const PageHeader = ({ title, itemCount }: { title: string; itemCount: number }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
      <Link href="/" className="hover:text-[#EC221F]">الرئيسية</Link>
      <ChevronRight className="w-4 h-4" />
      <span className="text-[#EC221F]">{title}</span>
      <span className="text-gray-400">({itemCount} منتجات)</span>
    </div>
  </div>
);