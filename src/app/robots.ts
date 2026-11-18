import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/profile/",
          "/auth/callback",
          "/auth/reset-password",
        ],
      },
    ],
    sitemap: "https://tamdan.online/sitemap.xml",
    host: "https://tamdan.online",
  };
}
