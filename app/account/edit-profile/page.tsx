"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaUser, FaCamera, FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { changePassword, updateUserProfile, getUserProfile } from "@/services/api";
import { Loader } from "lucide-react";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logoutUser, updateUserData } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true); // ✅ حالة تحميل الصفحة
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [existingAvatar, setExistingAvatar] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // دالة لجلب بيانات المستخدم
  const fetchUserProfile = useCallback(async () => {
    setIsPageLoading(true); // ✅ بدء التحميل
    try {
      if (!authLoading && isAuthenticated) {
        const result = await getUserProfile();
        if (result.result && result.data?.user) {
          setFormData({
            name: result.data.user.name || "",
            email: result.data.user.email || "",
            phone: result.data.user.phone || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          if (result.data.user.image) {
            setExistingAvatar(`https://fashion.admin.t-carts.com${result.data.user.image}`);
          } else {
            setExistingAvatar(null);
          }
        } else if (user) {
          setFormData({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          if (user.image) {
            setExistingAvatar(`https://fashion.admin.t-carts.com${user.image}`);
          } else {
            setExistingAvatar(null);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (user) {
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } finally {
      setIsPageLoading(false); // ✅ انتهاء التحميل
    }
  }, [user, authLoading, isAuthenticated]);

  // تحميل بيانات المستخدم
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // التحقق من حالة تسجيل الدخول
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("الرجاء تسجيل الدخول أولاً", {
        duration: 2000,
        position: "top-center",
      });
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    }
  }, [isAuthenticated, authLoading, router]);

  // تنظيف معاينة الصورة
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن يكون أقل من 2 ميجابايت");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error("الرجاء اختيار ملف صورة صالح");
        return;
      }
      
      setAvatar(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // التحقق من الاسم
    if (!formData.name.trim()) {
      newErrors.name = "الاسم الكامل مطلوب";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "الاسم يجب أن يكون 3 أحرف على الأقل";
    }

    // التحقق من البريد الإلكتروني
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "البريد الإلكتروني غير صحيح";
      }
    }

    // التحقق من رقم الهاتف
    if (formData.phone) {
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = "رقم الهاتف غير صحيح (10-15 رقم)";
      }
    }

    // التحقق من كلمة المرور
    const hasCurrentPassword = formData.currentPassword.trim() !== "";
    const hasNewPassword = formData.newPassword.trim() !== "";
    const hasConfirmPassword = formData.confirmPassword.trim() !== "";

    if (hasCurrentPassword || hasNewPassword || hasConfirmPassword) {
      if (!hasCurrentPassword) {
        newErrors.currentPassword = "الرجاء إدخال كلمة المرور الحالية";
      }
      if (!hasNewPassword) {
        newErrors.newPassword = "الرجاء إدخال كلمة المرور الجديدة";
      }
      if (!hasConfirmPassword) {
        newErrors.confirmPassword = "الرجاء تأكيد كلمة المرور الجديدة";
      }
      if (hasCurrentPassword && hasNewPassword && hasConfirmPassword) {
        if (formData.newPassword.length < 6) {
          newErrors.newPassword = "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل";
        }
        if (formData.newPassword !== formData.confirmPassword) {
          newErrors.confirmPassword = "كلمة المرور الجديدة غير متطابقة";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // دالة للتحقق مما إذا كانت هناك تغييرات حقيقية
  const hasChanges = useCallback((): boolean => {
    if (formData.name !== user?.name) return true;
    if (formData.email !== user?.email) return true;
    if (formData.phone !== user?.phone) return true;
    if (avatar !== null) return true;
    
    const hasPasswordChange = formData.currentPassword || formData.newPassword || formData.confirmPassword;
    if (hasPasswordChange) return true;
    
    return false;
  }, [formData, user, avatar]);

  const handleChangePassword = async () => {
    if (!formData.currentPassword && !formData.newPassword && !formData.confirmPassword) {
      return true;
    }
    
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error("الرجاء ملء جميع حقول كلمة المرور");
      return false;
    }
    
    try {
      const result = await changePassword({
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
        new_password_confirmation: formData.confirmPassword,
      });

      if (result.result) {
        toast.success("تم تغيير كلمة المرور بنجاح! ✅");
        return true;
      } else {
        toast.error(result.message || "فشل تغيير كلمة المرور");
        return false;
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("حدث خطأ أثناء تغيير كلمة المرور");
      return false;
    }
  };

  const handleUpdateProfile = async () => {
    const hasProfileChanges = 
      formData.name !== user?.name ||
      formData.email !== user?.email ||
      formData.phone !== user?.phone ||
      avatar !== null;
    
    if (!hasProfileChanges) {
      return true;
    }
    
    const profileData: any = {
      name: formData.name,
      locale: "ar",
    };
    
    if (formData.email && formData.email !== user?.email) {
      profileData.email = formData.email;
    }
    
    if (formData.phone && formData.phone !== user?.phone) {
      profileData.phone = formData.phone;
    }
    
    if (avatar) {
      profileData.image = avatar;
    }
    
    try {
      const result = await updateUserProfile(profileData);
      
      if (result.result) {
        await fetchUserProfile();
        return true;
      } else {
        toast.error(result.message || "فشل تحديث المعلومات الشخصية");
        return false;
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("حدث خطأ أثناء تحديث المعلومات الشخصية");
      return false;
    }
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
    
    if (!hasChanges()) {
      toast.error("لا توجد تغييرات لحفظها", {
        duration: 2000,
        position: "top-center",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let passwordChanged = true;
      const hasPasswordChange = formData.currentPassword || formData.newPassword || formData.confirmPassword;
      
      if (hasPasswordChange) {
        passwordChanged = await handleChangePassword();
      }

      if (!passwordChanged) {
        setIsSubmitting(false);
        return;
      }

      const profileUpdated = await handleUpdateProfile();

      if (!profileUpdated) {
        setIsSubmitting(false);
        return;
      }
      
      await updateUserData();
      
      // toast.success("تم تحديث الملف الشخصي بنجاح ✅", {
      //   duration: 3000,
      //   position: "top-center",
      // });
      
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatar(null);
      setAvatarPreview(null);
      
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      
      setTimeout(() => {
        router.push("/account");
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("حدث خطأ أثناء تحديث الملف الشخصي", {
        duration: 3000,
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFieldError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // ✅ عرض شاشة تحميل كاملة أثناء تحميل الصفحة أو المصادقة
  if (authLoading || isPageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center">
        <div className="text-center">
          
           <div className="relative">
            <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-8 h-8 md:w-12 md:h-12 border-4 border-[#EC221F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getUserInitial = () => {
    if (!formData.name) return "U";
    return formData.name.charAt(0).toUpperCase();
  };

  const displayAvatar = avatarPreview || existingAvatar;

  return (
    <>
      {/* <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: '14px',
            padding: '12px 16px',
            borderRadius: '8px',
            direction: 'rtl',
          },
        }}
      /> */}
      
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
        <div className="container mx-auto py-6">
          {/* سهم الرجوع */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <FaArrowRight className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-[#180100]">تعديل الملف الشخصي</h1>
          </div>

          <form onSubmit={handleSubmit}>
            {/* بطاقة الصورة الشخصية */}
            <div className="bg-white rounded-2xl shadow-sm p-3 md:p-6 mb-5 flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  {displayAvatar ? (
                    <Image
                      src={displayAvatar}
                      alt={formData.name || "User"}
                      width={100}
                      height={100}
                      unoptimized  
                      className="rounded-full object-cover h-16 w-16 md:w-24 md:h-24 border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="h-16 w-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#ff6b6b] to-[#ff3c27] flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl md:text-4xl font-bold">
                        {getUserInitial()}
                      </span>
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md cursor-pointer hover:bg-gray-50 transition">
                    <FaCamera className="w-3.5 h-3.5 text-gray-600" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="mr-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">
                    {formData.name || "مستخدم"}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <span>{formData.email || "البريد الإلكتروني غير مضاف"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* نموذج المعلومات */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mt-3">
              {/* المعلومات الشخصية */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 pb-2 mb-4">
                  المعلومات الشخصية
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-3">
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      الاسم الكامل <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        clearFieldError("name");
                      }}
                      placeholder="أدخل الاسم الكامل"
                      disabled={isSubmitting}
                      className={`w-full px-4 py-2 border rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      } ${isSubmitting ? "opacity-50" : ""}`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      رقم الجوال
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        clearFieldError("phone");
                      }}
                      placeholder="مثال: 01234567890"
                      disabled={isSubmitting}
                      className={`w-full px-4 py-2 border rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      } ${isSubmitting ? "opacity-50" : ""}`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      clearFieldError("email");
                    }}
                    placeholder="example@email.com"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2 border rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } ${isSubmitting ? "opacity-50" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* تغيير كلمة المرور */}
              <div className="my-6">
                <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">
                  تغيير كلمة المرور
                </h2>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    كلمة المرور الحالية
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, currentPassword: e.target.value });
                        clearFieldError("currentPassword");
                      }}
                      placeholder="************"
                      disabled={isSubmitting}
                      className={`w-full px-4 py-2 border rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors ${
                        errors.currentPassword ? "border-red-500" : "border-gray-300"
                      } ${isSubmitting ? "opacity-50" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      disabled={isSubmitting}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, newPassword: e.target.value });
                        clearFieldError("newPassword");
                      }}
                      placeholder="************ (6 أحرف على الأقل)"
                      disabled={isSubmitting}
                      className={`w-full px-4 py-2 border rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors ${
                        errors.newPassword ? "border-red-500" : "border-gray-300"
                      } ${isSubmitting ? "opacity-50" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isSubmitting}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        clearFieldError("confirmPassword");
                      }}
                      placeholder="************"
                      disabled={isSubmitting}
                      className={`w-full px-4 py-2 border rounded-[8px] focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors ${
                        errors.confirmPassword ? "border-red-500" : "border-gray-300"
                      } ${isSubmitting ? "opacity-50" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isSubmitting}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

            
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-[8px] hover:bg-gray-50 transition disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex justify-center gap-1 px-4 py-2 bg-black text-white rounded-[8px] hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ التغييرات"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}