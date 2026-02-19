import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '../components/custom/Header';
import Footer from '../components/custom/Footer';
import { Toaster } from "@/components/ui/sonner"
import FloatingWhatsApp from '@/components/custom/FloatingWhatsApp';
import MetaPixel from '@/components/custom/MetaPixel';
import { GoogleTagManager } from '@next/third-parties/google'


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nimvu | Diseño que acompaña tus momentos",
  description: "Diseño que acompaña tus momentos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-y-scroll">
      <GoogleTagManager gtmId="GTM-P7JXWM9B" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P7JXWM9B"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Header />
        {children}
        <Footer />
        <Toaster />
        <FloatingWhatsApp />
        <MetaPixel />
      </body>
    </html>
  );
}
