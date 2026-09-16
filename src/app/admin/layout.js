// src/app/admin/layout.js - Admin Studio Layout (Hidden from Search Engines)

export const metadata = {
  title: 'Admin Studio — Student Earning Ideas',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({ children }) {
  return children;
}
