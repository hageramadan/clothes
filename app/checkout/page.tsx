"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronRight, CheckCircle, User, Mail, Phone, MapPin, Building, Home, AlertCircle, Eye, EyeOff } from "lucide-react";
import {
  CartItem,
  CheckoutFormData,
  CartSummary,
} from "@/components/checkout/types";
import { useCartContext } from "@/contexts/CartContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// استيراد المكونات
import ContactInfoForm from "@/components/checkout/ContactInfoForm";
import DeliveryMethodForm from "@/components/checkout/DeliveryMethodForm";
import DeliveryAddressForm from "@/components/checkout/DeliveryAddressForm";
import PaymentMethodForm from "@/components/checkout/PaymentMethodForm";
import NotesForm from "@/components/checkout/NotesForm";
import OrderSummary from "@/components/checkout/OrderSummary";

const API_URL = "https://dukanah.admin.t-carts.com/api";

// دالة جلب التوكن
const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

// ✅ دالة جلب الـ guest_token
const getGuestToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("guest_cart_token");
  }
  return null;
};

// دالة جلب الهيدرز مع التوكن و X-Guest-Token
const getHeaders = (): HeadersInit => {
  const token = getToken();
  const guestToken = getGuestToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  if (guestToken) {
    headers["X-Guest-Token"] = guestToken;
  }
  
  return headers;
};

// ✅ دالة جلب السلة مع البارامترات (delivery_method و city_id)
const fetchCartWithParams = async (
  deliveryMethod: string,
  cityId?: string,
): Promise<any> => {
  try {
    const params = new URLSearchParams();

    if (deliveryMethod === "delivery") {
      params.append("delivery_method", "delivery");
    } else {
      params.append("delivery_method", "receive");
    }

    if (deliveryMethod === "delivery" && cityId) {
      params.append("city_id",  String(cityId));
    }

    const url = `${API_URL}/cart/preview?${params.toString()}`;
    console.log("🟢 Fetching URL:", url);

    const response = await fetch(url, {
      headers: getHeaders(),
    });

    const data = await response.json();
    console.log("🟢 API Response:", data);

    if (data.result === true && data.data && data.data.cart) {
      console.log("🟢 Returning cart data:", data.data.cart);
      return data.data.cart;
    }

    return null;
  } catch (error) {
    console.error("❌ Error fetching cart with params:", error);
    throw error;
  }
};

// ✅ دالة التحقق من رقم الهاتف حسب الدولة
const validatePhoneNumberByCountry = (
  phoneNumber: string,
  countryCode: string,
): { isValid: boolean; error: string } => {
  const cleanNumber = phoneNumber.replace(/[\s\-]/g, "");

  if (!cleanNumber) {
    return { isValid: false, error: "رقم الهاتف مطلوب" };
  }

  if (!/^\d+$/.test(cleanNumber)) {
    return { isValid: false, error: "يجب أن يحتوي رقم الهاتف على أرقام فقط" };
  }

  const rules: Record<
    string,
    {
      minLength: number;
      maxLength: number;
      startsWith: string[];
      pattern: RegExp;
      name: string;
    }
  > = {
    "+20": {
      name: "مصر",
      minLength: 11,
      maxLength: 11,
      startsWith: ["010", "011", "012", "015"],
      pattern: /^01[0125][0-9]{8}$/,
    },
    "+966": {
      name: "السعودية",
      minLength: 9,
      maxLength: 9,
      startsWith: ["05"],
      pattern: /^05[0-9]{8}$/,
    },
    "+964": {
      name: "العراق",
      minLength: 11,
      maxLength: 11,
      startsWith: ["07"],
      pattern: /^07[0-9]{9}$/,
    },
    "+971": {
      name: "الإمارات",
      minLength: 9,
      maxLength: 9,
      startsWith: ["05"],
      pattern: /^05[0-9]{8}$/,
    },
  };

  const rule = rules[countryCode];
  if (!rule) {
    return { isValid: false, error: "كود الدولة غير صالح" };
  }

  if (cleanNumber.length !== rule.minLength) {
    return {
      isValid: false,
      error: `رقم الهاتف في ${rule.name} يجب أن يكون ${rule.minLength} أرقام (الطول الحالي: ${cleanNumber.length})`,
    };
  }

  const startsWithValid = rule.startsWith.some((prefix) =>
    cleanNumber.startsWith(prefix),
  );
  if (!startsWithValid) {
    return {
      isValid: false,
      error: `رقم الهاتف في ${rule.name} يجب أن يبدأ بـ (${rule.startsWith.join(" أو ")})`,
    };
  }

  if (!rule.pattern.test(cleanNumber)) {
    return {
      isValid: false,
      error: `رقم الهاتف غير صحيح لدولة ${rule.name}`,
    };
  }

  return { isValid: true, error: "" };
};

