// src/app/robots.js - Dynamic robots.txt with Admin Protection
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/preview/']
      }
    ],
    sitemap: 'https://studentearningideas.com/sitemap.xml'
  };
}
