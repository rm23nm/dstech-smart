import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PT. DSTech Smart Perkasa — Solusi Security System & IT Infrastructure",
  description: "Partner strategis digitalisasi industri & hunian. Menghadirkan solusi CCTV, Smart Home, Access Control, Fiber Optik, Videotron, dan Software Terpadu sejak 2017.",
  keywords: "DSTech Smart Perkasa, CCTV Cilegon, Smart Home Banten, IT Infrastructure, Fiber Optik, Access Control, POS Kasir",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden selection:bg-red-600 selection:text-white">{children}</body>
    </html>
  );
}
