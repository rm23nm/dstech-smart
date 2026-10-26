import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://dstechsmart.com";
  const now = new Date();

  // Rute halaman publik utama
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/affiliate`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/affiliate/learn-more`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${baseUrl}/affiliate/register`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
  ];

  // Rute produk dinamis
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const productsPath = path.join(process.cwd(), "src/data/dstech_products.json");
    if (fs.existsSync(productsPath)) {
      const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
      if (Array.isArray(products)) {
        productRoutes = products.map((prod) => ({
          url: `${baseUrl}/shop?product=${encodeURIComponent(prod.id || prod.name)}`,
          lastModified: prod.updatedAt ? new Date(prod.updatedAt) : now,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));
      }
    }
  } catch (e) {
    console.error("Error generating product sitemap:", e);
  }

  return [...staticRoutes, ...productRoutes];
}
