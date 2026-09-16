// Terms of Service Page
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service | Student Earning Ideas',
  description: 'Terms and conditions governing the use of Student Earning Ideas educational blueprints and calculators.'
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Legal</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Terms of Service</h1>
            <p className="text-xs text-slate-400 mt-1">Effective Date: March 2026</p>
          </div>

          <section className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">1. Educational & Informational Purpose</h2>
            <p>
              All materials, business roadmaps, financial calculators, and checklists published on Student Earning Ideas are provided strictly for educational and informational purposes. We do not guarantee specific income outcomes.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">2. Intellectual Property</h2>
            <p>
              Content, graphic mockups, calculators, and curation on this website are protected under copyright law. Users are permitted to use blueprints for personal student enterprise creation, but automated scraping or bulk republication without attribution is prohibited.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">3. Limitation of Liability</h2>
            <p>
              Under no circumstances shall Student Earning Ideas or its contributors be liable for any indirect, incidental, or consequential losses resulting from decisions made based on published guides. Students are advised to conduct their own due diligence before initiating commercial ventures.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