// دالة إنشاء الطلب
const createOrder = async (orderData: any): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/orders/checkout`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error creating order:", error);
    throw error;
  }
};

// تحويل بيانات السلة
const transformCartItems = (cart: any): CartItem[] => {
  if (!cart || !cart.items) return [];

  return cart.items.map((item: any) => {
    let color = "";
    let size = "";

    if (item.variant && item.variant.attributes) {
      for (const attr of item.variant.attributes) {
        const attrName = attr.attribute_type?.name;
        if (attrName === "اللون") {
          color = attr.value || "";
        } else if (attrName === "مقاس" || attrName === "المقاس") {
          size = attr.value || "";
        }
      }
    }

    let brandName = "ماركة";
    if (item.product.brand) {
      if (typeof item.product.brand === "string") {
        brandName = item.product.brand;
      } else if (
        typeof item.product.brand === "object" &&
        item.product.brand.name
      ) {
        brandName = item.product.brand.name;
      }
    }

    const cleanImageUrl = (url: string) => {
      if (!url) return "/images/placeholder.jpg";
      if (url.startsWith("/storage")) {
        return `https://dukanah.admin.t-carts.com${url}`;
      }
      return url;
    };

    return {
      id: item.id,
      name: item.product.name,
      brand: brandName,
      price: item.final_price,
      originalPrice: item.product.pricing?.has_discount
        ? item.product.pricing.price
        : undefined,
      image: cleanImageUrl(item.product.images?.[0] || ""),
      color: color,
      size: size,
      quantity: item.quantity,
      discount: item.discount_amount || undefined,
    };
  });
};

// ✅ نوع بيانات الطلب الناجح
interface CompletedOrderResult {
  orderNumber: string | number;
  itemsCount: number;
  total: number;
}

// ✅ واجهة بيانات إنشاء الحساب
interface AccountData {
  email: string;
  phone: string;
  name: string;
  password: string;
  password_confirmation: string;
}

export default function CheckoutPage() {
  const {
    cart,
    isLoading: cartLoading,
    refetchCart,
    updateCart,
    isGuest,
  } = useCartContext();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [orderResult, setOrderResult] = useState<CompletedOrderResult | null>(
    null,
  );
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

  // ✅ حالة خيار إنشاء حساب
  const [createAccount, setCreateAccount] = useState(false);
  const [showAccountPopup, setShowAccountPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountData, setAccountData] = useState<AccountData>({
    email: "",
    phone: "",
    name: "",
    password: "",
    password_confirmation: "",
  });
  const [accountErrors, setAccountErrors] = useState<Record<string, string>>({});

  // ✅ استخدم useRef لتخزين cityId بشكل فوري
  const selectedCityIdRef = useRef<string | null>(null);
  
  // ✅ منع الاستدعاء المتكرر للـ API
  const isFetchingRef = useRef<boolean>(false);
  
  // ✅ تتبع آخر قيمة لـ deliveryMethod لمنع الاستدعاء المتكرر
  const lastDeliveryMethodRef = useRef<string | null>(null);
  
  // ✅ تتبع آخر قيمة لـ cityId لمنع الاستدعاء المتكرر
  const lastFetchedCityIdRef = useRef<string | null>(null);

  const cartItems = useMemo(() => transformCartItems(cart), [cart]);

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    phone: "",
    phoneNumber: "",
    phoneCountryCode: "+20",
    deliveryAddress: {
      street: "",
      city: "",
      governorate: "",
      buildingNo: "",
      floorNo: "",
      apartmentNo: "",
    },
    notes: "",
    deliveryMethod: "delivery",
    paymentMethod: "cash",
  });

  const cartSummary: CartSummary = useMemo(() => {
    const subtotal = cart?.subtotal || 0;
    const discount = cart?.discount_amount || 0;
    
    let deliveryFee;
    
    if (formData.deliveryMethod === "pickup") {
      deliveryFee = null;
    } else if (formData.deliveryMethod === "delivery") {
      if (!selectedCityId) {
        deliveryFee = undefined;
      } else {
        if (cart?.delivery_fee !== undefined && cart?.delivery_fee !== null) {
          deliveryFee = cart.delivery_fee;
        } else {
          deliveryFee = cart ? undefined : 0;
        }
      }
    } else {
      deliveryFee = undefined;
    }
    
    const total = cart?.total_amount || 0;

    return {
      subtotal,
      discount,
      deliveryFee,
      total,
    };
  }, [cart, formData.deliveryMethod, selectedCityId]);

  // ✅ التعديل المهم: لا تقم بإعادة التوجيه إلى الرئيسية عند فراغ السلة إذا كان الطلب قد تم بنجاح
  useEffect(() => {
    if (isOrderCompleted) return;

    if (!cartLoading && (!cart || cart.items?.length === 0)) {
      router.replace("/");
    }
  }, [cart, cartLoading, router, isOrderCompleted]);
