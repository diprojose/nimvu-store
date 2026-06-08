import Link from "next/link";
import type { BackendBanner } from "@/lib/api";

interface UniverseBannerProps {
  banner: BackendBanner;
  /** Optional fallback text color taken from the universe accent when banner doesn't set one. */
  fallbackTextColor?: string;
}

export default function UniverseBanner({ banner, fallbackTextColor }: UniverseBannerProps) {
  const generalText = banner.textColor || fallbackTextColor || "#FFFFFF";
  const badgeColor = banner.badgeColor || generalText;
  const titleColor = banner.titleColor || generalText;
  const subtitleColor = banner.subtitleColor || generalText;
  const accentLineColor = banner.accentLineColor;
  const ctaBgColor = banner.ctaBgColor || "#FFFFFF";
  const ctaTextColor = banner.ctaTextColor || "#000000";

  const hasMobile = !!banner.mobileImage;

  return (
    <section className="w-full pb-[60px]">
      <div className="relative w-full rounded-md overflow-hidden">
        {hasMobile ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.mobileImage!}
              alt={banner.title}
              className="block md:hidden w-full h-auto"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.image}
              alt={banner.title}
              className="hidden md:block w-full h-auto"
            />
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={banner.image} alt={banner.title} className="w-full h-auto" />
        )}

        <div className="absolute inset-0 flex flex-col items-start justify-center px-6 py-10 md:px-16 md:py-12">
          {banner.badge && (
            <span
              className="font-inter text-[10px] md:text-xs font-semibold tracking-[0.25em] uppercase mb-3"
              style={{ color: badgeColor }}
            >
              {banner.badge}
            </span>
          )}

          <h2
            className="font-source-serif font-semibold text-[2rem] md:text-5xl leading-[1.05] tracking-tight max-w-[85%] md:max-w-xl"
            style={{ color: titleColor }}
          >
            {banner.title}
          </h2>

          {accentLineColor && (
            <span
              className="block my-5 md:my-6"
              style={{ width: "60px", height: "2px", backgroundColor: accentLineColor }}
              aria-hidden="true"
            />
          )}

          {banner.subtitle && (
            <p
              className={`font-inter text-sm md:text-base ${
                accentLineColor ? "mb-6" : "mt-4 mb-6"
              } max-w-[80%] md:max-w-md`}
              style={{ color: subtitleColor }}
            >
              {banner.subtitle}
            </p>
          )}

          {banner.ctaText && banner.ctaHref && (
            <Link
              href={banner.ctaHref}
              className="font-inter font-medium py-3 px-6 text-sm tracking-wide transition-opacity hover:opacity-90 w-fit self-start inline-block mt-2"
              style={{ backgroundColor: ctaBgColor, color: ctaTextColor }}
            >
              {banner.ctaText} →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
