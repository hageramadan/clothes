import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-auto bg-[#112B40] text-white pt-5">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-[#23A6F0] text-[84px] font-bold text-lg mb-4">
              Logo
            </h3>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">الاقسام</h3>
            <ul className="space-y-2 text-md">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  الجديد
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  الخصومات
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  هواتف
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  لابتوب
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  اكسسوارات
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  سماعات
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">المساعدة</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  الشروط والاحكام
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">تواصل معنا</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <MdPhone className="h-5 w-5 text-primary" />
                <div>
                  <p>اتصل بنا</p>
                  <span className="text-muted-foreground">0987654333</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <MdEmail className="h-5 w-5 text-primary" />
                <div>
                  <p>البريد الإلكتروني</p>
                  <span className="text-muted-foreground">
                    ecommerce@gmail.com
                  </span>
                </div>
              </li>
            </ul>
            <div className="flex gap-4 mt-5">
              <Link href="#">
                <Image
                  src="/images/social/linkedin.png"
                  alt="Facebook "
                  className="w-[24px] h-[24px]"
                  width={240}
                  height={240}
                />
              </Link>
              <Link href="#">
                <Image
                  src="/images/social/insta.png"
                  alt="Facebook"
                  className="w-[24px] h-[24px]"
                  width={240}
                  height={240}
                />
              </Link>
              <Link href="#">
                <Image
                  src="/images/social/face.png"
                  alt="Facebook"
                  className="w-[24px] h-[24px]"
                  width={240}
                  height={240}
                />
              </Link>
              <Link href="#">
                <Image
                  src="/images/social/wats.png"
                  alt="Facebook"
                  className="w-[24px] h-[24px]"
                  width={240}
                  height={240}
                />
              </Link>
            </div>
          </div>
        </div>

        {/* <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} متجري. جميع الحقوق محفوظة</p>
        </div> */}
      </div>
    </footer>
  );
}
