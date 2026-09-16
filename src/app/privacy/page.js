// Privacy Policy Page
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy | Student Earning Ideas',
  description: 'Learn how Student Earning Ideas handles anonymous analytics, cookies, and user privacy in full compliance with global standards.'
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Compliance</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Privacy Policy</h1>
            <p className="text-xs text-slate-400 mt-1">Last Updated: March 2026</p>
          </div>

          <section className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
            <p>
              Student Earning Ideas operates under a privacy-first approach. We do not require account creation for browsing public earning blueprints. We collect anonymous telemetry such as scroll depth, search queries, and idea engagement solely to identify which guides are most helpful to students.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">2. Cookies & Local Storage</h2>
            <p>
              We utilize browser localStorage to remember your saved ideas, liked posts, and completed business checklist steps locally on your device. We do not sell or trade this data to third parties.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">3. Google AdSense & Third-Party Advertising</h2>
            <p>
              Google, as a third-party vendor, uses cookies to serve non-intrusive ads on our site. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet. Users may opt out of personalized advertising by visiting Google Ads Settings.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">4. Contact Information</h2>
            <p>
              For privacy queries or questions about our editorial standards, please reach out via our{' '}
              <Link href="/contact" className="text-teal-700 font-bold underline">
                Contact Page
              </Link>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
