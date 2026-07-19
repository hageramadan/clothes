// app/auth/verify-forgot-password/page.tsx
import { Suspense } from "react";
import VerifyForgotPasswordContent from "./VerifyForgotPasswordContent";

export default function VerifyForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 md:p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC221F] mx-auto"></div>
          {/* <p className="mt-4 text-gray-600">جاري التحميل...</p> */}
        </div>
      </div>
    }>
      <VerifyForgotPasswordContent />
    </Suspense>
  );
}