import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/admin/",
          "/creators/dashboard/",
          "/creators/settings/",
          "/creators/earnings/",
          "/creators/fans/",
          "/creators/preview/",
          "/creators/verify-identity/",
          "/creators/password-reset/",
          "/*/account/",
          "/*/login",
          "/*/signup",
          "/api/",
          "/test/",
          "/forbidden",
          "/account-suspended",
        ],
      },
    ],
    sitemap: "https://getcocoba.com/sitemap.xml",
  };
}
