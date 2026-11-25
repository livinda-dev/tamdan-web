import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/api/site-settings",
        ],
        disallow: [
          "/api/admin/",
          "/api/cron/",
          "/api/bots/",
          "/api/auth/",
          "/api/profile/",
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

