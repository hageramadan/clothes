// components/products/FilterSidebar.tsx
'use client';

import {
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  useState,
  memo,
  useRef,
  type ChangeEvent,
} from 'react';
import { getCategories, getColors, getSizes, getBrands } from '@/services/api';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { FaArrowLeft } from 'react-icons/fa6';
import { useSearchParams } from 'next/navigation';

// ============================================================================
// Types
// ============================================================================

/** A single product category returned by the API */
export interface CategoryOption {
  id: number;
  name: string;
  subcategories: SubcategoryOption[]; // ✅ إضافة الـ subcategories جوة الكاتجوري
}

/** A single subcategory returned by the API */
export interface SubcategoryOption {
  id: number;
  name: string;
}

/** A single color option returned by the API */
export interface ColorOption {
  id: number;
  name: string;
  code: string;
}

/** A single size option returned by the API */
export interface SizeOption {
  id: number;
  value: string;
}

/** A single brand option returned by the API */
export interface BrandOption {
  id: number;
  name: string;
}

/** Shape of the filters object emitted to the parent via onFilterChange. */
export interface AppliedFilters {
  categoryIds?: number[];
  subcategoryIds?: number[];
  colors?: string[];
  sizes?: string[];
  brands?: number[];
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductFiltersProps {
  onFilterChange: (filters: AppliedFilters) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

type PriceRange = [number, number];

/** Internal selection state managed by the reducer. */
interface FiltersSelectionState {
  selectedCategories: number[]; // ✅ إضافة selectedCategories
  selectedSubcategories: number[];
  selectedColors: string[];
  selectedSizes: string[];
  selectedBrands: number[];
  tempPriceRange: PriceRange;
  appliedPriceRange: PriceRange | undefined;
}

// ============================================================================
// Constants
// ============================================================================

const MIN_PRICE = 0;
const MAX_PRICE = 100_000;
const DEFAULT_PRICE_RANGE: PriceRange = [3000, 10000];

// Colors that need a different selection ring because they blend into a
// white background (kept as Sets for O(1) lookups and easy extension).
const WHITE_COLOR_CODES = new Set(['#FFFFFF', '#F9FAFB']);
const WHITE_COLOR_NAMES = new Set(['أبيض', 'white']);

const initialFiltersState: FiltersSelectionState = {
  selectedCategories: [],
  selectedSubcategories: [],
  selectedColors: [],
  selectedSizes: [],
  selectedBrands: [],
  tempPriceRange: DEFAULT_PRICE_RANGE,
  appliedPriceRange: undefined,
};

// ============================================================================
// Pure helpers
// ============================================================================

/** Adds or removes a value from an array — used by every checkbox toggle. */
function toggleInArray<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/** True if a color swatch should be treated as "white" for ring styling. */
function isWhiteColor(name: string, code: string): boolean {
  return WHITE_COLOR_NAMES.has(name) || WHITE_COLOR_CODES.has(code);
}

/**
 * Builds the filters object sent to the parent component.
 */
function buildAppliedFilters(state: FiltersSelectionState): AppliedFilters {
  const filters: AppliedFilters = {
    categoryIds: state.selectedCategories.length ? state.selectedCategories : undefined,
    subcategoryIds: state.selectedSubcategories.length ? state.selectedSubcategories : undefined,
    colors: state.selectedColors.length ? state.selectedColors : undefined,
    sizes: state.selectedSizes.length ? state.selectedSizes : undefined,
    brands: state.selectedBrands.length ? state.selectedBrands : undefined,
  };

  if (state.appliedPriceRange) {
    filters.minPrice = state.appliedPriceRange[0];
    filters.maxPrice = state.appliedPriceRange[1];
  }

  return filters;
}

// ============================================================================
// Reducer
// ============================================================================

type FiltersAction =
  | { type: 'TOGGLE_CATEGORY'; payload: number }
  | { type: 'TOGGLE_SUBCATEGORY'; payload: number }
  | { type: 'TOGGLE_COLOR'; payload: string }
  | { type: 'TOGGLE_SIZE'; payload: string }
  | { type: 'TOGGLE_BRAND'; payload: number }
  | { type: 'SET_TEMP_PRICE_RANGE'; payload: PriceRange }
  | { type: 'APPLY_PRICE_FILTER' }
  | { type: 'RESET_ALL' }
  | { type: 'APPLY_ALL_FILTERS' }
  | { type: 'SET_INITIAL_CATEGORY'; payload: number }; // ✅ إضافة نوع جديد

function filtersReducer(state: FiltersSelectionState, action: FiltersAction): FiltersSelectionState {
  switch (action.type) {
    case 'TOGGLE_CATEGORY':
      // ✅ عند تغيير الكاتجوري، نمسح الـ subcategories المختارة
      return { 
        ...state, 
        selectedCategories: toggleInArray(state.selectedCategories, action.payload),
        selectedSubcategories: [] // ✅ تفريغ الـ subcategories
      };
    case 'TOGGLE_SUBCATEGORY':
      return { ...state, selectedSubcategories: toggleInArray(state.selectedSubcategories, action.payload) };
    case 'TOGGLE_COLOR':
      return { ...state, selectedColors: toggleInArray(state.selectedColors, action.payload) };
    case 'TOGGLE_SIZE':
      return { ...state, selectedSizes: toggleInArray(state.selectedSizes, action.payload) };
    case 'TOGGLE_BRAND':
      return { ...state, selectedBrands: toggleInArray(state.selectedBrands, action.payload) };
    case 'SET_TEMP_PRICE_RANGE':
      return { ...state, tempPriceRange: action.payload };
    case 'APPLY_PRICE_FILTER':
      return { ...state, appliedPriceRange: state.tempPriceRange };
    case 'APPLY_ALL_FILTERS':
      return { 
        ...state, 
        appliedPriceRange: state.tempPriceRange 
      };
    case 'SET_INITIAL_CATEGORY':
      return { 
        ...state, 
        selectedCategories: [action.payload],
        selectedSubcategories: [] // ✅ تفريغ الـ subcategories
      };
    case 'RESET_ALL':
      return initialFiltersState;
    default:
      return state;
  }
}

// ============================================================================
// Data-loading hook
// ============================================================================

interface FilterOptionsState {
  categories: CategoryOption[];
  colors: ColorOption[];
  sizes: SizeOption[];
  brands: BrandOption[];
}

const EMPTY_FILTER_OPTIONS: FilterOptionsState = {
  categories: [],
  colors: [],
  sizes: [],
  brands: [],
};

function useFilterOptions(): FilterOptionsState {
  const [options, setOptions] = useState<FilterOptionsState>(EMPTY_FILTER_OPTIONS);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const [categoriesData, colors, sizes, brands] = await Promise.all([
          getCategories(),
          getColors(),
          getSizes(),
          getBrands(),
        ]);

        // ✅ تحويل البيانات لشكل مناسب مع subcategories
        const formattedCategories: CategoryOption[] = categoriesData.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          subcategories: cat.subcategories || [],
        }));

        if (isMounted) {
          setOptions({ 
            categories: formattedCategories,
            colors, 
            sizes, 
            brands 
          });
        }
      } catch (error) {
        console.error('Error loading filters data:', error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return options;
}

// ============================================================================
// Presentational sub-components
// ============================================================================

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-right font-semibold text-gray-700 mb-2"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
}

