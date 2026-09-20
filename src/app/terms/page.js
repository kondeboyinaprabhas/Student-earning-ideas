// Terms of Service Page
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service | Student Earning Ideas',
  description:
    'Terms and conditions governing your use of Student Earning Ideas — an educational platform for student earning blueprints and opportunities.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-7">

          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
              Legal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Terms of Service
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Effective Date: September 2026
            </p>
          </div>

          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              By accessing or using Student Earning Ideas at{' '}
              <strong>student-earning-ideas.vercel.app</strong>, you agree to these Terms of
              Service. If you do not agree, please do not use this website.
            </p>
          </section>

          {/* 1. Informational Purpose */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              1. Educational &amp; Informational Purpose
            </h2>
            <p>
              All content, blueprints, guides, and resources published on Student Earning Ideas
              are provided strictly for educational and informational purposes. We do not
              guarantee any specific income, profit, employment, or financial outcome. Nothing
              on this platform constitutes professional financial, investment, legal, or tax
              advice.
            </p>
            <p>
              Before acting on any information published here, you should conduct your own
              independent research and, where appropriate, consult a qualified professional.
            </p>
          </section>

          {/* 2. Acceptable Use */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              2. Acceptable Use
            </h2>
            <p>You may use this website for personal, educational, and non-commercial purposes. You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Copy, reproduce, or republish content from this site in bulk without attribution.</li>
              <li>Use automated tools, scrapers, or bots to extract content from this website.</li>
              <li>Attempt to access any admin, preview, or restricted areas of the site.</li>
              <li>Use the Contact form to send spam, abusive messages, or fraudulent submissions.</li>
              <li>Interfere with the proper functioning of this website.</li>
            </ul>
          </section>

          {/* 3. Intellectual Property */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              3. Intellectual Property
            </h2>
            <p>
              The editorial content, blueprints, curation, design, and structure of this
              website are protected by copyright law and are the property of Student Earning
              Ideas. You may reference individual ideas for personal use or share links to
              pages on this site, but bulk reproduction, resale, or republication of content
              without written permission is prohibited.
            </p>
            <p>
              Third-party brand names, trademarks, and platform names (such as Fiverr,
              Canva, YouTube, or Groww) mentioned on this site belong to their respective
              owners. Their mention does not imply endorsement of this platform or any
              affiliation with us.
            </p>
          </section>

          {/* 4. Third-Party Links */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              4. Third-Party Links &amp; Services
            </h2>
            <p>
              Idea blueprints on this platform may contain links to external websites and
              platforms. We do not control those sites and are not responsible for their
              content, privacy practices, fees, or availability. Visiting or transacting
              with a third-party platform is entirely at your own discretion and risk.
            </p>
          </section>

          {/* 5. Advertising */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              5. Advertising
            </h2>
            <p>
              This website may display advertisements served by Google AdSense and other
              advertising networks. These advertisements are clearly labelled. We do not
              control the content of third-party advertisements and are not responsible
              for the products or services they promote. For information on how advertising
              cookies work, please review our{' '}
              <Link href="/privacy" className="text-teal-700 dark:text-teal-400 underline">
                Privacy Policy
              </Link>.
            </p>
          </section>

          {/* 6. No Guarantee of Earnings */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              6. No Guarantee of Earnings or Results
            </h2>
            <p>
              Ideas and opportunities published on this platform do not represent guarantees
              of income, success, or financial outcome of any kind. Any earning ranges or
              estimates mentioned are illustrative of possibilities reported by others and
              do not constitute a promise or projection for any individual. Actual results
              will vary significantly based on individual effort, skills, market conditions,
              location, execution, and many other factors.
            </p>
          </section>

          {/* 7. Limitation of Liability */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              7. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, Student Earning Ideas and
              its operators shall not be liable for any direct, indirect, incidental, special,
              or consequential damages arising from your use of, or reliance on, any content
              on this platform. This includes, without limitation, any business decisions,
              financial losses, or missed opportunities based on information published here.
            </p>
          </section>

          {/* 8. Disclaimer */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              8. Disclaimer of Warranties
            </h2>
            <p>
              This website and its content are provided &quot;as is&quot; without any warranty of
              any kind, express or implied, including but not limited to warranties of
              accuracy, completeness, fitness for a particular purpose, or non-infringement.
              We make no representations that the content is always current, complete, or
              error-free.
            </p>
          </section>

          {/* 9. Changes to Terms */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              9. Changes to These Terms
            </h2>
            <p>
              We reserve the right to update or modify these Terms at any time. When we
              do, the effective date at the top of this page will be updated. Continued use
              of this website after any changes constitutes your acceptance of the revised
              terms.
            </p>
          </section>

          {/* 10. Contact */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              10. Contact
            </h2>
            <p>
              If you have any questions about these Terms, please reach out via our{' '}
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
