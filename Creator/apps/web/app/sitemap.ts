import { MetadataRoute } from "next";

const BASE_URL = "https://getcocoba.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/trust-guide`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/terms/creators`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/terms/fans`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/legal/commercial-transaction/creators`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/legal/commercial-transaction/fans`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
