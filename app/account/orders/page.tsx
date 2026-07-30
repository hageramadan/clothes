// app/account/orders/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Package,
  ChevronDown,
  ChevronUp,
  Truck,
  CheckCircle,
  Clock,
  PackageCheck,
  XCircle,
  AlertCircle,
  Box,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IoCopyOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { useRouter } from 'next/navigation';
import Pagination from '@/components/products/Pagination';

// ========== تعريف الأنواع ==========
type OrderStatus = 
  | "ordered"
  | "processing"
  | "ready_for_receive"
  | "delivering"
  | "delivered"
  | "not_delivered"
  | "cancelled";

interface OrderItem {
  id: number;
  title: string;
  variant_id: number | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
  images: string[];
  variant?: {
    id: number;
    sku: string | null;
    price: number;
    has_discount: boolean;
    discount_type: string | null;
    discount_value: string | null;
    price_after_discount: number;
    quantity: number;
    is_active: boolean;
    variant_image: string;
    attributes: Array<{
      id: number;
      attribute_type: {
        id: number;
        name: string;
      };
      value: string;
      meta: {
        color?: string;
      } | null;
    }>;
  };
}

interface OrderAddress {
  id: number;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  city: {
    id: number;
    name: string;
    delivery_fee: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Order {
  id: number;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  status_label: string;
  payment_method: string;
  payment_status: string;
  delivery_method: string;
  subtotal: number;
  coupon_discount_amount: number;
  total_discount_amount: number;
  subtotal_after_discount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
  address: OrderAddress | null;
  items: OrderItem[];
  created_at: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  next_page: number | null;
  previous_page: number | null;
}

// ========== إعدادات API ==========
const API_URL = "https://fashion.admin.t-carts.com/api";

const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token2");
  }
  return null;
};

const getHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const PLACEHOLDER_IMAGE = "/images/placeholder-product.png";

// ========== دالة جلب الطلبات ==========
const fetchOrders = async (page: number = 1, perPage: number = 10, signal?: AbortSignal): Promise<{ orders: Order[], pagination: PaginationData }> => {
  try {
    const token = getToken();
    
    if (!token) {
      console.warn("⚠️ No token found - user is not logged in");
      return {
        orders: [],
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
          from: 0,
          to: 0,
          next_page: null,
          previous_page: null
        }
      };
    }

    console.log(`🟢 Fetching orders page ${page}`);
    const response = await fetch(`${API_URL}/orders?page=${page}&per_page=${perPage}`, {
      method: "GET",
      headers: getHeaders(),
      signal: signal,
    });

    if (response.status === 401) {
      console.warn("⚠️ Unauthorized - token expired or invalid");
      localStorage.removeItem("auth_token2");
      return {
        orders: [],
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
          from: 0,
          to: 0,
          next_page: null,
          previous_page: null
        }
      };
    }

    const data = await response.json();
    console.log(`📥 Response for page ${page}:`, data);

    if (data.result === true && data.data) {
      const orders = data.data.orders.map((order: any) => {
        try {
          return transformOrder(order);
        } catch (error) {
          console.error(`❌ Error transforming order ${order.id}:`, error);
          return null;
        }
      }).filter(Boolean) as Order[];
      
      const pagination = data.data.pagination;
      
      console.log(`✅ Loaded ${orders.length} orders for page ${page}`);
      console.log(`📊 Pagination:`, pagination);
      
      return {
        orders: orders,
        pagination: pagination
      };
    }
    
    console.warn(`⚠️ No orders found for page ${page}`);
    return {
      orders: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: 0,
        to: 0,
        next_page: null,
        previous_page: null
      }
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('🔄 Request was aborted');
      return {
        orders: [],
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
          from: 0,
          to: 0,
          next_page: null,
          previous_page: null
        }
      };
    }
    console.error("❌ Error fetching orders:", error);
    return {
      orders: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: 0,
        to: 0,
        next_page: null,
        previous_page: null
      }
    };
  }
};

