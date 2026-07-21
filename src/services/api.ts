const API_URL = "https://dukanah.admin.t-carts.com/api";

// ========== واجهات (Interfaces) السلايدر ==========
interface SliderResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    sliders: SlideData[];
  };
}

interface SlideData {
  id: number;
  sub_title: string | null;
  name: string;
  description: string;
  link: string | null;
  image: string;
  is_active: number;
}

export async function getSliders(): Promise<SlideData[]> {
  try {
    const response = await fetch(`${API_URL}/sliders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: SliderResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return result.data.sliders.filter(slider => slider.is_active === 1);
    } else {
      throw new Error(result.message || 'Failed to fetch sliders');
    }
  } catch (error) {
    console.error('Error fetching sliders:', error);
    return [];
  }
}

// ========== واجهات (Interfaces) الكاتجوريز ==========
interface CategoryResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    categories: CategoryData[];
  };
}
export interface SubcategoryData {
  id: number;
  name: string;
}

interface CategoryData {
  id: number;
  name: string;
  subcategories: SubcategoryData[];
  image: string;
}

export async function getCategories(): Promise<CategoryData[]> {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: CategoryResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return result.data.categories;
    } else {
      throw new Error(result.message || 'Failed to fetch categories');
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// ========== واجهات (Interfaces) المنتجات ==========
interface ProductResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    products: ProductData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
      next_page: string | null;
      previous_page: string | null;
    };
  };
}

export interface ProductData {
  id: number;
  type: string;
  is_active: boolean;
  name: string;
  avg_rating: number;
  total_reviews: number;  
  description: string;
  category: {
    id: number;
    name: string;
    subcategories: any[];
    image: string;
  };
  subcategory: any;
  brand: any;
  has_production_date: boolean;
  pricing: {
    price: number;
    has_discount: boolean;
    discount_type: string | null;
    discount_value: number | null;
    price_after_discount: number | null;
    final_price: number;
  };
  has_variants: boolean;
  variants: any;
  quantity: number;
  images: string[];
}

export async function getNewProducts(page: number = 1, perPage: number = 20): Promise<ProductData[]> {
  try {
    const response = await fetch(`${API_URL}/products/new-products?page=${page}&per_page=${perPage}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ProductResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return result.data.products;
    } else {
      throw new Error(result.message || 'Failed to fetch new products');
    }
  } catch (error) {
    console.error('Error fetching new products:', error);
    return [];
  }
}

// ========== واجهات (Interfaces) الإعلانات ==========
interface AdResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    ad_pop_up: AdData[];
  };
}

export interface AdData {
  id: number;
  sub_title: string | null;
  name: string;
  description: string;
  link: string | null;
  image: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  end_date?:string
}

