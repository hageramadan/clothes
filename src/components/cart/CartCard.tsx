// components/cart/CartItemCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Heart } from "lucide-react";
import { FaPlus, FaMinus } from "react-icons/fa6";
import toast from "react-hot-toast";
import { CartItemDisplay } from "./CartPage";
import { useFavoritesContext } from "@/contexts/FavoritesContext";

interface CartItemCardProps {
  item: CartItemDisplay;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
  onSaveForLater?: (id: string) => void;
}

// دالة للحصول على اسم العلامة التجارية
const getBrandName = (brand: string | { name: string } | null | undefined): string => {
  if (!brand) return "";
  if (typeof brand === "string") return brand;
  if (typeof brand === "object" && "name" in brand) return brand.name;
  return "";
};

// دالة لتحويل اسم اللون إلى اللون المناسب للعرض
const getColorCode = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    'ازرق فاتح': '#1e91eb',
    'ازرق داكن': '#252B42',
    'بيج': '#bdae8c',
    'احمر': '#EC221F',
    'زيتوني': '#a4bfa8',
    'رمادي': '#454545',
    'بينك': '#d959c6',
    'بنكي': '#d959c6',
    'اسود': '#000000',
    'ابيض': '#ffffff',
    'اخضر': '#23856D',
    'برتقالي': '#E77C40',
  };
  return colorMap[colorName] || '#cccccc';
};

