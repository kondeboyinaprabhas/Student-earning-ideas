// src/app/robots.js
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/preview/"],
      },
    ],
    sitemap: "https://studentearningideas.in/sitemap.xml",
  };
}