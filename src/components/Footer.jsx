// Footer.jsx - Compliance, Legal & Editorial Footer (Zero Public Admin Link)
import Link from 'next/link';
import StudentLogo from './StudentLogo';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 py-10 px-4 border-t border-slate-800 text-xs mt-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <StudentLogo size="sm" showTagline={true} className="text-white" />
          <p className="text-slate-400 text-center sm:text-right max-w-sm text-[11px] leading-relaxed">
            Empowering students with verified blueprints, micro-gigs, and digital business tools to achieve financial independence during college.
          </p>
        </div>

        {/* Public Compliance Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-300 font-medium text-xs">
          <Link href="/about" className="hover:text-teal-400 transition-colors">
            About
          </Link>
          <Link href="/privacy" className="hover:text-teal-400 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-teal-400 transition-colors">
            Terms of Service
          </Link>
          <Link href="/disclaimer" className="hover:text-teal-400 transition-colors">
            Earnings Disclaimer
          </Link>
          <Link href="/contact" className="hover:text-teal-400 transition-colors">
            Contact &amp; Support
          </Link>
        </div>

        <div className="text-center text-[10px] text-slate-500 space-y-1">
          <p>© {new Date().getFullYear()} Student Earning Ideas. All rights reserved.</p>
          <p>Not affiliated with university bodies or external brand trademarks. All earning figures are realistic estimates based on student reporting.</p>
        </div>
      </div>
    </footer>
  );
}
