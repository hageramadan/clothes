// app/product/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ProductDetails } from '@/components/products/ProductDetails';
import { 
  getProductById, 
  extractColorsFromProduct, 
  extractSizesFromProduct,
  getFinalPrice,
  getOriginalPrice,
  getDiscountPercentage,
  ProductData 
} from '@/services/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { YouMayAlsoLike } from '@/components/home/YouMayAlsoLike';
import { CustomerReviews } from '@/components/products/CustomerReviews';

// تحويل بيانات الـ API إلى الشكل المطلوب للـ ProductDetails
const transformProductData = (apiProduct: ProductData) => {
  const colors = extractColorsFromProduct(apiProduct);
  const sizes = extractSizesFromProduct(apiProduct);
  const finalPrice = getFinalPrice(apiProduct);
  const originalPrice = getOriginalPrice(apiProduct);
  const discountPercentage = getDiscountPercentage(apiProduct);
  
  // تنظيف رابط الصورة
  const cleanImageUrl = (url: string) => {
    if (!url) return "/images/placeholder.jpg";
    if (url.startsWith("/storage")) {
      return `https://dukanah.admin.t-carts.com${url}`;
    }
    return url;
  };

  // معالجة الصور
  const processedImages = apiProduct.images?.map(cleanImageUrl) || ["/images/placeholder.jpg"];
  
  // إذا لم يكن هناك ألوان، أضف ألوان افتراضية
  const finalColors = colors.length > 0 ? colors : [
    { name: "أحمر", code: "#EC221F" },
    { name: "أزرق", code: "#252B42" },
    { name: "أخضر", code: "#23856D" },
  ];
  
  // إذا لم يكن هناك مقاسات، أضف مقاسات افتراضية
  const finalSizes = sizes.length > 0 ? sizes : ["S", "M", "L", "XL"];
  
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    description: apiProduct.description,
    price: finalPrice,
    originalPrice: originalPrice || undefined,
    discount: discountPercentage || undefined,
    brand: apiProduct.brand?.name || apiProduct.category?.name || "ماركة",
    category: apiProduct.category?.name || "منتج",
    images: processedImages,
    colors: finalColors,
    sizes: finalSizes,
    rating: apiProduct.avg_rating || 4.5,
    reviewsCount: apiProduct.total_reviews || 0,
    sku: `SKU-${apiProduct.id}`,
    availability: apiProduct.is_active && (apiProduct.quantity > 0 || apiProduct.has_variants),
    // ✅ إضافة variants و has_variants (الأهم)
    variants: apiProduct.variants || [],
    has_variants: apiProduct.has_variants || false,
       isBestSeller: apiProduct.is_active,
    is_active: apiProduct.is_active,
  };
};

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);

  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params;
      setProductId(unwrappedParams.id);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const apiProduct = await getProductById(productId);
        
        if (apiProduct) {
          const transformedProduct = transformProductData(apiProduct);
          setProduct(transformedProduct);
        } else {
          setError("المنتج غير موجود");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("حدث خطأ أثناء تحميل المنتج");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen page-with-padding flex items-center justify-center">
        <LoadingSpinner size="lg" text="" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen page-with-padding flex flex-col items-center justify-center">
        <p className="text-red-500 text-xl mb-4">{error || "المنتج غير موجود"}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-[#EC221F] text-white px-6 py-2 rounded-[8px] "
        >
          العودة إلى الرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className='page-with-padding'>
      <ProductDetails product={product} />
      <CustomerReviews productId={parseInt(productId!)} />
      <YouMayAlsoLike />
    </div>
  );
}