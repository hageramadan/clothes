// components/contact/SocialLinks.tsx
import Link from "next/link";
import { BsInstagram } from "react-icons/bs";
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebookF } from "react-icons/fa";
import { IoLogoTiktok } from "react-icons/io5";
import { FaSnapchatGhost } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import { useSettings } from "@/hooks/useSettings";

interface SocialLink {
  icon: React.ElementType;
  href: string;
  label: string;
  enabled: boolean;
}

export default function SocialLinks() {
  const { settings, loading } = useSettings();

  // بناء الروابط بناءً على البيانات من الـ API
  const getSocialLinks = (): SocialLink[] => {
    if (!settings) return [];

    return [
      {
        icon: FaXTwitter,
        href: settings.twitter || "",
        label: "Twitter",
        enabled: !!settings.twitter,
      },
      {
        icon: FaFacebookF,
        href: settings.facebook || "",
        label: "Facebook",
        enabled: !!settings.facebook,
      },
      {
        icon: BsInstagram,
        href: settings.instagram || "",
        label: "Instagram",
        enabled: !!settings.instagram,
      },
      {
        icon: FaSnapchatGhost,
        href: settings.snapchat || "",
        label: "Snapchat",
        enabled: !!settings.snapchat,
      },
      {
        icon: FaLinkedinIn,
        href: settings.linkedin || "",
        label: "LinkedIn",
        enabled: !!settings.linkedin,
      },
      // يمكن إضافة TikTok إذا كان موجوداً في الـ API
      // {
      //   icon: IoLogoTiktok,
      //   href: settings.tiktok || "",
      //   label: "TikTok",
      //   enabled: !!settings.tiktok,
      // },
    ];
  };

  const socialLinks = getSocialLinks();
  const hasLinks = socialLinks.some(link => link.enabled);

  if (loading) {
    return (
      <div>
        <h3 className="text-lg font-bold text-white my-4 text-center md:text-start">
          تواصل معنا
        </h3>
        <div className="flex gap-3 md:gap-6 mt-6 justify-center md:justify-start">
          <div className="w-5 h-5 bg-gray-600 rounded-full animate-pulse"></div>
          <div className="w-5 h-5 bg-gray-600 rounded-full animate-pulse"></div>
          <div className="w-5 h-5 bg-gray-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!hasLinks) {
    return null; // أو يمكن عرض رسالة "لا توجد روابط تواصل اجتماعي"
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-white my-4 text-center md:text-start">
        تواصل معنا
      </h3>
      <div className="flex gap-3 md:gap-6 mt-6 justify-center md:justify-start">
        {socialLinks.map(
          (social, index) =>
            social.enabled && (
              <Link
                key={index}
                href={social.href}
                aria-label={social.label}
                className="hover:text-[#EC221F] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <social.icon className="w-5 h-5 text-white" />
              </Link>
            )
        )}
      </div>
    </div>
  );
}