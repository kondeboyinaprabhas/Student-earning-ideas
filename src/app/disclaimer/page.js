// Earnings & Financial Disclaimer Page
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Earnings & Financial Disclaimer | Student Earning Ideas',
  description:
    'Important disclosure on the nature of earning ideas, income estimates, financial risk, and the informational purpose of this platform.',
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-7">

          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Transparency
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Earnings &amp; Financial Disclaimer
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Last Updated: September 2026
            </p>
          </div>

          {/* Important notice */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-700/40 rounded-2xl p-4 text-xs sm:text-sm text-amber-900 dark:text-amber-300 leading-relaxed font-medium">
            ⚠️ <strong>Important Notice:</strong> Nothing on this website constitutes a
            guarantee, promise, or projection of income, profit, or financial outcome. All
            earning ideas and opportunities are shared for informational and educational purposes
            only. Results will vary significantly between individuals.
          </div>

          {/* 1. Not financial advice */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              1. Not Financial or Legal Advice
            </h2>
            <p>
              The content, blueprints, guides, and resources on Student Earning Ideas do not
              constitute professional financial, investment, tax, legal, or business advice.
              We are an independent editorial platform — not a licensed financial adviser,
              investment firm, or legal service.
            </p>
            <p>
              Before making any financial decision or starting any business activity, you
              should independently research the opportunity, understand any legal or regulatory
              obligations in your jurisdiction, and consult a qualified professional where
              appropriate.
            </p>
          </section>

          {/* 2. Earning estimates */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              2. Earning Estimates Are Illustrative Only
            </h2>
            <p>
              Where earning ranges or figures appear in idea blueprints (for example, &quot;₹5,000–
              ₹20,000/month&quot;), these are illustrative estimates based on publicly available
              information, third-party surveys, or reported student experiences. They are
              not promises, projections, or minimum guarantees.
            </p>
            <p>
              Actual earnings, if any, will depend on factors including — but not limited to —
              your skills, effort, time invested, quality of execution, local market conditions,
              competition, economic conditions, and the specific platform or method used.
            </p>
          </section>

          {/* 3. Individual results vary */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              3. Individual Results Will Vary
            </h2>
            <p>
              Student Earning Ideas does not track, audit, or verify the personal earnings of
              individuals who use content from this platform. We make no claim that any typical
              or average user achieves a particular outcome. The path from information to
              income requires real-world effort, skills, persistence, and favourable conditions
              that are entirely within your control and beyond ours.
            </p>
          </section>

          {/* 4. Risk */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              4. Risk of Starting a Business or Earning Venture
            </h2>
            <p>
              Starting any business, side hustle, or freelance activity carries inherent risk.
              You may invest time, money, or other resources without achieving the financial
              outcome you expected. We strongly recommend that you start small, validate your
              approach, and avoid spending money you cannot afford to lose on any unproven
              earning method.
            </p>
          </section>

          {/* 5. Calculator outputs */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              5. Calculator and Planner Outputs Are Estimates
            </h2>
            <p>
              Where earnings calculators or startup cost planners are included within idea
              cards, their outputs are mathematical estimates based on user-selected input
              parameters (such as hours worked, pricing, or completion rates). These
              calculations demonstrate arithmetic potential only and should not be treated
              as financial projections or business plans.
            </p>
          </section>

          {/* 6. Third-party platforms */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              6. Third-Party Platforms
            </h2>
            <p>
              Where external platforms (such as Fiverr, Gumroad, Canva, YouTube, Groww,
              Printrove, Blinkstore, or others) are referenced in idea blueprints, we do not
              represent, endorse, or have any affiliation with those platforms. We are not
              responsible for their policies, fees, account verification requirements,
              availability, or any changes they may make.
            </p>
            <p>
              Any transaction, registration, or engagement with a third-party platform is
              undertaken entirely at your own risk.
            </p>
          </section>

          {/* 7. No affiliation */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              7. No Affiliation with Educational Institutions
            </h2>
            <p>
              Student Earning Ideas is not affiliated with, endorsed by, or connected to
              any university, college, government body, or educational institution. The use
              of the word &quot;student&quot; in our name reflects our target audience and content focus,
              not any institutional association.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              8. Questions
            </h2>
            <p>
              If you have any questions about this disclaimer or how we present earning
              information, please reach out via our{' '}
              <Link href="/contact" className="text-teal-700 dark:text-teal-400 font-bold underline">
                Contact page
              </Link>.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
