// app/layout.tsx
import type { Metadata } from "next";
import { Almarai } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { getSettings } from "@/services/settingsApi";

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
});

// القيم الافتراضية في حالة فشل جلب البيانات
const defaultTitle = "متجر فاشون | أحدث صيحات الموضة والأزياء العصرية أونلاين";
const defaultDescription = "تسوقي وتسوّق أحدث تشكيلات الملابس والأزياء العصرية بجودة عالية وأفضل الأسعار. شحن سريع، عروض متجددة، وتجربة تسوق مرنة تناسب إطلالتك اليومية.";

// دالة لجلب البيانات ديناميكياً
async function getMetadata(): Promise<{ title: string; description: string }> {
  try {
    const settings = await getSettings();
    
    // استخدام القيم من الـ API إذا كانت موجودة، وإلا استخدام القيم الافتراضية
    const title = settings.setting.meta?.meta_title || defaultTitle;
    const description = settings.setting.meta?.meta_description || defaultDescription;
    
    return { title, description };
  } catch (error) {
    console.error('Failed to fetch settings for metadata:', error);
    // في حالة الخطأ، استخدام القيم الافتراضية
    return { 
      title: defaultTitle, 
      description: defaultDescription 
    };
  }
}

// استيراد البيانات في metadata
export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getMetadata();
  
  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: 'website',
      locale: 'ar_EG',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={almarai.className}>
        <CartProvider>
          <AuthProvider>
            <FavoritesProvider>
              <Navbar />
              <main>{children}</main>
              <Toaster
                position="top-center"
                reverseOrder={false}
              />
              <Footer />
            </FavoritesProvider>
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}