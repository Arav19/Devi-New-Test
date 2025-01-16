import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import 'mapbox-gl/dist/mapbox-gl.css';
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import OrientationLock from "@/components/OrientationLock";
// import MetaPixel from '@/components/MetaPixel';
import { Analytics } from "@vercel/analytics/react"
import GoogleAnalytics from '@/components/GoogleAnalaytics'
import Hotjar from '@/components/Hotjar'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ask Devi - Your Personal Vedic Astrologer",
  description: "Get instant, hyper-personalized Vedic astrology readings powered by AI. Ask about love, career, health & more. Your personal AI astrologer available 24/7. Free trial available.",
  keywords: "vedic astrology, AI astrologer, horoscope, birth chart reading, love astrology, career astrology, indian astrology, jyotish, kundli"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#220038]">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <GoogleAnalytics />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-b from-[#220038] via-[#150030] to-[#220038]`}
      >
        {/* <MetaPixel /> */}
        <AuthProvider>
          <OrientationLock />
          {children}
        </AuthProvider>
        <Hotjar />
        <Analytics />
      </body>
    </html>
  );
}
