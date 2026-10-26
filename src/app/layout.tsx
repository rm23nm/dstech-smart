import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AIChatWidget from "@/components/AIChatWidget";
import DSTechVisitorTracker from "@/components/DSTechVisitorTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dstechsmart.com"),
  title: {
    default: "PT. DSTech Smart Perkasa — Solusi CCTV AI, Barrier Gate & Smart Home Banten",
    template: "%s | PT. DSTech Smart Perkasa",
  },
  description:
    "Pusat pengadaan & instalasi resmi Kamera CCTV HD/IP AI, Barrier Gate Palang Parkir Otomatis, Smart Door Lock, Mesin Absensi Biometrik, Fiber Optik, & Sistem Akses Kontrol di Cilegon, Serang, Banten, dan Seluruh Indonesia. NIB: 1909220127034.",
  keywords: [
    "Distributor CCTV Serang",
    "Distributor CCTV Cilegon",
    "Distributor CCTV Banten",
    "Supplier CCTV Serang",
    "Supplier CCTV Banten",
    "Grosir CCTV Banten",
    "Distributor Hikvision Banten",
    "Distributor Dahua Serang",
    "Distributor Hilook Banten",
    "Distributor Ezviz Serang",
    "Distributor Imou Banten",
    "Distributor Uniview UNV Banten",
    "Distributor SPC CCTV",
    "Distributor Tiandy Banten",
    "Supplier CCTV Proyek Tender Pabrik",
    "Master Dealer CCTV Banten",
    "Harga Distributor CCTV Resmi",
    "CCTV Serang",
    "Pasang CCTV Serang",
    "CCTV Cilegon",
    "Pasang CCTV Cilegon",
    "Jasa Pasang CCTV Serang Banten",
    "Barrier Gate Serang",
    "Barrier Gate Cilegon",
    "Palang Parkir Otomatis Banten",
    "Palang Parkir Serang",
    "Mesin Absensi Fingerprint Serang",
    "Mesin Absensi Cilegon",
    "Fingerprint Banten",
    "Face Recognition Serang",
    "Jasa Pembuatan Software Banten",
    "Software House Serang",
    "Pembuatan Software Cilegon",
    "Aplikasi Kasir POS Banten",
    "Software ERP Keuangan",
    "Jasa Tarik Kabel Fiber Optik Banten",
    "Fiber Optik Serang Cilegon",
    "Instalasi Jaringan LAN Komputer Kantor",
    "Smart Home Cilegon",
    "Smart Doorlock Banten",
    "Access Control RFID Pabrik",
    "PT DSTech Smart Perkasa",
    "Paket CCTV Murah Bergaransi Serang",
    "IT Solution Banten",
  ],
  authors: [{ name: "PT. DSTech Smart Perkasa", url: "https://dstechsmart.com" }],
  creator: "PT. DSTech Smart Perkasa",
  publisher: "PT. DSTech Smart Perkasa",
  alternates: {
    canonical: "https://dstechsmart.com",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "PT. DSTech Smart Perkasa — Solusi Security System, CCTV & IT Infrastructure",
    description:
      "Partner strategis instalasi CCTV AI, Barrier Gate, Smart Home, & IT Infrastructure di Cilegon Banten sejak 2017. Bergaransi resmi & tim teknisi bersertifikat.",
    url: "https://dstechsmart.com",
    siteName: "PT. DSTech Smart Perkasa",
    images: [
      {
        url: "/hero-industrial.png",
        width: 1200,
        height: 630,
        alt: "PT. DSTech Smart Perkasa Solusi Keamanan & IT Infrastructure",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PT. DSTech Smart Perkasa — Solusi CCTV AI & Barrier Gate Banten",
    description:
      "Instalasi resmi CCTV AI, Barrier Gate, Smart Doorlock, dan IT Infrastructure di Banten & sekitarnya.",
    images: ["/hero-industrial.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google9d98231f7cf8f02a",
  },
};

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LocalBusiness", "SecuritySystemInstallService", "HomeAutomationCompany"],
      "@id": "https://dstechsmart.com/#organization",
      "name": "PT. DSTech Smart Perkasa",
      "alternateName": ["DSTech Smart", "DSTech Perkasa"],
      "url": "https://dstechsmart.com",
      "logo": "https://dstechsmart.com/logo.png",
      "image": "https://dstechsmart.com/hero-industrial.png",
      "description":
        "Perusahaan penyedia dan instalasi resmi Security System, CCTV AI, Barrier Gate Palang Parkir Otomatis, Smart Home, Access Control, Fiber Optik, dan IT Infrastructure di Cilegon Banten.",
      "telephone": "+6282259494242",
      "email": "cs@dstechsmart.com",
      "taxID": "60.648.216.4-102.000",
      "identifier": "1909220127034",
      "priceRange": "Rp 150.000 - Rp 150.000.000",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Perum Bukit Cilegon Asri Blok DB No. 19, Kel. Bagendung",
        "addressLocality": "Cilegon",
        "addressRegion": "Banten",
        "postalCode": "42424",
        "addressCountry": "ID",
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -6.04639,
        "longitude": 106.05042,
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "08:00",
          "closes": "18:00",
        },
      ],
      "areaServed": [
        { "@type": "AdministrativeArea", "name": "Kota Cilegon" },
        { "@type": "AdministrativeArea", "name": "Kota Serang" },
        { "@type": "AdministrativeArea", "name": "Kabupaten Serang" },
        { "@type": "AdministrativeArea", "name": "Banten" },
        { "@type": "AdministrativeArea", "name": "Jabodetabek" },
        { "@type": "Country", "name": "Indonesia" },
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Layanan & Produk Solusi Teknologi DSTech",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Jasa Pasang CCTV AI Serang & Cilegon",
              "description": "Pengadaan dan instalasi paket CCTV ColorVu, Thermal, dan IP Camera untuk pabrik, instansi, dan perumahan.",
            },
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Pemasangan Barrier Gate & Palang Parkir Otomatis Banten",
              "description": "Instalasi barrier gate servo 1.8 detik dengan kartu akses RFID dan sistem manless tiket parkir.",
            },
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Mesin Absensi Fingerprint & Face Recognition Biometrik",
              "description": "Solusi absensi sidik jari dan verifikasi wajah terintegrasi access door lock kunci magnetik.",
            },
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Jasa Pembuatan Software ERP, POS Kasir & Web App Banten",
              "description": "Pembuatan sistem aplikasi kustom, software kasir ritel/resto, dan WhatsApp Gateway SmartPro.",
            },
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "AggregateOffer",
              "name": "Pusat Distributor, Supplier & Grosir CCTV Semua Merek Banten",
              "description": "Distributor resmi CCTV Hikvision, Dahua, HiLook, Ezviz, Imou, Uniview UNV, Tiandy, dan SPC untuk reseller, toko retail, tender proyek pabrik dan instansi.",
            },
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Infrastruktur IT, Tarik Fiber Optik & Splicing Banten",
              "description": "Instalasi kabel backbone fiber optik, uji redaman OTDR, dan perapihan jaringan LAN komputer kantor.",
            },
          },
        ],
      },
      "knowsAbout": [
        "Distributor CCTV Hikvision Banten",
        "Distributor CCTV Dahua Serang",
        "Distributor Resmi HiLook",
        "Distributor Ezviz Wi-Fi Camera",
        "Distributor & Supplier Imou CCTV",
        "Distributor Uniview UNV Banten",
        "Supplier Tiandy Starlight AI",
        "Distributor SPC CCTV Indonesia",
        "Barrier Gate Palang Parkir Otomatis",
        "Mesin Absensi Fingerprint & Face Recognition",
        "Software ERP & POS Kasir",
        "Instalasi Fiber Optik & Jaringan LAN"
      ],
      "sameAs": [
        "https://wa.me/6282259494242",
        "https://www.instagram.com/dstechsmart",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://dstechsmart.com/#website",
      "url": "https://dstechsmart.com",
      "name": "PT. DSTech Smart Perkasa",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://dstechsmart.com/shop?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden selection:bg-red-600 selection:text-white">
        <DSTechVisitorTracker />
        {children}
        <AIChatWidget />
      </body>
    </html>
  );
}