export async function getAds(): Promise<AdData[]> {
  try {
    const response = await fetch(`${API_URL}/ads`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: AdResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return result.data.ad_pop_up.filter(ad => ad.is_active === 1);
    } else {
      throw new Error(result.message || 'Failed to fetch ads');
    }
  } catch (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
}

export async function getMostSellingProducts(page: number = 1, perPage: number = 20): Promise<ProductData[]> {
  try {
    const response = await fetch(`${API_URL}/products/most-selling-products?page=${page}&per_page=${perPage}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ProductResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return result.data.products;
    } else {
      throw new Error(result.message || 'Failed to fetch most selling products');
    }
  } catch (error) {
    console.error('Error fetching most selling products:', error);
    return [];
  }
}

// ========== واجهات الفلاتر والمنتجات ==========
export interface ProductFilters {
  price_range?: [number, number];
  brands?: number[];
  sizes?: string[];
  colors?: string[];
  categories?: number[];
   subcategories?: number[];
  page?: number;
  per_page?: number;
}

interface ProductsListResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    products: ProductData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
      next_page: string | null;
      previous_page: string | null;
    };
  };
}

function buildFiltersQueryString(filters: ProductFilters): string {
  const queryParts: string[] = [];
  
  if (filters.page && filters.page > 0) {
    queryParts.push(`page=${filters.page}`);
  }
  
  const perPage = filters.per_page || 20;
  queryParts.push(`per_page=${perPage}`);
  
  if (filters.price_range && filters.price_range.length === 2) {
    queryParts.push(`price_range=[${filters.price_range[0]},${filters.price_range[1]}]`);
  }
  
  if (filters.brands && filters.brands.length > 0) {
    queryParts.push(`brands=[${filters.brands.join(',')}]`);
  }
  
  if (filters.sizes && filters.sizes.length > 0) {
    const formattedSizes = filters.sizes.map(s => `"${s}"`).join(',');
    queryParts.push(`sizes=[${formattedSizes}]`);
  }
  
  if (filters.colors && filters.colors.length > 0) {
   const formattedColors = filters.colors
  .map(c => `"${encodeURIComponent(c)}"`)
  .join(',');

queryParts.push(`colors=[${formattedColors}]`);
  }
  
  if (filters.categories && filters.categories.length > 0) {
    queryParts.push(`categories=[${filters.categories.join(',')}]`);
  }
    if (filters.subcategories && filters.subcategories.length > 0) {
    queryParts.push(`subcategories=[${filters.subcategories.join(',')}]`);
  }
  
  return queryParts.join('&');
}

export async function getAllProducts(
  filters: ProductFilters = {}
): Promise<{ products: ProductData[]; pagination: ProductsListResponse['data']['pagination'] | null }> {
  try {
    if (!filters.page || filters.page < 1) {
      filters.page = 1;
    }
    
    const queryString = buildFiltersQueryString(filters);
    const url = `${API_URL}/products?${queryString}`;
    
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ProductsListResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return {
        products: result.data.products,
        pagination: result.data.pagination
      };
    } else {
      throw new Error(result.message || 'Failed to fetch products');
    }
  } catch (error) {
    console.error('Error fetching all products:', error);
    return { products: [], pagination: null };
  }
}

export async function searchProducts(
  query: string,
  page: number = 1,
  perPage: number = 20
): Promise<{ products: ProductData[]; pagination: any }> {
  try {
    const url = `${API_URL}/products/search?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ProductsListResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return {
        products: result.data.products,
        pagination: result.data.pagination
      };
    } else {
      throw new Error(result.message || 'Failed to search products');
    }
  } catch (error) {
    console.error('Error searching products:', error);
    return { products: [], pagination: null };
  }
}

export async function getProductsByIds(productIds: number[]): Promise<ProductData[]> {
  try {
    const url = `${API_URL}/products?ids=${productIds.join(',')}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ProductsListResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return result.data.products;
    } else {
      throw new Error(result.message || 'Failed to fetch products by ids');
    }
  } catch (error) {
    console.error('Error fetching products by ids:', error);
    return [];
  }
}

// ========== واجهات (Interfaces) خاصة بـ Attributes ==========
interface AttributeValue {
  id: number;
  value: string;
  meta: {
    color?: string;
  } | null;
}

interface Attribute {
  id: number;
  name: string;
  slug: string;
  values: AttributeValue[];
}

interface AttributesResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    attributes: Attribute[];
  };
}

export async function getAttributes(): Promise<Attribute[]> {
  try {
    const response = await fetch(`${API_URL}/products/attributes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: AttributesResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return result.data.attributes;
    } else {
      throw new Error(result.message || 'Failed to fetch attributes');
    }
  } catch (error) {
    console.error('Error fetching attributes:', error);
    return [];
  }
}

export async function getColors(): Promise<{ id: number; name: string; code: string }[]> {
  const attributes = await getAttributes();
  const colorAttribute = attributes.find(attr => attr.slug === 'color');
  
  if (colorAttribute && colorAttribute.values) {
    return colorAttribute.values.map(value => ({
      id: value.id,
      name: value.value,
      code: value.meta?.color || '#000000'
    }));
  }
  
  return [];
}

export async function getSizes(): Promise<{ id: number; value: string }[]> {
  const attributes = await getAttributes();
  const sizeAttribute = attributes.find(attr => attr.slug === 'size');
  
  if (sizeAttribute && sizeAttribute.values) {
    return sizeAttribute.values.map(value => ({
      id: value.id,
      value: value.value
    }));
  }
  
  return [];
}

export function encodeColor(colorCode: string): string {
  return encodeURIComponent(colorCode);
}

export function decodeColor(encodedColor: string): string {
  return decodeURIComponent(encodedColor);
}

export async function getBrands(): Promise<any[]> {
  try {
    const response = await fetch(`${API_URL}/brands`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: any = await response.json();
    
    if (result.result && result.errNum === 200) {
      return result.data.brands || [];
    } else {
      throw new Error(result.message || 'Failed to fetch brands');
    }
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
}

// ========== دوال المنتج الفردي ==========
interface SingleProductResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    product: ProductData;
  };
}

