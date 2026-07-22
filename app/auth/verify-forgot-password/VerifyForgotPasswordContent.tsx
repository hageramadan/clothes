// app/auth/verify-forgot-password/VerifyForgotPasswordContent.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";
import { verifyForgotPassword } from "@/services/api";

export default function VerifyForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(59);
  const [canResend, setCanResend] = useState(false);
  
  const email = searchParams.get("email") || "";
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]); // ✅ إضافة useRef

  useEffect(() => {
    if (!email) {
      toast.error("البريد الإلكتروني مطلوب للتحقق");
      setTimeout(() => router.push("/auth/forgot-password"), 2000);
    }
  }, [email, router]);

  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !canResend) {
      setCanResend(true);
    }
  }, [timeLeft, canResend]);

  // ✅ دالة معالجة اللصق (Paste)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    const pastedData = e.clipboardData.getData("text");
    const cleanedData = pastedData.replace(/\s/g, "").replace(/[^0-9]/g, "");
    
    if (cleanedData.length >= 6) {
      const otpDigits = cleanedData.slice(0, 6).split("");
      const newOtp = [...otp];
      otpDigits.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });
      setOtp(newOtp);
      
      const lastFilledIndex = Math.min(otpDigits.length, 5);
      if (lastFilledIndex < 5) {
        inputRefs.current[lastFilledIndex + 1]?.focus();
      } else {
        inputRefs.current[lastFilledIndex]?.focus();
      }
    } else {
      const otpDigits = cleanedData.split("");
      const newOtp = [...otp];
      otpDigits.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });
      setOtp(newOtp);
      
      const lastFilledIndex = Math.min(otpDigits.length, 5);
      if (lastFilledIndex < 5) {
        inputRefs.current[lastFilledIndex + 1]?.focus();
      }
      
      if (cleanedData.length > 0 && cleanedData.length < 6) {
        toast.error("الرمز غير مكتمل", {
          duration: 2000,
        });
      }
    }
  };

  // ✅ دالة تغيير OTP (معدلة لاستخدام ref)
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ✅ دالة معالجة الضغط على المفاتيح (معدلة مع ArrowRight, ArrowLeft, Delete)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // ✅ التنقل بالأسهم (يمين ويسار)
    if (e.key === "ArrowRight") {
      e.preventDefault();
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    
    // ✅ Backspace - حذف والانتقال للخلف
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
    
    // ✅ Delete - حذف للأمام
    if (e.key === "Delete") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
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

    try {
      const result = await verifyForgotPassword({ otp: otpValue, email });

      if (result.result) {
        toast.success("تم التحقق بنجاح! ✅");
        
        setTimeout(() => {
          router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        toast.error(result.message || "رمز التحقق غير صحيح");
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    
    try {
      const { forgotPassword } = await import("@/services/api");
      const result = await forgotPassword({ email });

      if (result.result) {
        toast.success("تم إرسال رمز جديد إلى بريدك الإلكتروني");
        setCanResend(false);
        setTimeLeft(59);
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      } else {
        toast.error(result.message || "فشل إعادة إرسال الرمز");
      }
    } catch (error) {
      console.error('Error in handleResendCode:', error);
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 md:p-8">
        {/* زر الرجوع */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span className="text-sm">رجوع</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">التحقق من البريد الإلكتروني</h1>
          <p className="text-gray-500 text-sm">
            أدخل الرقم المكون من 6 أرقام الذي أرسلناه إلى بريدك الإلكتروني
          </p>
          <p className="text-gray-700 font-medium mt-2 break-all">{email}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-between gap-2 mb-6 flex-row-reverse" dir="rtl">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code" // ✅ إضافة autoComplete
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste} // ✅ إضافة onPaste
                disabled={isLoading}
                className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-[#ff3c27] focus:ring-2 focus:ring-[#ff3c27]/20 outline-none transition-all disabled:opacity-50"
                maxLength={1}
                dir="ltr"
              />
            ))}
          </div>

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
                className="text-[#ff3c27] font-medium hover:underline disabled:opacity-50"
              >
                لم تستلم الرمز؟ إعادة إرسال
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-black text-white rounded-[8px] hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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