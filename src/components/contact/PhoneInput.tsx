// components/contact/PhoneInput.tsx
"use client";

import { useState, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface PhoneInputProps {
  value: string;  // القيمة كاملة (مثال: "+966512345678")
  onChange: (phone: string, countryCode: string) => void;
  required?: boolean;
}

interface CountryCode {
  code: string;
  country: string;
  countryCode: string;
  placeholder: string;
  example: string;
  pattern: RegExp;
  minLength: number;
  maxLength: number;
  startsWith: string[];
}

// بيانات الدول مع قواعد الفالديشن لكل دولة
const countryCodes: CountryCode[] = [
  { 
    code: "+20", 
    country: "مصر", 
    countryCode: "EG",
    placeholder: "01234567890",
    example: "01234567890",
    pattern: /^01[0125][0-9]{8}$/,
    minLength: 11,
    maxLength: 11,
    startsWith: ["010", "011", "012", "015"]
  },
  { 
    code: "+966", 
    country: "السعودية", 
    countryCode: "SA",
    placeholder: "0512345678",
    example: "0512345678",
    pattern: /^05[0-9]{8}$/,
    minLength: 9,
    maxLength: 10,
    startsWith: ["05"]
  },
  { 
    code: "+964", 
    country: "العراق", 
    countryCode: "IQ",
    placeholder: "07701234567",
    example: "07701234567",
    pattern: /^07[0-9]{9}$/,
    minLength: 11,
    maxLength: 11,
    startsWith: ["07"]
  },
  { 
    code: "+971", 
    country: "الإمارات", 
    countryCode: "AE",
    placeholder: "0501234567",
    example: "0501234567",
    pattern: /^05[0-9]{8}$/,
    minLength: 9,
    maxLength: 9,
    startsWith: ["05"]
  },
];

export default function PhoneInput({ value, onChange, required = false }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]);
  const [error, setError] = useState("");
  const [localPhoneNumber, setLocalPhoneNumber] = useState("");
  const [isTouched, setIsTouched] = useState(false);

  // استخراج كود الدولة والرقم من القيمة الأولية
  useEffect(() => {
    if (value) {
      // تجربة مطابقة الرقم مع أي دولة
      let matchedCountry: CountryCode | undefined;
      let phoneNumber = value;
      
      for (const country of countryCodes) {
        if (value.startsWith(country.code)) {
          matchedCountry = country;
          phoneNumber = value.replace(country.code, "");
          break;
        }
      }
      
      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
        // إزالة أي مسافات أو شرطات من الرقم
        const cleanNumber = phoneNumber.replace(/[\s\-]/g, "");
        setLocalPhoneNumber(cleanNumber);
      } else if (value) {
        // إذا كان هناك رقم بدون كود، نستخدم البلد المحدد حالياً
        const cleanNumber = value.replace(/[\s\-]/g, "");
        setLocalPhoneNumber(cleanNumber);
      }
    }
  }, [value]);

  // التحقق من الرقم حسب الدولة
  const validatePhoneNumber = (phoneNumber: string, country: CountryCode): boolean => {
    if (!phoneNumber && required) {
      setError("رقم الهاتف مطلوب");
      return false;
    }
    
    if (!phoneNumber) {
      setError("");
      return false;
    }
    
    // إزالة المسافات والشرطات
    const cleanNumber = phoneNumber.replace(/[\s\-]/g, "");
    
    // التحقق من أن الإدخال أرقام فقط
    if (!/^\d+$/.test(cleanNumber)) {
      setError("يجب أن يحتوي رقم الهاتف على أرقام فقط");
      return false;
    }
    
    
    
    // التحقق من البداية
    const startsWithValid = country.startsWith.some(prefix => 
      cleanNumber.startsWith(prefix)
    );
    
    if (!startsWithValid) {
      setError(`رقم الهاتف في ${country.country} يجب أن يبدأ بـ (${country.startsWith.join(" أو ")})`);
      return false;
    }
    
    // التحقق من الـ Pattern
    if (!country.pattern.test(cleanNumber)) {
      setError(`رقم الهاتف غير صحيح (مثال: ${country.example})`);
      return false;
    }
    
    setError("");
    return true;
  };

  const handleCountrySelect = (countryCode: string | null) => {
    if (!countryCode) return;
    const country = countryCodes.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      setError("");
      setIsTouched(true);
      
      // إعادة التحقق من الرقم الحالي مع البلد الجديد
      if (localPhoneNumber) {
        const isValid = validatePhoneNumber(localPhoneNumber, country);
        onChange(localPhoneNumber, country.code);
      } else {
        onChange("", country.code);
      }
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // إزالة أي أحرف غير رقمية
    const numbersOnly = rawValue.replace(/[^\d]/g, "");
    
    // السماح بإدخال حتى الحد الأقصى للرقم (وليس أقل)
    // لا نحد من الإدخال هنا، نسمح للمستخدم بكتابة العدد المطلوب
    // if (numbersOnly.length > selectedCountry.maxLength) {
     
    //   numbersOnly = numbersOnly.slice(0, selectedCountry.maxLength);
    // }
    
    // تحديث الحالة المحلية
    setLocalPhoneNumber(numbersOnly);
    setIsTouched(true);
    
    // التحقق من الصحة
    validatePhoneNumber(numbersOnly, selectedCountry);
    
    // إرسال التغيير للمكون الأب
    onChange(numbersOnly, selectedCountry.code);
  };

  const handleBlur = () => {
    setIsTouched(true);
    if (localPhoneNumber) {
      validatePhoneNumber(localPhoneNumber, selectedCountry);
    } else if (required) {
      setError("رقم الهاتف مطلوب");
    }
  };

  // تنسيق الرقم للعرض - بدون مسافات
  const formatDisplayNumber = (number: string, country: CountryCode): string => {
    // فقط نرجع الرقم كما هو بدون أي تنسيق أو مسافات
    return number;
  };

  return (
    <div className="w-full">
      {/* <label className="block text-sm font-medium text-gray-700 mb-1">
        رقم الجوال {required && <span className="text-red-500">*</span>}
      </label> */}
      
      <div>
        <div className="relative flex flex-row-reverse items-stretch">
          <div className="flex-1 relative">
            <input
              type="tel"
              value={formatDisplayNumber(localPhoneNumber, selectedCountry)}
              onChange={handleNumberChange}
              onBlur={handleBlur}
              required={required}
              placeholder={selectedCountry.placeholder}
              inputMode="numeric"
              className={`w-full px-4 h-full border rounded-l-xl rounded-r-none focus:outline-none  transition bg-white text-left font-mono text-base
                ${error && isTouched && localPhoneNumber 
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                  : !error && localPhoneNumber && localPhoneNumber.length === selectedCountry.minLength
                  ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                  : "border-gray-200 focus:border-[#EC221F] focus:ring-[#EC221F]"
                }`}
              style={{
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}
              dir="ltr"
            />
          </div>
          
          <div className="relative">
            <Select value={selectedCountry.code} onValueChange={handleCountrySelect}>
              <SelectTrigger 
                className="!h-12 bg-white border-gray-200 rounded-r-xl rounded-l-none border-l-0 focus:ring-0 focus:border-gray-200 min-w-[110px]"
                style={{ 
                  borderTopLeftRadius: 0, 
                  borderBottomLeftRadius: 0,
                  boxShadow: 'none'
                }}
              >
                <div className="flex items-center gap-2">
                  <ReactCountryFlag
                    countryCode={selectedCountry.countryCode}
                    svg
                    style={{
                      width: '24px',
                      height: '16px',
                      objectFit: 'cover'
                    }}
                    title={selectedCountry.country}
                  />
                  <span className="text-sm font-medium text-gray-700">{selectedCountry.code}</span>
                  <span className="text-xs text-gray-500 hidden sm:inline">({selectedCountry.country})</span>
                </div>
              </SelectTrigger>
              <SelectContent 
                align="center" 
                side="bottom" 
                sideOffset={4}
                className="min-w-[220px]"
              >
                {countryCodes.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-3 py-1">
                      <ReactCountryFlag
                        countryCode={country.countryCode}
                        svg
                        style={{
                          width: '28px',
                          height: '20px',
                          objectFit: 'cover'
                        }}
                        title={country.country}
                      />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-semibold text-gray-800">{country.country}</span>
                        <div className="flex gap-2 text-xs text-gray-500">
                          <span>{country.code}</span>
                          <span>•</span>
                          <span>{country.minLength} أرقام</span>
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* رسالة الخطأ */}
        {error && isTouched && (
          <p className="text-red-500 text-sm mt-1">
            ⚠ {error}
          </p>
        )}
        
        {/* رسالة النجاح */}
        {!error && localPhoneNumber && localPhoneNumber.length === selectedCountry.minLength && (
          <p className="text-green-600 text-sm mt-1">
            ✓ رقم صحيح لدولة {selectedCountry.country}
          </p>
        )}
        
        {/* معلومات المساعدة - تظهر أثناء الكتابة */}
        {!error && localPhoneNumber && localPhoneNumber.length < selectedCountry.minLength && localPhoneNumber.length > 0 && (
          <p className="text-blue-500 text-xs mt-1">
            📝 كتبت {localPhoneNumber.length} من {selectedCountry.minLength} أرقام
          </p>
        )}
        
        {/* معلومات المساعدة - عندما يكون الحقل فارغاً */}
        {/* {!error && !localPhoneNumber && (
          <p className="text-gray-400 text-xs mt-1">
            مثال: {selectedCountry.example} ({selectedCountry.minLength} أرقام)
          </p>
        )} */}
      </div>
    </div>
  );
}