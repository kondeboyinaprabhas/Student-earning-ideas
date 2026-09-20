import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0F172A",
};

export const metadata = {
  title: "Student Earning Ideas — 100+ Ways to Earn",
  description: "Discover verified student earning blueprints, side hustles, and digital micro-businesses with zero investment. Complete with calculators, startup planners, and action steps.",
  keywords: ["student earning ideas", "ways to earn money as a student", "college side hustles", "online student jobs", "zero investment business for students"],
  authors: [{ name: "Student Earning Ideas Editorial Desk" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EarnIdeas",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "Student Earning Ideas — 100+ Ways to Earn",
    description: "Step-by-step student business blueprints, micro-gigs, and tools to earn while in college.",
    url: "https://student-earning-ideas.vercel.app",
    siteName: "Student Earning Ideas",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Earning Ideas — 100+ Ways to Earn",
    description: "Actionable blueprints, calculators, and checklists for student financial independence.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning={true}
      lang="en"
      data-scroll-behavior="smooth"
      className={`${jakarta.variable} ${inter.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {/* LCP image preload — browser discovers this immediately on parse, before React hydrates.
            The hero IdeaCard uses unoptimized={isLcp} so the img src is this exact URL.
            This preload matches the rendered element byte-for-byte. */}
        <link
          rel="preload"
          as="image"
          href="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=720&q=75"
          fetchPriority="high"
        />
        {/* Instant dark mode initialization to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('sei_theme_preference_v1');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-100 text-slate-900 selection:bg-teal-500 selection:text-white">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
