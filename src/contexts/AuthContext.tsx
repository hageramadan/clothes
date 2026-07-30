// src/contexts/AuthContext.tsx

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { 
  getToken, 
  getUserData, 
  logout, 
  saveToken, 
  saveUserData,
  loginWithEmail,
  loginWithPhone,
  registerWithEmail,
  registerWithPhone,
  resendOTP,
  getUserProfile,
} from '../services/api';
import { useCartContext } from './CartContext';

// نوع بيانات المستخدم
interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  image?: string;
}

// نوع بيانات سياق المصادقة
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginWithPhone: (phone: string, password: string, country_code: string) => Promise<{ success: boolean; message: string }>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  registerWithPhone: (name: string, email:string , phone: string, password: string, country_code: string) => Promise<{ success: boolean; message: string }>;
  logoutUser: () => Promise<void>;
  verifyOTPWithEmail: (otp: string, email: string) => Promise<{ success: boolean; message: string; token?: string }>;
  verifyOTPWithPhone: (otp: string, phone: string) => Promise<{ success: boolean; message: string; token?: string }>;
  resendOTPToEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  resendOTPToPhone: (phone: string) => Promise<{ success: boolean; message: string }>;
  updateUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ استخدم useCartContext في المستوى الأعلى
  const { clearGuestMode, refetchCart } = useCartContext();

  // دالة لجلب بيانات المستخدم من API
  const fetchUserData = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        return null;
      }

      const result = await getUserProfile();
      
      if (result.result && result.data?.user) {
        const userData = result.data.user;
        setUser(userData);
        setIsAuthenticated(true);
        return userData;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }, []);

  // دالة تحديث بيانات المستخدم
  const updateUserData = useCallback(async () => {
    setLoading(true);
    try {
      await fetchUserData();
    } catch (error) {
      console.error('Error updating user data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchUserData]);

  // تعريف checkAuthStatus
  const checkAuthStatus = useCallback(() => {
    const token = getToken();
    const userData = getUserData();
    
    if (token && userData?.user) {
      setIsAuthenticated(true);
      setUser(userData.user);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  }, []);

  // التحقق من حالة المستخدم عند تحميل التطبيق
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // ✅ دالة مساعدة لحذف guest_token ومسح وضع الضيف
  const clearGuestModeAndToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guest_cart_token');
    }
    clearGuestMode();
  }, [clearGuestMode]);

  // ✅ دالة لإطلاق الأحداث بعد تسجيل الدخول
  const triggerLoginEvents = useCallback(() => {
    if (typeof window !== 'undefined') {
      // إطلاق أحداث لتحديث المفضلة والسلة
      window.dispatchEvent(new Event('favoritesUpdated'));
      window.dispatchEvent(new Event('authChanged'));
      window.dispatchEvent(new Event('cartUpdated'));
      
      // إطلاق حدث مخصص مع بيانات المستخدم
      const event = new CustomEvent('userLoggedIn', {
        detail: { user: user }
      });
      window.dispatchEvent(event);
      
      console.log('✅ Login events triggered');
    }
  }, [user]);

  // تسجيل الدخول بالبريد الإلكتروني
  const handleLoginWithEmail = useCallback(async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await loginWithEmail({ email, password });
      
      if (result.result) {
        // ✅ حذف guest_token ومسح وضع الضيف
        clearGuestModeAndToken();
        
        // ✅ جلب بيانات المستخدم
        await fetchUserData();
        
        // ✅ إعادة تحميل السلة
        await refetchCart();
        
        // ✅ إطلاق الأحداث
        triggerLoginEvents();
        
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' };
    }
  }, [clearGuestModeAndToken, fetchUserData, refetchCart, triggerLoginEvents]);

  // تسجيل الدخول برقم الهاتف
  const handleLoginWithPhone = useCallback(async (
    phone: string, 
    password: string, 
    country_code: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await loginWithPhone({ phone, password, country_code });
      
      if (result.result) {
        // ✅ حذف guest_token ومسح وضع الضيف
        clearGuestModeAndToken();
        
        // ✅ جلب بيانات المستخدم
        await fetchUserData();
        
        // ✅ إعادة تحميل السلة
        await refetchCart();
        
        // ✅ إطلاق الأحداث
        triggerLoginEvents();
        
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' };
    }
  }, [clearGuestModeAndToken, fetchUserData, refetchCart, triggerLoginEvents]);

  // إنشاء حساب بالبريد الإلكتروني
  const handleRegisterWithEmail = useCallback(async (
    name: string, 
    email: string, 
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await registerWithEmail({ name, email, password });
      
      if (result.result) {
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'حدث خطأ أثناء إنشاء الحساب' };
    }
  }, []);

  // إنشاء حساب برقم الهاتف
  const handleRegisterWithPhone = useCallback(async (
    name: string,
    email: string,
    phone: string,
    password: string,
    country_code: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await registerWithPhone({ name, email, phone, password, country_code });
      
      if (result.result) {
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'حدث خطأ أثناء إنشاء الحساب' };
    }
  }, []);

  // التحقق من OTP للبريد الإلكتروني
  const handleVerifyOTPWithEmail = useCallback(async (otp: string, email: string): Promise<{ success: boolean; message: string; token?: string }> => {
    try {
      const response = await fetch("https://fashion.admin.t-carts.com/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp, email }),
      });

      const result = await response.json();

      if (result.result && result.errNum === 200) {
        if (result.data?.token) {
          saveToken(result.data.token);
        }
        if (result.data?.user) {
          saveUserData({ user: result.data.user });
          setUser(result.data.user);
          setIsAuthenticated(true);
          
          // ✅ حذف guest_token ومسح وضع الضيف
          clearGuestModeAndToken();
          
          // ✅ إعادة تحميل السلة
          await refetchCart();
          
          // ✅ إطلاق الأحداث
          triggerLoginEvents();
        }
        return { success: true, message: result.message, token: result.data?.token };
      } else {
        return { success: false, message: result.message || "رمز التحقق غير صحيح" };
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      return { success: false, message: 'حدث خطأ أثناء التحقق' };
    }
  }, [clearGuestModeAndToken, refetchCart, triggerLoginEvents]);

  // التحقق من OTP للهاتف
  const handleVerifyOTPWithPhone = useCallback(async (otp: string, phone: string): Promise<{ success: boolean; message: string; token?: string }> => {
    try {
      const response = await fetch("https://fashion.admin.t-carts.com/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp, phone }),
      });

      const result = await response.json();

      if (result.result && result.errNum === 200) {
        if (result.data?.token) {
          saveToken(result.data.token);
        }
        if (result.data?.user) {
          saveUserData({ user: result.data.user });
          setUser(result.data.user);
          setIsAuthenticated(true);
          
          // ✅ حذف guest_token ومسح وضع الضيف
          clearGuestModeAndToken();
          
          // ✅ إعادة تحميل السلة
          await refetchCart();
          
          // ✅ إطلاق الأحداث
          triggerLoginEvents();
        }
        return { success: true, message: result.message, token: result.data?.token };
      } else {
        return { success: false, message: result.message || "رمز التحقق غير صحيح" };
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      return { success: false, message: 'حدث خطأ أثناء التحقق' };
    }
  }, [clearGuestModeAndToken, refetchCart, triggerLoginEvents]);

  // إعادة إرسال OTP للبريد الإلكتروني
  const handleResendOTPToEmail = useCallback(async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await resendOTP(email);
      
      if (result.result && result.errNum === 200) {
        return { success: true, message: result.message || "تم إرسال رمز جديد" };
      } else {
        return { success: false, message: result.message || "فشل إعادة إرسال الرمز" };
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      return { success: false, message: 'حدث خطأ أثناء إعادة الإرسال' };
    }
  }, []);

  // إعادة إرسال OTP للهاتف
  const handleResendOTPToPhone = useCallback(async (phone: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch("https://fashion.admin.t-carts.com/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const result = await response.json();

      if (result.result && result.errNum === 200) {
        return { success: true, message: result.message || "تم إرسال رمز جديد" };
      } else {
        return { success: false, message: result.message || "فشل إعادة إرسال الرمز" };
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      return { success: false, message: 'حدث خطأ أثناء إعادة الإرسال' };
    }
  }, []);

  // تسجيل الخروج
  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      
      // ✅ إطلاق أحداث لتحديث المفضلة والسلة
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('favoritesUpdated'));
        window.dispatchEvent(new Event('authChanged'));
        window.dispatchEvent(new Event('cartUpdated'));
      }
    }
  }, []);

  const value = {
    isAuthenticated,
    user,
    loading,
    loginWithEmail: handleLoginWithEmail,
    loginWithPhone: handleLoginWithPhone,
    registerWithEmail: handleRegisterWithEmail,
    registerWithPhone: handleRegisterWithPhone,
    logoutUser: handleLogout,
    verifyOTPWithEmail: handleVerifyOTPWithEmail,
    verifyOTPWithPhone: handleVerifyOTPWithPhone,
    resendOTPToEmail: handleResendOTPToEmail,
    resendOTPToPhone: handleResendOTPToPhone,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook مخصص لاستخدام المصادقة
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}