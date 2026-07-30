// components/contact/ContactForm.tsx
"use client";

import { useState } from "react";
import FormInput from "./FormInput";
import PhoneInput from "./PhoneInput";
import SubmitButton from "./SubmitButton";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  country_code: string;
  message: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    country_code: "+20",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // معالج رقم الهاتف المعدل - يستقبل الرقم ورمز الدولة بشكل منفصل
  const handlePhoneChange = (phone: string, countryCode: string) => {
    setFormData((prev) => ({
      ...prev,
      phone: phone,
      country_code: countryCode,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // تجهيز البيانات للإرسال
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone, // الرقم فقط بدون رمز الدولة
        country_code: formData.country_code, // رمز الدولة منفصل
        message: formData.message,
      };


      const response = await fetch("https://fashion.admin.t-carts.com/api/contact-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.result === true) {
        setIsSubmitted(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          country_code: "+20",
          message: "",
        });
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        setErrorMessage(data.message || "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage("حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm h-fit">
      {isSubmitted && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          تم إرسال رسالتك بنجاح! سنقوم بالرد عليك قريباً.
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          label="الاسم"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="أدخل اسمك كاملاً"
          required
        />

        <FormInput
          label="البريد الإلكتروني"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="example@domain.com"
          required
        />

        <PhoneInput
          value={`${formData.country_code} ${formData.phone}`}
          onChange={handlePhoneChange}
          required
        />

        <FormInput
          label="رسالتك"
          name="message"
          type="textarea"
          value={formData.message}
          onChange={handleChange}
          placeholder="اكتب رسالتك هنا..."
          rows={5}
          required
        />

        <SubmitButton isSubmitting={isSubmitting} />
      </form>
    </div>
  );
}