export async function getProductById(productId: string | number): Promise<ProductData | null> {
  try {
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: SingleProductResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return result.data.product;
    } else {
      throw new Error(result.message || 'Failed to fetch product');
    }
  } catch (error) {
    console.error('Error fetching product by id:', error);
    return null;
  }
}

export function extractColorsFromProduct(product: ProductData): { name: string; code: string }[] {
  const colors: { name: string; code: string }[] = [];
  
  if (product.has_variants && product.variants?.length > 0) {
    product.variants.forEach((variant: any) => {
      if (variant.attributes) {
        variant.attributes.forEach((attr: any) => {
          if (attr.attribute_type?.name === 'اللون' && attr.meta?.color) {
            const exists = colors.some(c => c.name === attr.value);
            if (!exists) {
              colors.push({
                name: attr.value,
                code: attr.meta.color
              });
            }
          }
        });
      }
    });
  }
  
  return colors;
}

export function extractSizesFromProduct(product: ProductData): string[] {
  const sizes: string[] = [];
  
  if (product.has_variants && product.variants?.length > 0) {
    product.variants.forEach((variant: any) => {
      if (variant.attributes) {
        variant.attributes.forEach((attr: any) => {
          if (attr.attribute_type?.name === 'مقاس') {
            const exists = sizes.includes(attr.value);
            if (!exists) {
              sizes.push(attr.value);
            }
          }
        });
      }
    });
  }
  
  return sizes;
}

export function getFinalPrice(product: ProductData): number {
  if (product.has_variants && product.variants?.[0]?.price_after_discount) {
    return product.variants[0].price_after_discount;
  }
  return product.pricing?.final_price || product.pricing?.price || 0;
}

export function getOriginalPrice(product: ProductData): number | null {
  if (product.pricing?.has_discount && product.pricing?.price) {
    return product.pricing.price;
  }
  return null;
}

export function getDiscountPercentage(product: ProductData): number | null {
  if (product.pricing?.has_discount && product.pricing?.price && product.pricing?.final_price) {
    return Math.round(((product.pricing.price - product.pricing.final_price) / product.pricing.price) * 100);
  }
  return null;
}

// ========== واجهات (Interfaces) خاصة بالتقييمات ==========
interface ReviewsResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    average_rating: number;
    total_reviews: number;
    reviews: ReviewData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
      next_page: string | null;
      previous_page: string | null;
    };
  };
}

export interface ReviewData {
  id: number;
  rating: number;
  comment: string;
  user: {
    id: number;
    name: string;
    locale: string;
    email: string;
    verified: boolean;
    created_at: string;
    image: string;
  };
  created_at: string;
  updated_at: string;
}

export async function getProductReviews(
  productId: number,
  page: number = 1,
  perPage: number = 10,
  sort?: string
): Promise<{
  reviews: ReviewData[];
  averageRating: number;
  totalReviews: number;
  pagination: any;
}> {
  try {
    let url = `${API_URL}/reviews/${productId}/show?page=${page}&per_page=${perPage}`;
    
    if (sort) {
      let sortParam = '';
      switch (sort) {
        case 'الأحدث':
          sortParam = '&sort=created_at&order=desc';
          break;
        case 'الأقدم':
          sortParam = '&sort=created_at&order=asc';
          break;
        case 'أعلى تقييم':
          sortParam = '&sort=rating&order=desc';
          break;
        case 'أقل تقييم':
          sortParam = '&sort=rating&order=asc';
          break;
        default:
          sortParam = '&sort=created_at&order=desc';
      }
      url += sortParam;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ReviewsResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return {
        reviews: result.data.reviews,
        averageRating: result.data.average_rating,
        totalReviews: result.data.total_reviews,
        pagination: result.data.pagination
      };
    } else {
      throw new Error(result.message || 'Failed to fetch reviews');
    }
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return {
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      pagination: null
    };
  }
}

export async function getAllFiltersData() {
  const [colors, sizes, brands, categories] = await Promise.all([
    getColors(),
    getSizes(),
    getBrands(),
    getCategories()
  ]);

  return {
    colors,
    sizes,
    brands,
    categories
  };
}

// ========== واجهات (Interfaces) الخاصة بالتسجيل وتسجيل الدخول ==========

