// components/checkout/PaymentMethodForm.tsx
"use client";

import { CreditCard, DollarSign, Wallet, Landmark } from "lucide-react";
import { useState, useEffect } from "react";

interface PaymentMethodFormProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  onPaymentGatewayChange?: (gateway: string | null) => void; // ✅ إضافة هذا السطر فقط
}

export default function PaymentMethodForm({
  paymentMethod,
  onPaymentMethodChange,
  onPaymentGatewayChange, // ✅ إضافة هذا السطر فقط
}: PaymentMethodFormProps) {
  const [isWalletAvailable, setIsWalletAvailable] = useState(true);

  // تعيين المحفظة كخيار افتراضي عند تحميل المكون
  useEffect(() => {
    if (isWalletAvailable && !paymentMethod) {
      onPaymentMethodChange("wallet");
    }
  }, [isWalletAvailable, paymentMethod, onPaymentMethodChange]);

  // دالة مساعدة للحصول على قيمة payment_gateway
  const getPaymentGateway = (method: string) => {
    switch (method) {
      case "wallet":
        return "wallet";
      case "cash":
        return null; // ✅ تعديل: الكاش مش محتاج gateway
      case "card":
        return "paymob"; // ✅ تعديل: كارد → paymob
      case "mada":
        return "mada";
      default:
        return null;
    }
  };

  // عند تغيير طريقة الدفع، نقوم بإرسال القيمة مع payment_gateway
  const handlePaymentChange = (method: string) => {
    onPaymentMethodChange(method);
    
    // ✅ إضافة: إرسال الـ gateway للـ parent
    const gateway = getPaymentGateway(method);
    if (onPaymentGatewayChange) {
      onPaymentGatewayChange(gateway);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        طريقة الدفع
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* محفظة - الخيار الأول والافتراضي */}
        <label
          className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${
            paymentMethod === "wallet"
              ? "border-[#EC221F] bg-red-50"
              : "border-gray-200 hover:border-gray-300"
          } ${!isWalletAvailable ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="wallet"
            checked={paymentMethod === "wallet"}
            onChange={() => handlePaymentChange("wallet")}
            className="w-4 h-4 text-[#EC221F] focus:ring-[#EC221F]"
            disabled={!isWalletAvailable}
          />
          <Wallet className="w-5 h-5 text-orange-600" />
          <div>
            <p className="font-medium text-gray-800">محفظة</p>
            {!isWalletAvailable && (
              <p className="text-xs text-gray-500 mt-1">
                غير متاحة حالياً - سوف تتوفر قريباً
              </p>
            )}
          </div>
        </label>

        {/* الدفع عند الاستلام */}
        <label
          className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${
            paymentMethod === "cash"
              ? "border-[#EC221F] bg-red-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="cash"
            checked={paymentMethod === "cash"}
            onChange={() => handlePaymentChange("cash")}
            className="w-4 h-4 text-[#EC221F] focus:ring-[#EC221F]"
          />
          <DollarSign className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-gray-800">الدفع عند الاستلام</p>
          </div>
        </label>

        {/* بطاقة ائتمان */}
        <label
          className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${
            paymentMethod === "card"
              ? "border-[#EC221F] bg-red-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="card"
            checked={paymentMethod === "card"}
            onChange={() => handlePaymentChange("card")}
            className="w-4 h-4 text-[#EC221F] focus:ring-[#EC221F]"
          />
          <CreditCard className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-medium text-gray-800">بطاقة ائتمان</p>
          </div>
        </label>

        {/* مدى (Mada) */}
        {/* <label
          className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${
            paymentMethod === "mada"
              ? "border-[#EC221F] bg-red-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="mada"
            checked={paymentMethod === "mada"}
            onChange={() => handlePaymentChange("mada")}
            className="w-4 h-4 text-[#EC221F] focus:ring-[#EC221F]"
          />
          <Landmark className="w-5 h-5 text-purple-600" />
          <div>
            <p className="font-medium text-gray-800">مدى</p>
          </div>
        </label> */}
      </div>

      
    </div>
  );
}