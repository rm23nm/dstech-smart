import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://dstechsmart.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/shop",
          "/contact",
          "/affiliate",
          "/affiliate/learn-more",
          "/affiliate/register",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/superadmin",
          "/superadmin/",
          "/employee",
          "/employee/",
          "/api/",
          "/login",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/shop", "/contact", "/affiliate"],
        disallow: ["/admin/", "/superadmin/", "/employee/", "/api/"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/uploads/", "/*.png$", "/*.jpg$", "/*.jpeg$", "/*.webp$", "/*.svg$"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
