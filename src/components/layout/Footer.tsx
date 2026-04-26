import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { PiLineVerticalLight, PiLineVerticalThin } from "react-icons/pi";

export function Footer() {
  return (
    <footer className="border-t mt-auto bg-[#141718] text-white pt-6 md:pt-10">
      <div className="container mx-auto px-4 py-4 md:py-8 md:py-12">
        {/* القسم العلوي - الشبكة الرئيسية */}
        <div className="flex flex-wrap md:flex-row flex-col items-center justify-center md:justify-between gap-8 mb-8">
          
          {/* القسم 1: الشعار والوصف */}
          <div className="space-y-4">
            <div className="flex  items-center gap-3">
              <h1 className="text-[#FFFFFF] text-xl md:text-2xl font-bold">
                LoGo
              </h1>
              <PiLineVerticalThin className="w-6 h-8 text-[#E8ECEF] text-[14px]" />
              <p className="text-white/70 text-sm leading-relaxed">
                متجرك المثالي هنا كل ما تريد
              </p>
            </div>
          </div>
          <div className="flex md:flex-row flex-col justify-center gap-7 items-center text-[14px]">
            <Link href="/" aria-label="home" className="font-bold">الرئيسية</Link>
            <Link href="/" aria-label="categories">الفئات</Link>
            <Link href="/" aria-label="contact">تواصل معنا</Link>
            <Link href="/" aria-label="contact">تواصل معنا</Link>
          </div>

        </div>

        {/* القسم السفلي - الحقوق ووسائل التواصل */}
        <div className="border-t border-white/20 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
         <div className="flex flex-wrap justify-center gap-7">
             {/* حقوق الملكية */}
            <p className="text-white/60 order-2 md:order-1 text-sm text-[16px] font-bold text-center md:text-right">
              © جميع الحقوق محفوظة | ********** 2025
            </p>

            {/* روابط الشروط والخصوصية */}
            <div className="flex flex-col order-1 md:order-2 md:flex-row gap-6">
              <Link 
                href="/" 
                className="text-white text-[14px] hover:text-[#FF7700] transition-colors duration-300 text-sm"
              >
                الشروط والأحكام
              </Link>
              <Link 
                href="/" 
                className="text-white text-[14px] hover:text-[#FF7700] transition-colors duration-300 text-sm"
              >
                سياسة الخصوصية
              </Link>
            </div>
         </div>

            {/* أيقونات وسائل التواصل الاجتماعي */}
            <div className="flex gap-4">
              <Link 
                href="#" 
                className="p-2 rounded-full "
                aria-label="Instagram"
              >
                <Image
                  src="/images/social/insta.png"
                  alt="Instagram"
                  className="w-6 h-6"
                  width={26}
                  height={26}
                />
              </Link>
              <Link 
                href="#" 
                className="p-2 rounded-full "
                aria-label="Facebook"
              >
                <Image
                  src="/images/social/face.png"
                  alt="Facebook"
                  className="w-6 h-6"
                  width={26}
                  height={26}
                />
              </Link>
              <Link 
                href="#" 
                className="p-2 rounded-full "
                aria-label="WhatsApp"
              >
                <Image
                  src="/images/social/wats.png"
                  alt="WhatsApp"
                  className="w-6 h-6"
                  width={26}
                  height={26}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}