interface RegisterWithEmailRequest {
  name: string;
  email: string;
  password: string;
}

interface RegisterWithPhoneRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  country_code: string;
}

interface LoginWithEmailRequest {
  email: string;
  password: string;
}

interface LoginWithPhoneRequest {
  phone: string;
  password: string;
  country_code: string;
}

interface AuthResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    token?: string;
    user?: {
      id: number;
      name: string;
      email?: string;
      phone?: string;
    };
  } | null;
}

interface LogoutResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: null;
}

// ========== دوال المصادقة المعدلة ==========

export async function registerWithEmail(data: RegisterWithEmailRequest): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const results: AuthResponse = await response.json();

    if (!response.ok) {
      return {
        result: results.result || false,
        errNum: results.errNum || response.status,
        message: results.message || `(${response.status})`,
        data: results.data || null,
      };
    }

    return results;
  } catch (error) {
    console.error('Error in registerWithEmail:', error);
    return {
      result: false,
      errNum: 500,
      message: error instanceof Error ? error.message : 'فشل في التسجيل',
      data: null,
    };
  }
}

export async function registerWithPhone(data: RegisterWithPhoneRequest): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const results: AuthResponse = await response.json();

    if (!response.ok) {
      return {
        result: results.result || false,
        errNum: results.errNum || response.status,
        message: results.message || `(${response.status})`,
        data: results.data || null,
      };
    }

    return results;
  } catch (error) {
    console.error('Error in registerWithPhone:', error);
    return {
      result: false,
      errNum: 500,
      message: error instanceof Error ? error.message : 'فشل في التسجيل',
      data: null,
    };
  }
}

export async function loginWithEmail(data: LoginWithEmailRequest): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const results: AuthResponse = await response.json();

    if (!response.ok) {
      return {
        result: results.result || false,
        errNum: results.errNum || response.status,
        message: results.message || `فشل في تسجيل الدخول (${response.status})`,
        data: results.data || null,
      };
    }

    return results;
  } catch (error) {
    console.error('Error in loginWithEmail:', error);
    return {
      result: false,
      errNum: 500,
      message: error instanceof Error ? error.message : 'فشل في تسجيل الدخول',
      data: null,
    };
  }
}

export async function loginWithPhone(data: LoginWithPhoneRequest): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const results: AuthResponse = await response.json();

    if (!response.ok) {
      return {
        result: results.result || false,
        errNum: results.errNum || response.status,
        message: results.message || `فشل في تسجيل الدخول (${response.status})`,
        data: results.data || null,
      };
    }

    return results;
  } catch (error) {
    console.error('Error in loginWithPhone:', error);
    return {
      result: false,
      errNum: 500,
      message: error instanceof Error ? error.message : 'فشل في تسجيل الدخول',
      data: null,
    };
  }
}

// ========== دوال مساعدة للمصادقة ==========
export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }
}

export function saveUserData(user: AuthResponse['data']): void {
  if (typeof window !== 'undefined' && user) {
    localStorage.setItem('user_data', JSON.stringify(user));
  }
}

export function getUserData(): AuthResponse['data'] | null {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      return JSON.parse(userData);
    }
  }
  return null;
}

// ========== دالة تسجيل الخروج ==========
export async function logout(token?: string): Promise<LogoutResponse> {
  try {
    const authToken = token || getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: LogoutResponse = await response.json();
    
    if (result.result) {
      removeToken();
    }
    
    return result;
  } catch (error) {
    console.error('Error in logout:', error);
    return {
      result: false,
      errNum: 500,
      message: error instanceof Error ? error.message : 'فشل في تسجيل الخروج',
      data: null,
    };
  }
}

export async function logoutAndCleanup(redirectTo?: string): Promise<boolean> {
  try {
    const result = await logout();
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      if (redirectTo) {
        window.location.href = redirectTo;
      }
    }
    
    return result.result;
  } catch (error) {
    console.error('Error in logoutAndCleanup:', error);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      if (redirectTo) {
        window.location.href = redirectTo;
      }
    }
    
    return false;
  }
}

// ========== واجهات (Interfaces) خاصة بنسيت كلمة المرور ==========

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: any[] | null;
}

interface VerifyForgotPasswordRequest {
  otp: string;
  email: string;
}

interface VerifyForgotPasswordResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    reset_token?: string;
  } | null;
}

interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

interface ChangePasswordResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: null;
}