// ========== دوال التحويل ==========
const mapStatusToEnglish = (statusLabel: string): OrderStatus => {
  const statusMap: Record<string, OrderStatus> = {
    ordered: "ordered",
    processing: "processing",
    ready_for_receive: "ready_for_receive",
    delivering: "delivering",
    delivered: "delivered",
    not_delivered: "not_delivered",
    cancelled: "cancelled",
  };
  return statusMap[statusLabel] || "ordered";
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const cleanImageUrl = (url: string): string => {
  if (!url) return PLACEHOLDER_IMAGE;
  if (url.startsWith("/storage")) {
    return `https://fashion.admin.t-carts.com${url}`;
  }
  return url;
};

const getSize = (item: OrderItem): string | null => {
  if (!item.variant?.attributes) return null;
  const sizeAttr = item.variant.attributes.find(
    (attr) => attr.attribute_type.name === "مقاس"
  );
  return sizeAttr?.value || null;
};

const getColor = (item: OrderItem): { name: string; hex: string | null } | null => {
  if (!item.variant?.attributes) return null;
  const colorAttr = item.variant.attributes.find(
    (attr) => attr.attribute_type.name === "اللون"
  );
  if (!colorAttr) return null;
  
  return {
    name: colorAttr.value,
    hex: colorAttr.meta?.color || null,
  };
};

const transformOrder = (apiOrder: any): Order => {
  if (!apiOrder || !apiOrder.id) {
    console.warn("⚠️ Invalid order data:", apiOrder);
    return {
      id: 0,
      orderNumber: "N/A",
      date: "N/A",
      status: "ordered" as OrderStatus,
      status_label: "ordered",
      payment_method: "N/A",
      payment_status: "N/A",
      delivery_method: "N/A",
      subtotal: 0,
      coupon_discount_amount: 0,
      total_discount_amount: 0,
      subtotal_after_discount: 0,
      shipping_amount: 0,
      tax_amount: 0,
      total_amount: 0,
      notes: null,
      address: null,
      items: [],
      created_at: new Date().toISOString(),
    };
  }

  const englishStatus = mapStatusToEnglish(apiOrder.status_label || "ordered");

  return {
    id: apiOrder.id,
    orderNumber: apiOrder.order_number || `ORD-${apiOrder.id}`,
    date: formatDate(apiOrder.created_at),
    status: englishStatus,
    status_label: apiOrder.status_label || "ordered",
    payment_method: apiOrder.payment_method || "N/A",
    payment_status: apiOrder.payment_status || "N/A",
    delivery_method: apiOrder.delivery_method || "N/A",
    subtotal: apiOrder.subtotal || 0,
    coupon_discount_amount: apiOrder.coupon_discount_amount || 0,
    total_discount_amount: apiOrder.total_discount_amount || 0,
    subtotal_after_discount: apiOrder.subtotal_after_discount || 0,
    shipping_amount: apiOrder.shipping_amount || 0,
    tax_amount: apiOrder.tax_amount || 0,
    total_amount: apiOrder.total_amount || 0,
    notes: apiOrder.notes || null,
    address: apiOrder.address || null,
    items: apiOrder.items || [],
    created_at: apiOrder.created_at || new Date().toISOString(),
  };
};

// ========== تكوين حالات الطلب ==========
const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: any }
> = {
  ordered: { 
    label: "تم الطلب", 
    color: "status-ordered", 
    icon: Clock 
  },
  processing: { 
    label: "قيد المعالجة", 
    color: "status-processing", 
    icon: Box 
  },
  ready_for_receive: { 
    label: "جاهز للاستلام", 
    color: "status-ready", 
    icon: PackageCheck 
  },
  delivering: { 
    label: "جارٍ التوصيل", 
    color: "status-delivering", 
    icon: Truck 
  },
  delivered: { 
    label: "تم التسليم", 
    color: "status-delivered", 
    icon: CheckCircle 
  },
  not_delivered: { 
    label: "لم يتم التسليم", 
    color: "status-not-delivered", 
    icon: AlertCircle 
  },
  cancelled: { 
    label: "ملغي", 
    color: "status-cancelled", 
    icon: XCircle 
  },
};

