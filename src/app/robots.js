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
    sitemap: 'https://student-earning-ideas.vercel.app/sitemap.xml'
  };
}
