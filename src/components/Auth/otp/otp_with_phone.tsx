"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function OTPWithPhone() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOTPWithPhone, resendOTPToPhone, isAuthenticated } = useAuth();
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(59);
  const [canResend, setCanResend] = useState(false);
  
  // جلب رقم الهاتف من الـ URL
  const phone = searchParams.get("phone") || "";
  const isLogin = searchParams.get("isLogin") === "true";

  // التحقق من وجود رقم الهاتف
  useEffect(() => {
    if (!phone) {
      toast.error("رقم الهاتف مطلوب للتحقق");
      setTimeout(() => router.push("/auth/login"), 2000);
    }
  }, [phone, router]);

  // التوجيه إلى الصفحة الرئيسية إذا كان المستخدم موثّقاً
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // مؤقت إعادة الإرسال
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !canResend) {
      setCanResend(true);
    }
  }, [timeLeft, canResend]);

  const handleOtpChange = (index: number, value: string) => {
    // السماح فقط بالأرقام
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    // الانتقال تلقائياً إلى الحقل التالي
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // الانتقال إلى الحقل السابق عند الضغط على Backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      toast.error("يرجى إدخال رمز التحقق المكون من 6 أرقام");
      return;
    }

    setIsLoading(true);

    // ✅ استدعاء دالة التحقق من OTP للهاتف
    const result = await verifyOTPWithPhone(otpValue, phone);

    if (result.success) {
      toast.success("تم التحقق بنجاح! جاري توجيهك... 🎉", {
        duration: 2000,
      });
      
      // ✅ التوجيه إلى الصفحة الرئيسية بعد التحقق
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    } else {
      toast.error(result.message || "رمز التحقق غير صحيح");
    }

    setIsLoading(false);
  };

  const handleResendCode = async () => {
    if (!canResend) {
      toast.error("الرجاء الانتظار قبل إعادة الإرسال");
      return;
    }
    
    setIsLoading(true);

    // ✅ استدعاء دالة إعادة إرسال OTP للهاتف
    const result = await resendOTPToPhone(phone);

    if (result.success) {
      toast.success(result.message || "تم إرسال رمز جديد إلى رقم هاتفك", {
        duration: 3000,
      });
      setCanResend(false);
      setTimeLeft(59);
      setOtp(["", "", "", "", "", ""]);
      
      // التركيز على أول حقل
      setTimeout(() => {
        document.getElementById("otp-0")?.focus();
      }, 100);
    } else {
      toast.error(result.message || "فشل إعادة إرسال الرمز", {
        duration: 4000,
      });
    }

    setIsLoading(false);
  };

  // تنسيق رقم الهاتف للعرض
  const formatPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return "";
    // إزالة علامة + إذا وجدت
    const cleaned = phoneNumber.replace(/^\+/, "");
    // إضافة مسافات بين الأرقام
    return phoneNumber;
  };

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {isLogin ? "التحقق من تسجيل الدخول" : "التحقق من الهاتف"}
          </h1>
          <p className="text-gray-500 text-sm">
            {isLogin 
              ? "أدخل الرقم المكون من 6 أرقام الذي أرسلناه إلى رقم هاتفك لتأكيد تسجيل الدخول"
              : "أدخل الرقم المكون من 6 أرقام الذي أرسلناه إلى رقم هاتفك لتأكيد الحساب"
            }
          </p>
          <p className="text-gray-700 font-medium mt-2 dir-ltr">
            {phone || "رقم الهاتف"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* حقول OTP */}
          <div className="flex justify-between md:gap-2 mb-6 flex-row-reverse">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className="w-10 h-10 md:w-14 md:h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-[#ff3c27] focus:ring-2 focus:ring-[#ff3c27]/20 outline-none transition-all disabled:opacity-50"
                maxLength={1}
              />
            ))}
          </div>

          {/* مؤقت إعادة الإرسال */}
          <div className="text-center mb-6">
            {!canResend ? (
              <p className="text-gray-500 text-sm">
                لم تستلم الرمز؟{" "}
                <span className="text-[#ff3c27] font-medium">
                  إعادة الإرسال ({timeLeft.toString().padStart(2, "0")} ثانية)
                </span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-[#ff3c27] font-medium hover:underline transition disabled:opacity-50"
              >
                لم تستلم الرمز؟ إعادة إرسال
              </button>
            )}
          </div>

          {/* زر التحقق */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-black text-white rounded-[8px] hover:bg-gray-800 transition disabled:opacity-50 font-medium"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></span>
                جاري التحقق...
              </>
            ) : (
              "تحقق"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}