import type { Metadata } from "next";
import ReactDOM from "react-dom";
import { Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";
import Header from '../components/custom/Header';
import Footer from '../components/custom/Footer';
import { Toaster } from "@/components/ui/sonner"
import FloatingWhatsApp from '@/components/custom/FloatingWhatsApp';
import { GoogleTagManager } from '@next/third-parties/google'
import {
  universes as universesApi,
  categories as categoriesApi,
  BackendUniverse,
  BackendCategory,
} from '@/lib/api';
import { UniverseProvider } from '@/lib/universe-context';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, absoluteUrl } from '@/lib/seo';


const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Nimvu | Diseño que acompaña tus momentos",
    // Las páginas hijas solo declaran su nombre; la marca se añade aquí.
    template: "%s | Nimvu",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'es_CO',
    url: '/',
    title: "Nimvu | Diseño que acompaña tus momentos",
    description: SITE_DESCRIPTION,
    images: ['/nimvu-logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Nimvu | Diseño que acompaña tus momentos",
    description: SITE_DESCRIPTION,
    images: ['/nimvu-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  other: {
    "facebook-domain-verification": "p9ko6vka6h2j2opknphnibq6ad2jym",
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl('/nimvu-logo.png'),
  description: SITE_DESCRIPTION,
  telephone: '+573123478307',
  areaServed: 'CO',
  sameAs: [
    'https://www.instagram.com/nimvustore/',
    'https://www.tiktok.com/@nimvustore',
    'https://www.facebook.com/profile.php?id=61584617187657',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+573123478307',
    contactType: 'customer service',
    availableLanguage: ['es'],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Establece conexión anticipada con los orígenes externos críticos para
  // ahorrar el tiempo de DNS/TLS en la primera petición (mejora LCP/FCP).
  ReactDOM.preconnect("https://rnhwvaurswbnnxyedzsx.storage.supabase.co");
  ReactDOM.preconnect("https://connect.facebook.net");

  let initialUniverses: BackendUniverse[] = [];
  let initialCategories: BackendCategory[] = [];
  try {
    [initialUniverses, initialCategories] = await Promise.all([
      universesApi.list({ activeOnly: false }),
      categoriesApi.list(),
    ]);
  } catch (err) {
    console.error('Failed to fetch universes/categories for layout', err);
  }

  return (
    <html lang="es-CO" className="overflow-y-scroll">
      <GoogleTagManager gtmId="GTM-P7JXWM9B" />
      <script
        type="application/ld+json"
        // Identidad de la marca para el Knowledge Panel y los resultados enriquecidos.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <body
        className={`${sourceSerif.variable} ${inter.variable} antialiased`}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P7JXWM9B"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <UniverseProvider initialUniverses={initialUniverses} initialCategories={initialCategories}>
          <Header />
          {children}
          <Footer />
        </UniverseProvider>
        <Toaster />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