type FilterStatus = "all" | OrderStatus;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
    next_page: null,
    previous_page: null
  });
  
  // ✅ حالة لتتبع ما إذا كان المستخدم مسجل دخول
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);
  const itemsPerPage = 10;

  // ========== التحقق من تسجيل الدخول ==========
  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, []);

  // ========== جلب الطلبات ==========
  const loadOrders = useCallback(async (page: number = 1) => {
    const token = getToken();
    if (!token) {
      console.warn("⚠️ User not logged in - skipping orders fetch");
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    setLoading(true);
    
    try {
      const result = await fetchOrders(page, itemsPerPage, controller.signal);
      
      if (!controller.signal.aborted) {
        console.log(`🟢 Setting orders for page ${page}:`, result.orders.length);
        console.log(`📊 Setting pagination:`, result.pagination);
        
        setOrders(result.orders);
        setPagination(result.pagination);
        setLoading(false);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("❌ Error loading orders:", error);
        toast.error("حدث خطأ في تحميل الطلبات");
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
  }, [itemsPerPage]);

  // ========== تحميل الصفحة ==========
  useEffect(() => {
    console.log("🟢 Checking login status and loading orders");
    
    const token = getToken();
    if (!token) {
      console.log("🚫 No token found - showing login required message");
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }
    
    setIsLoggedIn(true);
    loadOrders(1);
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadOrders]);

  // ========== تغيير الصفحة ==========
  const handlePageChange = useCallback((newPage: number) => {
    console.log(`🔄 Changing to page ${newPage}`);
    if (newPage >= 1 && newPage <= pagination.last_page) {
      loadOrders(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pagination.last_page, loadOrders]);

  // ========== فلترة الطلبات ==========
  const filteredOrders = useMemo(() => {
    console.log(`🔄 Filtering orders with status: ${filterStatus}`);
    console.log(`📦 Current orders count: ${orders.length}`);
    
    if (filterStatus === "all") {
      return orders;
    }
    const filtered = orders.filter((order) => order.status === filterStatus);
    console.log(`✅ Filtered to ${filtered.length} orders`);
    return filtered;
  }, [orders, filterStatus]);

  const toggleExpand = useCallback((orderId: number) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  }, []);

  const copyOrderNumber = useCallback((orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber);
    toast.success("تم نسخ رقم الطلب");
  }, []);

  const goToOrderDetails = useCallback((orderId: number) => {
    router.push(`/account/orders/${orderId}`);
  }, [router]);

  const statusFilters: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "الكل" },
    { value: "ordered", label: "تم الطلب" },
    { value: "processing", label: "قيد المعالجة" },
    { value: "ready_for_receive", label: "جاهز للاستلام" },
    { value: "delivering", label: "جارٍ التوصيل" },
    { value: "delivered", label: "تم التسليم" },
    { value: "not_delivered", label: "لم يتم التسليم" },
    { value: "cancelled", label: "ملغي" },
  ];

  // ✅ عرض رسالة تسجيل الدخول بالتصميم المطلوب
  if (isLoggedIn === false) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            {/* أيقونة القفل أو المنع */}
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              ! مرحباً بك
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              يرجى <span className="text-[#ff3c27] font-semibold">تسجيل الدخول</span> أولاً للوصول إلى  الطلبات
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push("/auth/login")}
                className="w-full px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-[#e63522] transition-all duration-300 font-semibold text-lg shadow-md hover:shadow-lg"
              >
                تسجيل الدخول الآن
              </button>
              
              <button
                onClick={() => router.push("/")}
                className="w-full px-6 py-2 text-gray-600 hover:text-[#ff3c27] transition-colors duration-300 text-sm"
              >
                العودة إلى الصفحة الرئيسية
              </button>
            </div>
          </div>
          
          {/* رسالة تأكيد إضافية */}
          <p className="mt-4 text-sm text-gray-500">
            🔒 هذا القسم محمي ويتطلب مصادقة
          </p>
        </div>
      </div>
    );
  }

  // ✅ عرض حالة التحميل
  if (loading) {
    return (
      <div className="bg-gradient-to-l min-h-screen from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC221F] mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ عرض الطلبات إذا كان المستخدم مسجل دخول
  return (
    <div className="bg-gradient-to-l min-h-screen from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-6">
        {/* العنوان */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Package className="w-6 h-6 sm:w-7 sm:h-7 text-[#EC221F]" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            طلباتي
          </h1>
        </div>

        {/* فلتر الحالات */}
        <div className="flex flex-nowrap gap-2 mb-6 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:gap-3 md:gap-4">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                console.log(`🔍 Filter changed to: ${filter.value}`);
                setFilterStatus(filter.value);
              }}
              className={`whitespace-nowrap px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition ${
                filterStatus === filter.value
                  ? "bg-[#000000] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* قائمة الطلبات */}
        <div className="space-y-3 sm:space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="mt-8 md:mt-12 rounded-2xl p-8 sm:p-12 text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm sm:text-base">
                {orders.length === 0 ? "لا توجد طلبات" : "لا توجد طلبات في هذه الفئة"}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.ordered;
              const StatusIcon = status.icon;
              const isExpanded = expandedOrderId === order.id;
              const itemsCount = order.items.length;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* رأس الطلب */}
                  <div
                    className="p-4 sm:p-5 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              goToOrderDetails(order.id);
                            }}
                            className="flex gap-2 sm:gap-4 items-center text-base sm:text-[20px] font-bold text-[#180100] cursor-pointer hover:opacity-70 transition"
                          >
                            <h1 className="text-sm sm:text-base">رقم الطلب</h1>
                            <div className="flex gap-1 sm:gap-2 items-center">
                              <p className="font-bold text-gray-800 text-sm sm:text-base">
                                <span>
                                  {order.orderNumber}
                                </span>
                              </p>
                              <IoCopyOutline
                                className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:text-[#EC221F] transition"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyOrderNumber(order.orderNumber);
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div
                          className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1 sm:gap-1.5 ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {status.label}
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          )}
                        </div>
                      </div>

                      <p className="text-sm sm:text-[18px] text-[#333333]">
                        {order.date}
                      </p>

                      <div className="flex gap-2 items-center text-sm sm:text-base">
                        <p className="text-[#180100]">المنتجات</p>
                        <span className="text-gray-500">({itemsCount})</span>
                      </div>
                    </div>
                  </div>

                  {/* تفاصيل الطلب الموسعة */}
                  {isExpanded && order.items.length > 0 && (
                    <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50">
                      <div className="space-y-3 sm:space-y-4">
                        {order.items.map((item, idx) => {
                          const variantImage = item.variant?.variant_image 
                            ? cleanImageUrl(item.variant.variant_image) 
                            : null;
                          
                          const productImage = item.images && item.images.length > 0
                            ? cleanImageUrl(item.images[0])
                            : PLACEHOLDER_IMAGE;

                          const displayImage = variantImage || productImage;
                          const size = getSize(item);
                          const color = getColor(item);

                          return (
                            <div
                              key={idx}
                              className="flex gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-200 last:border-0 last:pb-0"
                            >
                              <Link
                                href={`/account/orders/${order.id}`}
                                className="flex-shrink-0"
                              >
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-[8px] sm:rounded-xl overflow-hidden hover:opacity-80 transition cursor-pointer relative">
                                  <Image
                                    src={displayImage}
                                    alt={item.title}
                                    width={80}
                                    height={80}
                                    className="object-cover w-full h-full"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        PLACEHOLDER_IMAGE;
                                    }}
                                  />
                                </div>
                              </Link>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                                  <div>
                                    <Link
                                      href={`/account/orders/${order.id}`}
                                      className="hover:underline"
                                    >
                                      <p className="font-medium text-gray-800 text-sm sm:text-base cursor-pointer hover:text-[#EC221F] transition">
                                        {item.title}
                                      </p>
                                    </Link>
                                    
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                                      {size && (
                                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs bg-white px-1.5 sm:px-2 py-0.5 rounded-full text-gray-700 border border-gray-200">
                                          <span className="font-medium">المقاس:</span>
                                          <span>{size}</span>
                                        </span>
                                      )}
                                      
                                      {color && (
                                        <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs bg-white px-1.5 sm:px-2 py-0.5 rounded-full text-gray-700 border border-gray-200">
                                          <span className="font-medium">اللون:</span>
                                          <span>{color.name}</span>
                                          {color.hex && (
                                            <span 
                                              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-gray-300 inline-block"
                                              style={{ backgroundColor: color.hex }}
                                            />
                                          )}
                                        </span>
                                      )}
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs text-gray-500">
                                      <span>الكمية: x{item.quantity}</span>
                                      <span>
                                        السعر: EGP {item.unit_price.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-left sm:text-right">
                                    <p className="font-semibold text-[#000000] text-sm sm:text-base">
                                      EGP {item.total_price.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        <div className="pt-2 sm:pt-3 flex justify-between items-center">
                          <Link
                            href={`/account/orders/${order.id}`}
                            className="text-[#EC221F] text-sm sm:text-base font-medium hover:underline"
                          >
                            عرض تفاصيل الطلب
                          </Link>
                          <div className="text-right">
                            <p className="text-xs sm:text-sm text-gray-500">
                              إجمالي الطلب
                            </p>
                            <p className="text-base sm:text-xl font-bold text-[#EC221F]">
                              <span className="text-xs md:text-base font-bold text-[#EC221F]">
                                EGP
                              </span>
                              {order.total_amount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            onPageChange={handlePageChange}
            total={pagination.total}
          />
        )}
      </div>

      <style jsx global>{`
        .status-ordered {
          background-color: #f181173D; color: #f18117; 
        }
        .status-processing {
          background-color: #ed89363d;
          color: #ed8936;
        }
        .status-ready {
          background-color: #A0AEC03d;
          color: #A0AEC0;
        }
        .status-delivering {
          background-color: #f6ad553d;
          color: #f6ad55;
        }
        .status-delivered {
          background-color: #48bb783d;
          color: #48bb78;
        }
        .status-not-delivered {
          background-color: #f565653d;
          color: #f56565;
        }
        .status-cancelled {
          background-color: #f565653d;
          color: #f56565;
        }
      `}</style>
    </div>
  );
}