/**
 * دالة إرسال طلب إعادة تعيين كلمة المرور (نسيت كلمة المرور)
 */
export async function forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ForgotPasswordResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    return {
      result: false,
      errNum: 500,
      message: error instanceof Error ? error.message : 'فشل في إرسال رمز التحقق',
      data: null,
    };
  }
}

/**
 * دالة التحقق من رمز إعادة تعيين كلمة المرور
 */
// services/api.ts

// services/api.ts

export async function verifyForgotPassword(data: VerifyForgotPasswordRequest): Promise<VerifyForgotPasswordResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/verify-forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: VerifyForgotPasswordResponse = await response.json();
    
    // ✅ تخزين reset_token في localStorage عند نجاح التحقق
    if (result.result && result.data?.reset_token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('reset_token', result.data.reset_token);
        localStorage.setItem('reset_email', data.email);
        console.log('✅ Reset token saved:', result.data.reset_token); // للتأكد
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error in verifyForgotPassword:', error);
    return {
      result: false,
      errNum: 500,
      message: error instanceof Error ? error.message : 'فشل في التحقق من الرمز',
      data: null,
    };
  }
}
/**
 * دالة تغيير كلمة المرور (للمستخدم المسجل دخول)
 */
export async function changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  try {
    const token = getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });

    const result: ChangePasswordResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error in changePassword:', error);
    return {
      result: false,
      errNum: 500,
      message: error instanceof Error ? error.message : 'فشل في تغيير كلمة المرور',
      data: null,
    };
  }
}

/**
 * دالة إعادة تعيين كلمة المرور بعد التحقق
 */
// services/api.ts

export async function resetPassword(data: {
  email: string;
  new_password: string;
  new_password_confirmation: string;
}): Promise<ChangePasswordResponse> {
  try {
    // ✅ جلب reset_token من localStorage
    let resetToken = null;
    if (typeof window !== 'undefined') {
      resetToken = localStorage.getItem('reset_token');
      console.log('🔑 Reset token from localStorage:', resetToken); // للتأكد
    }
    
    // ✅ بناء جسم الطلب
    const requestBody: any = {
      email: data.email,
      new_password: data.new_password,
      new_password_confirmation: data.new_password_confirmation,
    };
    
    // ✅ إضافة reset_token إذا كان موجوداً
    if (resetToken) {
      requestBody.reset_token = resetToken;
    }
    
    console.log('📤 Sending request body:', requestBody); // للتأكد
    
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const result: ChangePasswordResponse = await response.json();
    
    // ✅ إذا نجحت العملية، امسح التوكن من localStorage
    if (result.result && typeof window !== 'undefined') {
      localStorage.removeItem('reset_token');
      localStorage.removeItem('reset_email');
    }
    
    return result;
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return {
      result: false,
      errNum: 500,
      message: error instanceof Error ? error.message : 'فشل في إعادة تعيين كلمة المرور',
      data: null,
    };
  }
}

/**
 * دالة إعادة إرسال رمز التحقق (OTP)
 */
export async function resendOTP(email: string): Promise<ForgotPasswordResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result: ForgotPasswordResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error in resendOTP:', error);
    return {
      result: false,
      errNum: 500,
      message: error instanceof Error ? error.message : 'فشل في إعادة إرسال الرمز',
      data: null,
    };
  }
}

// ========== واجهات (Interfaces) خاصة بتحديث الملف الشخصي ==========

interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  locale?: string;
  image?: File | string;
}

interface UpdateProfileResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    user?: {
      id: number;
      name: string;
      email?: string;
      phone?: string;
      image?: string;
    };
  } | null;
}

interface GetProfileResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    user: {
      id: number;
      name: string;
      email?: string;
      phone?: string;
      image?: string;
      [key: string]: any;
    };
  } | null;
}

/**
 * دالة تحديث الملف الشخصي للمستخدم
 * تدعم رفع الصور كـ File وكذلك تحديث البيانات النصية
 */