interface CheckboxFilterListProps<T, K extends string | number> {
  items: T[];
  selectedValues: K[];
  getKey: (item: T) => K;
  getLabel: (item: T) => string;
  onToggle: (key: K) => void;
  loadingMessage: string;
  maxHeightClassName?: string;
}

function CheckboxFilterListInner<T, K extends string | number>({
  items,
  selectedValues,
  getKey,
  getLabel,
  onToggle,
  loadingMessage,
  maxHeightClassName = 'max-h-64',
}: CheckboxFilterListProps<T, K>) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-400">{loadingMessage}</p>;
  }

  return (
    <div className={`space-y-2 overflow-y-auto ${maxHeightClassName}`}>
      {items.map((item) => {
        const key = getKey(item);
        return (
          <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
            <input
              type="checkbox"
              checked={selectedValues.includes(key)}
              onChange={() => onToggle(key)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">{getLabel(item)}</span>
          </label>
        );
      })}
    </div>
  );
}

const CheckboxFilterList = memo(CheckboxFilterListInner) as typeof CheckboxFilterListInner;

interface ColorSwatchListProps {
  colors: ColorOption[];
  selectedColors: string[];
  onToggle: (code: string) => void;
  loadingMessage: string;
}

const ColorSwatchList = memo(function ColorSwatchList({
  colors,
  selectedColors,
  onToggle,
  loadingMessage,
}: ColorSwatchListProps) {
  if (colors.length === 0) {
    return <p className="text-sm text-gray-400">{loadingMessage}</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => {
        const isSelected = selectedColors.includes(color.code);
        const isWhite = isWhiteColor(color.name, color.code);

        return (
          <button
            key={color.id}
            onClick={() => onToggle(color.code)}
            className="group relative"
            aria-label={`لون ${color.name}`}
          >
            <div
              className={`
                w-7 h-7 rounded-full transition-all duration-200 hover:scale-110
                ${isSelected ? 'ring-2 ring-offset-2 scale-110' : ''}
                ${isSelected && isWhite ? 'ring-black ring-offset-white' : isSelected ? 'ring-blue-500' : ''}
              `}
              style={{
                backgroundColor: color.code,
                ...(isWhite && { border: '1px solid #e5e7eb' }),
              }}
            />
          </button>
        );
      })}
    </div>
  );
});