// ✅ استدعاء الـ API عند تغيير طريقة التوصيل أو المدينة (محسّن)
useEffect(() => {
  if (isOrderCompleted) return;
  if (!cart || cart.items?.length === 0) return;
  
  if (isFetchingRef.current) return;

  const currentDeliveryMethod = formData.deliveryMethod;
  // ✅ استخدم الـ ref بدلاً من الـ state
  const currentCityId = selectedCityIdRef.current;

  // ✅ التحقق: هل تغيرت طريقة التوصيل أم المدينة؟
  const deliveryMethodChanged = lastDeliveryMethodRef.current !== currentDeliveryMethod;
  const cityIdChanged = lastFetchedCityIdRef.current !== currentCityId;

  // ✅ إذا لم يتغير شيء، لا نستدعي الـ API
  if (!deliveryMethodChanged && !cityIdChanged) {
    console.log("🟢 Skipping - no changes detected");
    return;
  }

  // ✅ تحديث القيم المخزنة
  lastDeliveryMethodRef.current = currentDeliveryMethod;
  lastFetchedCityIdRef.current = currentCityId;

  console.log(`🟢 Changes detected - deliveryMethod: ${currentDeliveryMethod}, cityId: ${currentCityId}`);

  const fetchCart = async () => {
    try {
      isFetchingRef.current = true;
      
      // ✅ إذا كانت طريقة التوصيل delivery ولدينا cityId
      if (currentDeliveryMethod === "delivery" && currentCityId) {
        console.log(`🟢 Fetching cart with delivery and city_id: ${currentCityId}`);
        const cartData = await fetchCartWithParams("delivery", currentCityId);
        if (cartData) {
          updateCart(cartData);
        }
      } 
      // ✅ إذا كانت طريقة التوصيل pickup
      else if (currentDeliveryMethod === "pickup") {
        console.log("🟢 Fetching cart with pickup (receive)");
        const cartData = await fetchCartWithParams("pickup");
        if (cartData) {
          updateCart(cartData);
        }
      } 
      // ✅ إذا كانت delivery ولكن لم يتم اختيار مدينة بعد
      else if (currentDeliveryMethod === "delivery" && !currentCityId) {
        console.log("🟢 Fetching cart with delivery (no city yet)");
        const cartData = await fetchCartWithParams("delivery");
        if (cartData) {
          updateCart(cartData);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching cart:", error);
    } finally {
      isFetchingRef.current = false;
    }
  };

  // ✅ تأخير بسيط لتجنب الاستدعاءات المتكررة أثناء الكتابة
  const timeoutId = setTimeout(fetchCart, 300);
  
  return () => {
    clearTimeout(timeoutId);
    isFetchingRef.current = false;
  };
}, [formData.deliveryMethod, selectedCityId, isOrderCompleted, cart, updateCart]);
// ✅ لا تزال dependencies تحتوي على selectedCityId لتشغيل الـ useEffect عند تغيره

  const handleFormChange = useCallback((data: Partial<CheckoutFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  // ✅ دالة لاستقبال address_id بعد حفظ العنوان
  const handleAddressSaved = useCallback(
    async (address: any) => {
      if (isFetchingRef.current) return;

      if (address && address.id) {
        setSelectedAddressId(address.id);
        toast.success("تم حفظ العنوان بنجاح");

        try {
          let cityId = selectedCityIdRef.current;

          if (!cityId) {
            cityId = selectedCityId;
          }

          if (!cityId) {
            cityId = address.city?.id || address.city_id;
          }

          if (cityId && formData.deliveryMethod === "delivery") {
            isFetchingRef.current = true;
            const cartData = await fetchCartWithParams(
              "delivery",
              String(cityId),
            );
            if (cartData) {
              updateCart(cartData);
            }
          }
        } catch (error) {
          console.error("❌ Error updating cart after address save:", error);
        } finally {
          isFetchingRef.current = false;
        }
      }
    },
    [selectedCityId, formData.deliveryMethod, updateCart],
  );

  // ✅ دالة لاستقبال address_id من عنوان محفوظ تم اختياره
  const handleAddressSelected = useCallback(
    async (addressId: number) => {
      if (isFetchingRef.current) return;
      
      setSelectedAddressId(addressId);

      try {
        const cityId = selectedCityIdRef.current;

        if (cityId && formData.deliveryMethod === "delivery") {
          isFetchingRef.current = true;
          const cartData = await fetchCartWithParams(
            "delivery",
            String(cityId),
          );
          if (cartData) {
            updateCart(cartData);
          }
        }
      } catch (error) {
        console.error("❌ Error updating cart after address selection:", error);
      } finally {
        isFetchingRef.current = false;
      }
    },
    [formData.deliveryMethod, updateCart],
  );

  const handleCitySelected = useCallback((cityId: string) => {
  console.log(`🟢 City selected: ${cityId}`);
  selectedCityIdRef.current = cityId; // ✅ تحديث الـ ref أولاً
  setSelectedCityId(cityId); // ✅ ثم تحديث الـ state
}, []);

  // ✅ دالة فتح Popup إنشاء الحساب
  const handleOpenAccountPopup = useCallback(() => {
    // تعبئة البيانات المبدئية من النموذج
    setAccountData((prev) => ({
      ...prev,
      name: formData.fullName || "",
      phone: formData.phone || "",
    }));
    setAccountErrors({});
    setShowAccountPopup(true);
  }, [formData.fullName, formData.phone]);

  // ✅ دالة إغلاق Popup إنشاء الحساب
  const handleCloseAccountPopup = useCallback(() => {
    setShowAccountPopup(false);
    setCreateAccount(false);
    setAccountErrors({});
  }, []);

  // ✅ دالة التحقق من بيانات الحساب
  const validateAccountData = (): boolean => {
    const errors: Record<string, string> = {};

    if (!accountData.email.trim()) {
      errors.email = "البريد الإلكتروني مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountData.email)) {
      errors.email = "البريد الإلكتروني غير صحيح";
    }

    if (!accountData.phone.trim()) {
      errors.phone = "رقم الهاتف مطلوب";
    } else {
      const phoneValidation = validatePhoneNumberByCountry(
        accountData.phone.replace(/[\s\-]/g, ""),
        "+20",
      );
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.error;
      }
    }

    if (!accountData.name.trim()) {
      errors.name = "الاسم مطلوب";
    } else if (accountData.name.trim().length < 3) {
      errors.name = "الاسم يجب أن يكون 3 أحرف على الأقل";
    }

    if (!accountData.password) {
      errors.password = "كلمة المرور مطلوبة";
    } else if (accountData.password.length < 8) {
      errors.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
    }

    if (!accountData.password_confirmation) {
      errors.password_confirmation = "تأكيد كلمة المرور مطلوب";
    } else if (accountData.password !== accountData.password_confirmation) {
      errors.password_confirmation = "كلمات المرور غير متطابقة";
    }

    setAccountErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ دالة تأكيد إنشاء الحساب
  const handleConfirmAccount = useCallback(() => {
    if (validateAccountData()) {
      setCreateAccount(true);
      setShowAccountPopup(false);
      toast.success("سيتم إنشاء حسابك بعد إتمام الطلب");
    }
  }, [accountData]);

// ✅ تحضير بيانات الطلب (معدل لدعم الضيف)
const prepareOrderData = useCallback(() => {
  const paymentMethodMap: Record<string, string> = {
    cash: "cash",
    card: "online",
    mada: "online",
    wallet: "online",
  };

  const deliveryMethodMap: Record<string, string> = {
    delivery: "delivery",
    pickup: "receive",
  };

  // ✅ بناء orderData الأساسي
  const orderData: any = {
    payment_method: paymentMethodMap[formData.paymentMethod] || "cash",
    delivery_method: deliveryMethodMap[formData.deliveryMethod] || "delivery",
    notes: formData.notes || "",
    create_account: createAccount,
  };

  // ✅ إذا كان الضيف يريد إنشاء حساب، أضف بيانات الحساب
  if (createAccount && isGuest) {
    orderData.account = {
      email: accountData.email,
      phone: accountData.phone,
      name: accountData.name,
      password: accountData.password,
      password_confirmation: accountData.password_confirmation,
    };
  }

  // ✅ إضافة payment_gateway فقط إذا كانت طريقة الدفع هي المحفظة
  if (formData.paymentMethod === "wallet") {
    orderData.payment_gateway = "wallet";
  }

  // ✅ بيانات إضافية للضيف
  if (isGuest) {
    const guestEmail = formData.email || accountData.email || "";
    
    // ✅ بناء additional_data الأساسي (بدون city_id)
    const additionalData: any = {
      name: formData.fullName,
      phone: formData.phone,
      email: guestEmail,
      street: formData.deliveryAddress.street || "N/A",
      building: formData.deliveryAddress.buildingNo || "N/A",
      floor: formData.deliveryAddress.floorNo || "N/A",
      apartment: formData.deliveryAddress.apartmentNo || "N/A",
    };

    // ✅ إضافة city_id فقط إذا كانت طريقة التوصيل هي delivery
    if (formData.deliveryMethod === "delivery") {
      // ✅ استخدم الـ ref بدلاً من الـ state
      const cityId = selectedCityIdRef.current || "1";
      console.log(`🟢 Using cityId from ref: ${cityId}`);
      additionalData.city_id = cityId; // ✅ string
    }

    orderData.additional_data = additionalData;
  }

  // ✅ إذا كان المستخدم مسجل دخول ولديه عنوان
  if (!isGuest && formData.deliveryMethod === "delivery") {
    if (selectedAddressId) {
      orderData.address_id = selectedAddressId;
    }
  }

  console.log("🟢 Order Data:", orderData);
  return orderData;
}, [formData, selectedAddressId, createAccount, isGuest, accountData, selectedCityIdRef]);
// ✅ أزل selectedCityId من dependencies واستخدم selectedCityIdRef
  // ✅ إرسال الطلب (معدل)
  const handleSubmit = async () => {
    if (isSubmitting || isOrderCompleted) return;

    // ✅ التحقق من البيانات الأساسية
    if (!formData.fullName.trim()) {
      toast.error("الرجاء إدخال الاسم الكامل");
      return;
    }

    const phoneValidation = validatePhoneNumberByCountry(
      formData.phoneNumber ||
        formData.phone.replace(formData.phoneCountryCode || "", ""),
      formData.phoneCountryCode || "+20",
    );

    if (!phoneValidation.isValid) {
      toast.error(phoneValidation.error);
      return;
    }

    if (formData.deliveryMethod === "delivery" && !selectedAddressId && isGuest) {
      // ✅ للضيف: التحقق من وجود بيانات العنوان في formData
      const address = formData.deliveryAddress;
      if (!address.street || !address.city) {
        toast.error("الرجاء إدخال بيانات العنوان بالكامل");
        return;
      }
    }

    if (formData.deliveryMethod === "delivery" && !selectedAddressId && !isGuest) {
      toast.error("الرجاء حفظ العنوان أو اختيار عنوان محفوظ أولاً");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = prepareOrderData();
      const response = await createOrder(orderData);

      if (response.result === true && response.data) {
        const completedOrder: CompletedOrderResult = {
          orderNumber: response.data.order_number,
          itemsCount: cartItems.length,
          total: response.data.total_amount,
        };

        setOrderResult(completedOrder);
        setIsOrderCompleted(true);
        setShowSuccessPopup(true);

        refetchCart().catch((err) => {
          console.error("❌ Error refetching cart after order success:", err);
        });
      } else {
        toast.error(response.message || "حدث خطأ أثناء إنشاء الطلب");
      }
    } catch (error) {
      console.error("❌ Error creating order:", error);
      toast.error("حدث خطأ أثناء إنشاء الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePopup = useCallback(() => {
    setShowSuccessPopup(false);
    router.push("/");
  }, [router]);

  const handleGoToOrders = useCallback(() => {
    setShowSuccessPopup(false);
    router.push("/account/orders");
  }, [router]);

  const handleGoToHome = useCallback(() => {
    setShowSuccessPopup(false);
    router.push("/");
  }, [router]);

  if (cartLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="" />
      </div>
    );
  }

  if (!isOrderCompleted && (!cart || cart.items?.length === 0)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">سلة التسوق فارغة</p>
        <Link
          href="/products"
          className="bg-[#EC221F] text-white px-6 py-2 rounded-[8px] "
        >
          تسوق الآن
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-l min-h-[80vh] from-[#bdcbf12a] to-[#feecea3b]">
      <div className="container page-with-padding mx-auto mb-3">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            إتمام الطلب
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/cart" className="hover:text-[#EC221F] transition">
              سلة التسوق
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#EC221F] font-medium">إتمام الطلب</span>
          </div>
          
        
         
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ContactInfoForm
              formData={formData}
              onFormChange={handleFormChange}
              isGuest={isGuest}
            />

            <DeliveryMethodForm
              deliveryMethod={formData.deliveryMethod}
              onDeliveryMethodChange={(method) =>
                handleFormChange({ deliveryMethod: method })
              }
            />

           {formData.deliveryMethod === "delivery" && (
  <DeliveryAddressForm
    show={true}
    addressData={formData.deliveryAddress}
    onAddressChange={(address) =>
      handleFormChange({ deliveryAddress: address })
    }
    onAddressSaved={handleAddressSaved}
    onAddressSelected={handleAddressSelected}
    onCitySelected={handleCitySelected}
    isGuest={isGuest} // ✅ أرسل isGuest
  />
)}

            <PaymentMethodForm
              paymentMethod={formData.paymentMethod}
              onPaymentMethodChange={(method) =>
                handleFormChange({ paymentMethod: method as any })
              }
            />

            <NotesForm
              notes={formData.notes}
              onNotesChange={(notes) => handleFormChange({ notes })}
            />

            {/* ✅ خيار إنشاء حساب للضيف */}
            {isGuest && (
              <div className="bg-white rounded-xl p-4 border border-gray-200 mb-2 md:mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        إنشاء حساب
                      </p>
                     
                    </div>
                  </div>
                  <button
                    onClick={handleOpenAccountPopup}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                      createAccount
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    {createAccount ? "✅ تم الاختيار" : "إنشاء حساب"}
                  </button>
                </div>
               
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isOrderCompleted}
              className="hidden md:block  w-full bg-black text-white py-3 rounded-xl font-semibold text-lg transition disabled:opacity-50"
            >
              {isSubmitting ? "جاري المعالجة..." : "تأكيد الطلب"}
            </button>
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              cartItems={cartItems}
              cartSummary={cartSummary}
              deliveryMethod={formData.deliveryMethod}
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isOrderCompleted}
              className="md:hidden block w-full bg-black text-white py-3 rounded-xl font-semibold text-lg transition disabled:opacity-50"
            >
              {isSubmitting ? "جاري المعالجة..." : "تأكيد الطلب"}
            </button>
          </div>
           
        </div>
      </div>

      {/* ✅ Popup إنشاء الحساب */}
      {showAccountPopup && (
        <AccountPopup
          isOpen={showAccountPopup}
          onClose={handleCloseAccountPopup}
          onConfirm={handleConfirmAccount}
          accountData={accountData}
          setAccountData={setAccountData}
          errors={accountErrors}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
        />
      )}

      {showSuccessPopup && orderResult && (
        <SuccessPopup
          isOpen={showSuccessPopup}
          onClose={handleClosePopup}
          onGoToOrders={handleGoToOrders}
          onGoToHome={handleGoToHome}
          orderNumber={orderResult.orderNumber}
          orderDetails={{
            itemsCount: orderResult.itemsCount,
            total: orderResult.total,
          }}
          isGuest={isGuest}
        />
      )}
    </div>
  );
}

// ✅ Popup إنشاء الحساب
interface AccountPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  accountData: AccountData;
  setAccountData: (data: AccountData | ((prev: AccountData) => AccountData)) => void;
  errors: Record<string, string>;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
}

function AccountPopup({
  isOpen,
  onClose,
  onConfirm,
  accountData,
  setAccountData,
  errors,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}: AccountPopupProps) {
  if (!isOpen) return null;

  const handleChange = (field: keyof AccountData, value: string) => {
    setAccountData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 text-center">
            إنشاء حساب جديد
          </h3>
          <p className="text-sm text-gray-500 text-center mt-1">
            أدخل بياناتك لإنشاء حساب وتتبع طلبك
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* الاسم */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الاسم الكامل <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={accountData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="أدخل اسمك الكامل"
                className={`w-full pr-10 pl-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EC221F] transition ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* البريد الإلكتروني */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              البريد الإلكتروني <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={accountData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="example@email.com"
                className={`w-full pr-10 pl-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EC221F] transition ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* رقم الهاتف */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رقم الهاتف <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={accountData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="01012345678"
                className={`w-full pr-10 pl-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EC221F] transition ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          {/* كلمة المرور */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              كلمة المرور <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={accountData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="••••••••"
                className={`w-full pr-10 pl-10 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EC221F] transition ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* تأكيد كلمة المرور */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تأكيد كلمة المرور <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={accountData.password_confirmation}
                onChange={(e) => handleChange("password_confirmation", e.target.value)}
                placeholder="••••••••"
                className={`w-full pr-10 pl-10 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EC221F] transition ${
                  errors.password_confirmation ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password_confirmation && (
              <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-[#EC221F] text-white py-2.5 rounded-xl font-medium hover:bg-[#d41c19] transition"
          >
            إنشاء الحساب
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ Popup النجاح
interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToOrders: () => void;
  onGoToHome: () => void;
  orderNumber: string | number;
  orderDetails: {
    itemsCount: number;
    total: number;
  };
  isGuest:boolean
}

// ✅ Popup النجاح - إخفاء زر "متابعة الطلبات" للضيف
function SuccessPopup({
  isOpen,
  onClose,
  onGoToOrders,
  onGoToHome,
  orderNumber,
  orderDetails,
  isGuest = false, // ✅ أضف هذا
}: SuccessPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
        <div className="p-6 text-center border-b border-gray-100">
          <div className="flex justify-center mb-3">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            تم إتمام طلبك بنجاح
          </h3>
          <p className="text-gray-500 text-sm mt-2">
            شكراً لتسوقك معنا، طلبك قيد التحضير الآن.
          </p>
        </div>

        <div className="p-1">
          <div className="bg-gray-50 rounded-xl p-2 text-center mb-2">
            <p className="text-xs text-gray-500 mb-1">رقم الطلب</p>
            <p className="text-xl font-bold text-gray-800">#{orderNumber}</p>
          </div>
        </div>

           <div className={`grid ${isGuest ? 'grid-cols-1' : 'grid-cols-2'} gap-2 md:gap-5 mx-auto px-4 md:px-5 mb-5`}>
          <button
            onClick={onGoToHome}
            className="w-full bg-black text-white py-2 md:py-3 rounded-xl font-medium hover:bg-gray-800 transition"
          >
            العودة إلى الرئيسية
          </button>
          {/* ✅ إخفاء زر "متابعة الطلبات" للضيف */}
          {!isGuest && (
            <button
              onClick={onGoToOrders}
              className="w-full bg-[#EC221F] text-white py-2 rounded-xl font-medium hover:bg-[#d41c19] transition"
            >
              متابعة الطلبات
            </button>
          )}
        </div>
      </div>
    </div>
  );
}