export function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemCardProps) {
  const { 
    id, 
    productId, 
    name, 
    brand, 
    price, 
    originalPrice, 
    image, 
    color, 
    size, 
    quantity,
    totalPrice  // ✅ إضافة totalPrice من الـ item
  } = item;
  
  // استخدام الـ FavoritesContext
  const { addFavorite, removeFavorite, isFavorite, isMutating } = useFavoritesContext();
  
  const isProductFavorite = isFavorite(productId);
  const brandName = getBrandName(brand);
  const colorCode = getColorCode(color);

  // دالة إضافة/إزالة من المفضلة
  const handleToggleFavorite = async () => {
    if (isMutating) return;
    
    if (isProductFavorite) {
      await removeFavorite(productId);
    } else {
      await addFavorite(productId);
    }
  };

  // دالة معالجة زر الحذف مع Toast مخصص للتأكيد
  const handleRemove = () => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-3" dir="rtl">
        <p className="text-gray-800 text-sm font-medium">
          هل أنت متأكد من حذف <span className="font-bold text-red-500">{name}</span> من سلة التسوق؟
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              onRemove(id);
            }}
            className="px-4 py-1.5 bg-red-500 text-white text-sm rounded-[8px] hover:bg-red-600 transition font-medium"
          >
            نعم، احذف
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-[8px] hover:bg-gray-300 transition font-medium"
          >
            إلغاء
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      style: { maxWidth: '380px', padding: '0', borderRadius: '16px' },
    });
  };

  return (
    <>
      {/* تنسيق الشاشات الكبيرة (md فما فوق) */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#F0EAE9] p-4 hover:shadow-md transition-shadow duration-300">
        <div className="flex gap-4">
          <ProductImageLarge id={parseInt(productId)} image={image} name={name} />
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
              <ProductDetailsLarge
                id={parseInt(productId)}
                name={name}
                brand={brandName}
                color={color}
                colorCode={colorCode}
                size={size}
              />
              <ActionButtonsLarge
                isSaved={isProductFavorite}
                onToggleFavorite={handleToggleFavorite}
                isMutating={isMutating}
                onRemove={handleRemove}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between mt-2 gap-3">
              {/* ✅ عرض total_price بدلاً من price فقط */}
              <ProductPriceLarge 
                price={price} 
                originalPrice={originalPrice}
                totalPrice={totalPrice}
                quantity={quantity}
              />
              <QuantityControlLarge
                id={id}
                quantity={quantity}
                onUpdateQuantity={onUpdateQuantity}
              />
            </div>
          </div>
        </div>
      </div>

      {/* تنسيق الموبايل */}
      <div className="md:hidden bg-white rounded-xl border border-gray-100 p-2 hover:shadow-md transition-shadow duration-300">
        <div className="flex gap-2">
          <ProductImageMobile id={parseInt(productId)} image={image} name={name} />
          <div className="flex-1">
            <div className="flex justify-between items-start gap-1">
              <ProductDetailsMobile
                id={parseInt(productId)}
                name={name}
                brand={brandName}
                color={color}
                colorCode={colorCode}
                size={size}
              />
              <ActionButtonsMobile
                isSaved={isProductFavorite}
                onToggleFavorite={handleToggleFavorite}
                isMutating={isMutating}
                onRemove={handleRemove}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              {/* ✅ عرض total_price بدلاً من price فقط */}
              <ProductPriceMobile 
                price={price} 
                originalPrice={originalPrice}
                totalPrice={totalPrice}
                quantity={quantity}
              />
              <QuantityControlMobile
                id={id}
                quantity={quantity}
                onUpdateQuantity={onUpdateQuantity}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ========== مكونات الشاشات الكبيرة ==========

const ProductImageLarge = ({ id, image, name }: { id: number; image: string; name: string }) => {
  const cleanImageUrl = (url: string) => {
    if (!url) return "/images/placeholder.jpg";
    if (url.startsWith("/storage")) {
      return `https://fashion.admin.t-carts.com${url}`;
    }
    return url;
  };

  return (
    <Link href={`/product/${id}`} className="flex-shrink-0">
      <div className="w-24 h-24 md:w-[124px] md:h-[150px] bg-gray-100 rounded-[4px] overflow-hidden">
        <Image
          src={cleanImageUrl(image)}
          alt={name}
          width={124}
          height={152}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
    </Link>
  );
};

const ProductDetailsLarge = ({
  id,
  name,
  brand,
  color,
  colorCode,
  size,
}: {
  id: number;
  name: string;
  brand: string;
  color: string;
  colorCode: string;
  size: string;
}) => (
  <div>
    <Link href={`/product/${id}`}>
      <h1 className="text-lg font-semibold text-gray-800 hover:text-[#EC221F] transition">
        {name}
      </h1>
    </Link>
    {brand && <p className="text-sm text-gray-500 mt-1">{brand}</p>}
    <div className="flex flex-col gap-3 mt-2 text-sm">
      {color && (
        <span className="font-extrabold flex items-center gap-2">
          اللون: 
          <span className="text-gray-800 font-normal flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full border border-gray-300" 
              style={{ backgroundColor: colorCode }}
            />
            {color}
          </span>
        </span>
      )}
      {size && (
        <span className="font-extrabold">
          المقاس: <span className="text-gray-800 font-normal">{size}</span>
        </span>
      )}
    </div>
  </div>
);

// ✅ تحديث مكون عرض السعر ليعرض total_price
const ProductPriceLarge = ({
  price,
  originalPrice,
  totalPrice,
  quantity,
}: {
  price: number;
  originalPrice?: number;
  totalPrice: number;
  quantity: number;
}) => (
  <div className="flex flex-col gap-1">
    {/* سعر الوحدة (صغير) */}
    <div className="flex items-center gap-1">
      {originalPrice && originalPrice !== price && (
        <div className="text-xs text-gray-400 line-through">
          {originalPrice.toLocaleString()} EGP
        </div>
      )}
      <div className="text-sm text-gray-500">
        {price.toLocaleString()} EGP / قطعة
      </div>
    </div>
    {/* السعر الإجمالي (كبير وواضح) */}
    <div className="flex items-center gap-1">
      <span className="text-xl font-bold text-[#EC221F]">
        {totalPrice.toLocaleString()} EGP
      </span>
      <span className="text-xs text-gray-400">(الإجمالي)</span>
    </div>
  </div>
);

const QuantityControlLarge = ({
  id,
  quantity,
  onUpdateQuantity,
}: {
  id: string;
  quantity: number;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
}) => (
  <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1">
    <button
      onClick={() => onUpdateQuantity(id, quantity - 1)}
      disabled={quantity <= 1}
      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#EC221F] transition rounded-full hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FaMinus className="w-3 h-3" />
    </button>
    <span className="w-8 text-center font-semibold text-gray-800">
      {quantity}
    </span>
    <button
      onClick={() => onUpdateQuantity(id, quantity + 1)}
      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#EC221F] transition rounded-full hover:bg-white"
    >
      <FaPlus className="w-3 h-3" />
    </button>
  </div>
);

const ActionButtonsLarge = ({
  isSaved,
  onToggleFavorite,
  isMutating,
  onRemove,
}: {
  isSaved: boolean;
  onToggleFavorite: () => void;
  isMutating: boolean;
  onRemove: () => void;
}) => (
  <div className="flex items-center gap-3">
    <button
      onClick={onToggleFavorite}
      disabled={isMutating}
      className={`flex items-center gap-1 text-sm transition disabled:opacity-50 ${
        isSaved 
          ? "text-[#EC221F] hover:text-[#c41f1c]" 
          : "text-[#180100] hover:text-[#EC221F]"
      }`}
    >
      <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
      <span>{isSaved ? "ألغاء الحفظ" : "حفظ"}</span>
    </button>
    <span className="text-gray-300">|</span>
    <button
      onClick={onRemove}
      className="flex items-center gap-1 text-sm text-[#180100] hover:text-red-500 transition"
    >
      <Trash2 className="w-4 h-4" />
      <span>حذف</span>
    </button>
  </div>
);

// ========== مكونات الموبايل ==========

const ProductImageMobile = ({ id, image, name }: { id: number; image: string; name: string }) => {
  const cleanImageUrl = (url: string) => {
    if (!url) return "/images/placeholder.jpg";
    if (url.startsWith("/storage")) {
      return `https://fashion.admin.t-carts.com${url}`;
    }
    return url;
  };

  return (
    <Link href={`/product/${id}`} className="flex-shrink-0">
      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
        <Image
          src={cleanImageUrl(image)}
          alt={name}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>
    </Link>
  );
};

const ProductDetailsMobile = ({
  id,
  name,
  brand,
  color,
  colorCode,
  size,
}: {
  id: number;
  name: string;
  brand: string;
  color: string;
  colorCode: string;
  size: string;
}) => (
  <div className="flex-1">
    <Link href={`/product/${id}`}>
      <h1 className="text-sm font-semibold text-gray-800 hover:text-[#EC221F] transition line-clamp-1">
        {name}
      </h1>
    </Link>
    {brand && <p className="text-xs text-gray-500">{brand}</p>}
    <div className="flex gap-2 mt-0.5 text-xs text-gray-600 items-center">
      {color && (
        <div className="flex items-center gap-1">
          <span 
            className="w-2.5 h-2.5 rounded-full border border-gray-300" 
            style={{ backgroundColor: colorCode }}
          />
          <span>{color}</span>
        </div>
      )}
      {color && size && <span>|</span>}
      {size && <span>{size}</span>}
    </div>
  </div>
);

// ✅ تحديث مكون عرض السعر للموبايل
const ProductPriceMobile = ({
  price,
  originalPrice,
  totalPrice,
  quantity,
}: {
  price: number;
  originalPrice?: number;
  totalPrice: number;
  quantity: number;
}) => (
  <div className="flex flex-col">
    {/* السعر الإجمالي (كبير) */}
    <div className="text-sm font-bold text-[#EC221F]">
      {totalPrice.toLocaleString()} EGP
    </div>
    {/* سعر الوحدة (صغير) */}
    <div className="flex items-center gap-1">
      {originalPrice && originalPrice !== price && (
        <div className="text-[9px] text-gray-400 line-through">
          {originalPrice.toLocaleString()}
        </div>
      )}
      <div className="text-[9px] text-gray-400">
        {price.toLocaleString()} / قطعة
      </div>
    </div>
  </div>
);

const QuantityControlMobile = ({
  id,
  quantity,
  onUpdateQuantity,
}: {
  id: string;
  quantity: number;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
}) => (
  <div className="flex items-center gap-0.5 bg-gray-50 rounded-full">
    <button
      onClick={() => onUpdateQuantity(id, quantity - 1)}
      disabled={quantity <= 1}
      className={`w-6 h-6 flex items-center justify-center rounded-full transition ${
        quantity <= 1 ? "text-gray-300" : "text-gray-600 hover:text-[#EC221F]"
      }`}
    >
      <FaMinus className="w-2 h-2" />
    </button>
    <span className="w-5 text-center text-xs font-semibold text-gray-800">
      {quantity}
    </span>
    <button
      onClick={() => onUpdateQuantity(id, quantity + 1)}
      className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-[#EC221F] transition rounded-full"
    >
      <FaPlus className="w-2 h-2" />
    </button>
  </div>
);

const ActionButtonsMobile = ({
  isSaved,
  onToggleFavorite,
  isMutating,
  onRemove,
}: {
  isSaved: boolean;
  onToggleFavorite: () => void;
  isMutating: boolean;
  onRemove: () => void;
}) => (
  <div className="flex  items-end gap-1.5">
    <button
      onClick={onToggleFavorite}
      disabled={isMutating}
      className={`flex items-center gap-0.5 text-xs transition disabled:opacity-50 ${
        isSaved 
          ? "text-[#EC221F]" 
          : "text-gray-400 hover:text-[#EC221F]"
      }`}
    >
      <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
      <span>{isSaved ? "إزالة" : "حفظ"}</span>
    </button>
    <button
      onClick={onRemove}
      className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-red-500 transition"
    >
      <Trash2 className="w-3.5 h-3.5" />
      <span>حذف</span>
    </button>
  </div>
);