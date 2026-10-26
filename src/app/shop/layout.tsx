import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog Produk & Paket CCTV, Barrier Gate, Smart Home",
  description:
    "Katalog resmi produk & paket instalasi CCTV AI Full HD/ColorVu, Palang Parkir Barrier Gate Otomatis, Smart Door Lock, Mesin Absensi Biometrik Wajah, dan Aksesoris Jaringan bergaransi resmi.",
  keywords: [
    "Katalog CCTV Cilegon",
    "Paket Pasang CCTV Banten",
    "Harga Palang Parkir Otomatis",
    "Jual Barrier Gate Cilegon",
    "Harga Smart Doorlock",
    "Toko CCTV Terlengkap Banten",
    "Paket CCTV 4 Kamera",
    "Paket CCTV 8 Kamera",
    "Kamera CCTV Outdoor Tahan Air",
  ],
  alternates: {
    canonical: "https://dstechsmart.com/shop",
  },
  openGraph: {
    title: "Katalog Produk & Paket CCTV, Barrier Gate, Smart Home | PT. DSTech Smart Perkasa",
    description:
      "Temukan berbagai paket pengadaan & pemasangan CCTV, Barrier Gate, dan Smart Home dengan garansi resmi dan teknisi profesional.",
    url: "https://dstechsmart.com/shop",
    siteName: "PT. DSTech Smart Perkasa",
    images: [
      {
        url: "/portfolio-residential.png",
        width: 1200,
        height: 630,
        alt: "Katalog Produk CCTV & Smart Security DSTech",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
