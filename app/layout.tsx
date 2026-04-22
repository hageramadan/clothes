import type { Metadata } from "next";
import { Almarai } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { SubNavbar } from "@/components/layout/SubNavbar";

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
});

export const metadata: Metadata = {
  title: "متجري - منتجات مميزة",
  description: "أفضل المنتجات في مكان واحد",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={almarai.className}>
        <CartProvider>
          <FavoritesProvider>
            <SubNavbar/>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            {/* <Footer /> */}
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}