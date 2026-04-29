// services/api.ts
const API_URL = "https://dukanah.admin.t-carts.com/api";

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
        // إذا كان الـ API يحتاج توثيق، ضيفي الـ token هنا
        // 'Authorization': `Bearer ${yourToken}`,
      },
      cache: 'no-store', // أو 'force-cache' إذا حبيتي caching
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

interface CategoryResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    categories: CategoryData[];
  };
}

interface CategoryData {
  id: number;
  name: string;
  subcategories: any[];
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
// services/api.ts - أضيفي هذه الدالة

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

// services/api.ts - أضيفي هذه الدالة

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
      // تصفية الإعلانات النشطة فقط
      return result.data.ad_pop_up.filter(ad => ad.is_active === 1);
    } else {
      throw new Error(result.message || 'Failed to fetch ads');
    }
  } catch (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
}

// services/api.ts - أضيفي هذه الدالة

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