// ============================================================================
// Main component
// ============================================================================

export default function ProductFilters({ onFilterChange, isMobile = false, onClose }: ProductFiltersProps) {
  const searchParams = useSearchParams();
  
  // ✅ استخدام ref لتخزين onFilterChange
  const onFilterChangeRef = useRef(onFilterChange);
  
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);
  
  const [state, dispatch] = useReducer(filtersReducer, initialFiltersState);
  const { categories, colors, sizes, brands } = useFilterOptions();

  // ✅ جلب الكاتجوري من الـ URL
  const urlCategoryIds = useMemo(() => {
    const categoriesParam = searchParams.get('categories');
    if (categoriesParam) {
      try {
        // الـ URL بيجي كـ "categories=[14]" أو "categories=14"
        const cleaned = categoriesParam.replace(/[\[\]]/g, '');
        const ids = cleaned.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        return ids;
      } catch {
        return [];
      }
    }
    return [];
  }, [searchParams]);

  // ✅ تعيين الكاتجوري الافتراضي من الـ URL
  useEffect(() => {
    if (urlCategoryIds.length > 0) {
      const categoryId = urlCategoryIds[0];
      dispatch({ type: 'SET_INITIAL_CATEGORY', payload: categoryId });
    }
  }, [urlCategoryIds]);

  // ✅ الحصول على الـ subcategories للكاتجوري المختار
  const getSubcategoriesForSelectedCategory = useCallback(() => {
    if (state.selectedCategories.length === 0) return [];
    
    const selectedCategory = categories.find(
      cat => cat.id === state.selectedCategories[0]
    );
    
    return selectedCategory?.subcategories || [];
  }, [state.selectedCategories, categories]);

  const currentSubcategories = getSubcategoriesForSelectedCategory();

  const [tempMinPrice, tempMaxPrice] = state.tempPriceRange;

  // ✅ دالة تطبيق الفلاتر (تُستخدم للموبايل والديسكتوب)
  const applyFilters = useCallback(() => {
    dispatch({ type: 'APPLY_ALL_FILTERS' });
    
    const filtersToApply = buildAppliedFilters({
      ...state,
      appliedPriceRange: state.tempPriceRange,
    });
    onFilterChangeRef.current(filtersToApply);
    
    if (isMobile && onClose) {
      onClose();
    }
  }, [state, isMobile, onClose]);

  // ✅ للديسكتوب: تطبيق الفلاتر فوراً عند التغيير (ما عدا السعر)
  useEffect(() => {
    if (!isMobile && onFilterChangeRef.current) {
      const filters = buildAppliedFilters({
        ...state,
        appliedPriceRange: state.appliedPriceRange, // ✅ استخدم السعر المطبق وليس المؤقت
      });
      onFilterChangeRef.current(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.selectedCategories,
    state.selectedSubcategories,
    state.selectedColors,
    state.selectedSizes,
    state.selectedBrands,
    state.appliedPriceRange, // ✅ اعتمد على appliedPriceRange بدلاً من tempPriceRange
    isMobile,
  ]);

  // ---- Instant filter toggles ----
  const handleCategoryToggle = useCallback((id: number) => {
    dispatch({ type: 'TOGGLE_CATEGORY', payload: id });
  }, []);

  const handleSubcategoryToggle = useCallback((id: number) => {
    dispatch({ type: 'TOGGLE_SUBCATEGORY', payload: id });
  }, []);

  const handleColorToggle = useCallback((code: string) => {
    dispatch({ type: 'TOGGLE_COLOR', payload: code });
  }, []);

  const handleSizeToggle = useCallback((value: string) => {
    dispatch({ type: 'TOGGLE_SIZE', payload: value });
  }, []);

  const handleBrandToggle = useCallback((id: number) => {
    dispatch({ type: 'TOGGLE_BRAND', payload: id });
  }, []);

  // ---- Price handlers ----
  const handlePriceSliderChange = useCallback((value: number[]) => {
    dispatch({ type: 'SET_TEMP_PRICE_RANGE', payload: [value[0], value[1]] });
  }, []);

  const handleMaxPriceInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (value <= MAX_PRICE && value >= tempMinPrice) {
      dispatch({ type: 'SET_TEMP_PRICE_RANGE', payload: [tempMinPrice, value] });
    }
  };

  const handleMinPriceInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (value >= MIN_PRICE && value <= tempMaxPrice) {
      dispatch({ type: 'SET_TEMP_PRICE_RANGE', payload: [value, tempMaxPrice] });
    }
  };

  // ✅ تطبيق فلتر السعر فقط عند الضغط على السهم
  const handleApplyPriceFilter = useCallback(() => {
    // تطبيق السعر في الـ state
    dispatch({ type: 'APPLY_PRICE_FILTER' });
    
    // إرسال الفلاتر مع السعر المطبق إلى المكون الأب
    const filters = buildAppliedFilters({
      ...state,
      appliedPriceRange: state.tempPriceRange, // استخدم القيم المؤقتة كقيم مطبقة
    });
    onFilterChangeRef.current(filters);
  }, [state]);

  const handleResetFilters = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
    onFilterChangeRef.current({});
    if (onClose && isMobile) onClose();
  }, [onClose, isMobile]);

  // ✅ حساب عدد الفلاتر المختارة
  const getSelectedFiltersCount = useCallback(() => {
    let count = 0;
    if (state.selectedCategories.length) count += state.selectedCategories.length;
    if (state.selectedSubcategories.length) count += state.selectedSubcategories.length;
    if (state.selectedColors.length) count += state.selectedColors.length;
    if (state.selectedSizes.length) count += state.selectedSizes.length;
    if (state.selectedBrands.length) count += state.selectedBrands.length;
    // ✅ استخدم appliedPriceRange بدلاً من tempPriceRange
    if (state.appliedPriceRange) {
      const [min, max] = state.appliedPriceRange;
      if (min > MIN_PRICE || max < MAX_PRICE) count++;
    }
    return count;
  }, [state]);

  // ✅ تحديد الكاتجوري المختار
  const selectedCategoryName = useMemo(() => {
    if (state.selectedCategories.length === 0) return null;
    const cat = categories.find(c => c.id === state.selectedCategories[0]);
    return cat?.name || null;
  }, [state.selectedCategories, categories]);

  return (
    <div
      className={`
        border rounded-xl p-4
        ${
          isMobile
            ? 'w-full max-h-[calc(100vh-80px)] overflow-y-auto my-0 border-0 rounded-none'
            : 'sticky top-[10%] mx-auto my-3 w-[340px]'
        }
      `}
    >
      <h3 className="text-[18.28px] mb-4 text-[#180100] flex justify-between items-center">
        فلتر
        <button
          onClick={handleResetFilters}
          className="text-sm text-[#666666] border py-[10px] px-[18px] rounded-full border-[#999999] font-normal"
        >
          مسح الكل
        </button>
      </h3>

      {/* ===== فلتر السعر ===== */}
      <FilterSection title="الاسعار">
        <div className="space-y-4">
          <p className="text-sm text-[#333333] flex justify-end gap-1">
            <span>L.E</span>
            {tempMaxPrice.toLocaleString()}
            <span>-</span>
            <span>L.E</span>
            {tempMinPrice.toLocaleString()}
          </p>

          <Slider
            value={state.tempPriceRange}
            onValueChange={handlePriceSliderChange}
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={10}
            className="my-6"
          />

          <div className="flex gap-3 mt-2 items-center">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">الحد الأقصى</label>
              <input
                type="number"
                value={tempMaxPrice}
                onChange={handleMaxPriceInputChange}
                className="w-full px-3 py-2 border border-gray-3000 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">الحد الأدنى</label>
              <input
                type="number"
                value={tempMinPrice}
                onChange={handleMinPriceInputChange}
                className="w-full px-3 py-2 border border-gray-3000 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* ✅ زر تطبيق السعر - يعمل فقط عند الضغط عليه */}
            {!isMobile && (
              <div className="mt-4">
                <button
                  onClick={handleApplyPriceFilter}
                  className="w-[32.89px] rounded-[7px] bg-[#0A0500] text-white py-2 transition-colors font-semibold flex items-center justify-center gap-2 hover:bg-[#2a2a2a]"
                >
                  <FaArrowLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </FilterSection>

      {/* ===== فلتر الكاتجوريز ===== */}
      <FilterSection title="الفئات الرئيسية">
        <CheckboxFilterList
          items={categories}
          selectedValues={state.selectedCategories}
          getKey={(category) => category.id}
          getLabel={(category) => category.name}
          onToggle={handleCategoryToggle}
          loadingMessage="جاري تحميل الفئات..."
          maxHeightClassName="max-h-64"
        />
      </FilterSection>

      {/* ===== فلتر الـ subcategories (يظهر فقط لو في كاتجوري مختار) ===== */}
      {state.selectedCategories.length > 0 && currentSubcategories.length > 0 && (
        <FilterSection 
          title={selectedCategoryName ? `الفئات الفرعية - ${selectedCategoryName}` : "الفئات الفرعية"}
          defaultOpen={true}
        >
          {currentSubcategories.length > 0 ? (
            <CheckboxFilterList
              items={currentSubcategories}
              selectedValues={state.selectedSubcategories}
              getKey={(subcategory) => subcategory.id}
              getLabel={(subcategory) => subcategory.name}
              onToggle={handleSubcategoryToggle}
              loadingMessage="جاري تحميل الفئات الفرعية..."
              maxHeightClassName="max-h-64"
            />
          ) : (
            <p className="text-sm text-gray-400">لا توجد فئات فرعية لهذا القسم</p>
          )}
        </FilterSection>
      )}

      {/* ===== فلتر الألوان ===== */}
      <FilterSection title="الألوان">
        <ColorSwatchList
          colors={colors}
          selectedColors={state.selectedColors}
          onToggle={handleColorToggle}
          loadingMessage="جاري تحميل الألوان..."
        />
      </FilterSection>

      {/* ===== فلتر المقاسات ===== */}
      <FilterSection title="المقاسات">
        <CheckboxFilterList
          items={sizes}
          selectedValues={state.selectedSizes}
          getKey={(size) => size.value}
          getLabel={(size) => size.value}
          onToggle={handleSizeToggle}
          loadingMessage="جاري تحميل المقاسات..."
          maxHeightClassName="max-h-64"
        />
      </FilterSection>

      {/* ===== فلتر العلامات التجارية ===== */}
      <FilterSection title="العلامات التجارية">
        <CheckboxFilterList
          items={brands}
          selectedValues={state.selectedBrands}
          getKey={(brand) => brand.id}
          getLabel={(brand) => brand.name}
          onToggle={handleBrandToggle}
          loadingMessage="جاري تحميل العلامات التجارية..."
          maxHeightClassName="max-h-48"
        />
      </FilterSection>

      {/* ✅ زر تطبيق الفلاتر (يظهر فقط في الموبايل) */}
      {isMobile && (
        <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200 -mx-4 px-4 mt-4">
          <button
            onClick={applyFilters}
            className="w-full bg-[#EC221F] text-white py-3 rounded-[8px] font-semibold text-base transition-colors hover:bg-[#e0201c] flex items-center justify-center gap-2"
          >
            تطبيق 
          </button>
        </div>
      )}
    </div>
  );
}