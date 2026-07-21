// app/auth/reset-password/ResetPasswordContent.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";
import { resetPassword } from "@/services/api";

export default function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const email = searchParams.get("email") || "";
  
  const [formData, setFormData] = useState({
    new_password: "",
    new_password_confirmation: "",
  });

  const [errors, setErrors] = useState<{
    new_password?: string;
    new_password_confirmation?: string;
  }>({});

  useEffect(() => {
    if (!email) {
      toast.error("البريد الإلكتروني مطلوب");
      setTimeout(() => router.push("/auth/forgot-password"), 2000);
      return;
    }
    
    // ✅ التحقق من وجود reset_token في localStorage
    if (typeof window !== 'undefined') {
      const resetToken = localStorage.getItem('reset_token');
      const savedEmail = localStorage.getItem('reset_email');
      
      console.log('🔍 Checking reset token:', resetToken);
      console.log('📧 Saved email:', savedEmail);
      console.log('📧 Current email:', email);
      
      if (!resetToken) {
        toast.error("رمز التحقق غير موجود. يرجى المحاولة مرة أخرى");
        setTimeout(() => router.push("/auth/forgot-password"), 2000);
      } else if (savedEmail && savedEmail !== email) {
        toast.error("البريد الإلكتروني غير متطابق. يرجى المحاولة مرة أخرى");
        setTimeout(() => router.push("/auth/forgot-password"), 2000);
      }
    }
  }, [email, router]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.new_password) {
      newErrors.new_password = "كلمة المرور الجديدة مطلوبة";
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    if (!formData.new_password_confirmation) {
      newErrors.new_password_confirmation = "تأكيد كلمة المرور مطلوب";
    } else if (formData.new_password !== formData.new_password_confirmation) {
      newErrors.new_password_confirmation = "كلمة المرور غير متطابقة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    setIsLoading(true);

    try {
      console.log('📤 Sending reset password request for email:', email);
      
      const result = await resetPassword({
        email: email,
        new_password: formData.new_password,
        new_password_confirmation: formData.new_password_confirmation,
      });

      console.log('📥 Reset password response:', result);

      if (result.result) {
        toast.success("تم إعادة تعيين كلمة المرور بنجاح! ✅", {
          duration: 3000,
        });
        
        setTimeout(() => {
          router.push("/auth/login?reset=true");
        }, 1500);
      } else {
        toast.error(result.message || "فشل إعادة تعيين كلمة المرور", {
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span className="text-sm">رجوع</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">إنشاء كلمة مرور جديدة</h1>
          <p className="text-gray-500 text-sm">
            أدخل كلمة المرور الجديدة لحسابك
          </p>
          <p className="text-gray-700 font-medium mt-2 break-all">{email}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-2">
              كلمة المرور الجديدة <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.new_password}
                onChange={(e) => {
                  setFormData({ ...formData, new_password: e.target.value });
                  if (errors.new_password) setErrors({ ...errors, new_password: undefined });
                }}
                placeholder="•••••••• (6 أحرف على الأقل)"
                disabled={isLoading}
                className={`w-full px-4 py-2 pr-10 pl-10 border rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none ${
                  errors.new_password ? "border-red-500" : "border-gray-300"
                } ${isLoading ? "opacity-50" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.new_password && (
              <p className="text-red-500 text-xs mt-1">{errors.new_password}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              تأكيد كلمة المرور <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.new_password_confirmation}
                onChange={(e) => {
                  setFormData({ ...formData, new_password_confirmation: e.target.value });
                  if (errors.new_password_confirmation) setErrors({ ...errors, new_password_confirmation: undefined });
                }}
                placeholder="••••••••"
                disabled={isLoading}
                className={`w-full px-4 py-2 pr-10 pl-10 border rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none ${
                  errors.new_password_confirmation ? "border-red-500" : "border-gray-300"
                } ${isLoading ? "opacity-50" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.new_password_confirmation && (
              <p className="text-red-500 text-xs mt-1">{errors.new_password_confirmation}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-black text-white rounded-[8px] hover:bg-gray-800 transition disabled:opacity-50"
          >
            {isLoading ? "جاري إعادة التعيين..." : "إعادة تعيين كلمة المرور"}
          </button>

          <div className="text-center mt-6 pt-4 border-t">
            <p className="text-gray-600 text-sm">
              تذكرت كلمة المرور؟{" "}
              <button
                type="button"
                onClick={() => router.push("/auth/login")}
                className="text-[#ff3c27] font-medium hover:underline"
              >
                تسجيل الدخول
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}