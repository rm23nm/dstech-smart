import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hubungi Kami & Alamat Kantor Resmi | PT. DSTech Smart Perkasa",
  description:
    "Hubungi customer support resmi PT. DSTech Smart Perkasa melalui WhatsApp 0822-5949-4242 atau kunjungi kantor kami di Perum Bukit Cilegon Asri Blok DB No. 19 Cilegon Banten untuk survey dan konsultasi gratis.",
  keywords: [
    "Kontak CCTV Cilegon",
    "Alamat Kantor DSTech Smart Perkasa",
    "Nomor WhatsApp Teknisi CCTV Cilegon",
    "Customer Service PT DSTech Smart Perkasa",
    "Jasa Pasang CCTV Dekat Sini",
  ],
  alternates: {
    canonical: "https://dstechsmart.com/contact",
  },
  openGraph: {
    title: "Hubungi Kami & Alamat Kantor Resmi | PT. DSTech Smart Perkasa",
    description:
      "Kontak WhatsApp resmi 0822-5949-4242 dan alamat kantor PT. DSTech Smart Perkasa di Cilegon Banten. Konsultasi dan survey gratis.",
    url: "https://dstechsmart.com/contact",
    siteName: "PT. DSTech Smart Perkasa",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "PT. DSTech Smart Perkasa Kontak Resmi",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