export async function updateUserProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  try {
    const token = getToken();
    
    if (!token) {
      return {
        result: false,
        errNum: 401,
        message: 'غير مصرح به. الرجاء تسجيل الدخول',
        data: null,
      };
    }
    
    const hasFile = data.image instanceof File;
    
    let response: Response;
    
    if (hasFile) {
      const formData = new FormData();
      
      if (data.name) formData.append('name', data.name);
      if (data.locale) formData.append('locale', data.locale);
      if (data.email) formData.append('email', data.email);
      if (data.phone) formData.append('phone', data.phone);
      if (data.image) formData.append('image', data.image);
      
      formData.append('_method', 'PUT');
      
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      response = await fetch(`${API_URL}/user/profile`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });
    } else {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const bodyData = {
        ...data,
        _method: 'PUT'
      };
      
      if (bodyData.image && typeof bodyData.image === 'string') {
        delete bodyData.image;
      }
      
      response = await fetch(`${API_URL}/user/profile`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(bodyData),
      });
    }

    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }

    // const result: UpdateProfileResponse = await response.json();
    
   
    
    const results: UpdateProfileResponse = await response.json();
 if (results.result && results.errNum === 200 && results.data?.user) {
      const currentUserData = getUserData();
      if (currentUserData) {
        const updatedUserData = {
          ...currentUserData,
          user: {
            ...currentUserData.user,
            ...results.data.user
          }
        };
        saveUserData(updatedUserData);
      }
    }
    if (!response.ok) {
      return {
        result: results.result || false,
        errNum: results.errNum || response.status,
        message: results.message || `(${response.status})`,
        data: results.data || null,
      };
    }

    return results;
    
    // return result;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return {
      result: false,
      errNum: 500,
      message: error instanceof Error ? error.message : 'فشل في تحديث الملف الشخصي',
      data: null,
    };
  }
}

/**
 * دالة جلب بيانات الملف الشخصي للمستخدم
 */
export async function getUserProfile(): Promise<GetProfileResponse> {
  try {
    const token = getToken();
    
    if (!token) {
      return {
        result: false,
        errNum: 401,
        message: 'غير مصرح به. الرجاء تسجيل الدخول',
        data: null,
      };
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GetProfileResponse = await response.json();
    
    if (result.result && result.errNum === 200 && result.data?.user) {
      const currentUserData = getUserData();
      if (currentUserData) {
        const updatedUserData = {
          ...currentUserData,
          user: result.data.user
        };
        saveUserData(updatedUserData);
      } else {
        saveUserData({ user: result.data.user });
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return {
      result: false,
      errNum: 500,
      message: error instanceof Error ? error.message : 'فشل في جلب بيانات الملف الشخصي',
      data: null,
    };
  }
}

/**
 * دالة رفع/تحديث صورة الملف الشخصي فقط
 */
export async function updateProfileImage(imageFile: File): Promise<UpdateProfileResponse> {
  return updateUserProfile({ image: imageFile });
}

/**
 * دالة تحديث اللغة فقط
 */
export async function updateUserLocale(locale: string): Promise<UpdateProfileResponse> {
  return updateUserProfile({ locale });
}

// ========== واجهات (Interfaces) الأقسام ==========
export interface SectionResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    sections: SectionData[];
  };
}

export interface SectionData {
  id: number;
  name: string;
  is_active: boolean;
  products: ProductData[];
}

/**
 * دالة جلب جميع الأقسام مع منتجاتها
 */
export async function getSections(): Promise<SectionResponse> {
  try {
    const response = await fetch(`${API_URL}/sections`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: SectionResponse = await response.json();
    
    if (result.result && result.errNum === 200) {
      return result;
    } else {
      throw new Error(result.message || 'Failed to fetch sections');
    }
  } catch (error) {
    console.error('Error fetching sections:', error);
    throw error;
  }
}

/**
 * دالة جلب الأقسام النشطة فقط
 */
export async function getActiveSections(): Promise<SectionData[]> {
  try {
    const response = await getSections();
    return response.data.sections.filter(section => section.is_active === true);
  } catch (error) {
    console.error('Error fetching active sections:', error);
    return [];
  }
}

/**
 * دالة جلب قسم معين حسب المعرف
 */
export async function getSectionById(sectionId: number): Promise<SectionData | null> {
  try {
    const sections = await getActiveSections();
    const section = sections.find(s => s.id === sectionId);
    return section || null;
  } catch (error) {
    console.error('Error fetching section by id:', error);
    return null;
  }
}

/**
 * دالة جلب قسم معين حسب الاسم
 */
export async function getSectionByName(sectionName: string): Promise<SectionData | null> {
  try {
    const sections = await getActiveSections();
    const section = sections.find(s => s.name === sectionName);
    return section || null;
  } catch (error) {
    console.error('Error fetching section by name:', error);
    return null;
  }
}