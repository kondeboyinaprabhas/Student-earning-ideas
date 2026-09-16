// Earnings Disclaimer Page
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Earnings & Financial Disclaimer | Student Earning Ideas',
  description: 'Detailed earnings disclosure and financial disclaimer for student business blueprints and calculators.'
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Transparency</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Earnings Disclaimer</h1>
            <p className="text-xs text-slate-400 mt-1">Last Updated: March 2026</p>
          </div>

          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
            ⚠️ <strong>Important Notice:</strong> Starting any business, micro-gig, or freelance practice requires effort, skill, and persistent execution. Income ranges displayed (e.g. ₹15,000–₹40,000/month) represent survey findings from active student practitioners and are not guarantees of your personal results.
          </div>

          <section className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">1. Not Financial or Legal Advice</h2>
            <p>
              The materials and interactive calculators provided on this platform do not constitute professional financial, tax, or legal advice. Students should verify local commercial regulations, parental guidance, and tax requirements applicable to their jurisdiction.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">2. Calculator Output Estimates</h2>
            <p>
              The in-article Earnings Calculator and Startup Cost Planner rely on user-selected parameters (such as hours worked, pricing charged, and completed sales). These calculations demonstrate arithmetic potential rather than guaranteed revenue.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">3. Third-Party Platforms</h2>
            <p>
              Where external platforms (such as Blinkstore, Printrove, Gumroad, Canva, Google, YouTube, or Fiverr) are referenced, we do not control their policy changes, account verifications, or fee updates.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
