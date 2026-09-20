// Privacy Policy Page — Accurate to current implementation
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy | Student Earning Ideas',
  description:
    'How Student Earning Ideas collects, stores, and uses information — including local storage, anonymous analytics, advertising cookies, and your rights.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-7">

          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
              Compliance
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Last Updated: September 2026
            </p>
          </div>

          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              This Privacy Policy explains how Student Earning Ideas (&quot;we&quot;, &quot;our&quot;, or
              &quot;the platform&quot;) handles information when you visit{' '}
              <strong>student-earning-ideas.vercel.app</strong>. Please read this page carefully.
              By using this website, you acknowledge the practices described here.
            </p>
          </section>

          {/* 1. No account or registration */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              1. No Account or Registration Required
            </h2>
            <p>
              Browsing Student Earning Ideas does not require you to create an account, sign in,
              or provide any personal information. Public ideas, blueprints, and resources are
              accessible to all visitors without registration.
            </p>
          </section>

          {/* 2. Local Storage */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              2. Local Storage — Stored on Your Device
            </h2>
            <p>
              To improve your browsing experience, we store the following data locally in
              your browser&apos;s localStorage. This data never leaves your device and is not
              transmitted to our servers:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Saved ideas</strong> — the IDs of ideas you have bookmarked.</li>
              <li><strong>Viewed ideas</strong> — IDs of ideas you have already seen, so fresh ones appear first.</li>
              <li><strong>Liked ideas</strong> — your personal likes on idea cards.</li>
              <li><strong>Checklist progress</strong> — your completion status of action-step checklists within idea cards.</li>
              <li><strong>Cookie consent</strong> — whether you have accepted our cookie notice.</li>
              <li><strong>Theme preference</strong> — your light or dark mode choice.</li>
              <li><strong>Anonymous analytics</strong> — a private log of interactions (see section 3) stored only in your browser.</li>
              <li><strong>Scroll guidance</strong> — whether you have dismissed the scroll hint.</li>
            </ul>
            <p>
              You can clear all locally stored data at any time by clearing your browser&apos;s
              site data or localStorage for this site. We do not sell, share, or process this
              locally stored data.
            </p>
          </section>

          {/* 3. Anonymous Analytics */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              3. Anonymous On-Device Analytics
            </h2>
            <p>
              We use a lightweight, privacy-first analytics system that records interaction
              events (such as idea views, searches, and scroll depth) entirely within your
              own browser&apos;s localStorage. This data is not linked to any personal identifier,
              IP address, or account. It is not sent to any external analytics service or
              third-party server by this mechanism.
            </p>
            <p>
              Aggregated, anonymised summaries of interactions may be reviewed by our editorial
              team through an admin panel that accesses the same local data directly.
            </p>
          </section>

          {/* 4. Firestore / Cloud Storage */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              4. Cloud Data — Firestore (Google Firebase)
            </h2>
            <p>
              We use Google Firebase Firestore, a cloud database service, to store the
              following non-personal data:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Published idea blueprints</strong> — the content displayed on this site.</li>
              <li><strong>Like counts</strong> — aggregate counts of likes per idea (not linked to individual users).</li>
              <li><strong>Recommended resources</strong> — curated resource cards shown in the feed.</li>
              <li><strong>Contact form submissions</strong> — if you submit a message via our Contact page, the content of your message (name, email, and message text) is stored in Firestore so our editorial team can respond.</li>
            </ul>
            <p>
              Contact form data is used solely to respond to your inquiry and is not used for
              marketing. Google Firebase processes this data under Google&apos;s own privacy
              standards. For more information, see{' '}
              <a
                href="https://firebase.google.com/support/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 dark:text-teal-400 underline"
              >
                Firebase Privacy and Security
              </a>.
            </p>
          </section>

          {/* 5. Google AdSense */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              5. Google AdSense &amp; Advertising Cookies
            </h2>
            <p>
              We participate in the Google AdSense program to display advertisements on this
              website. Google, as a third-party advertising vendor, uses cookies to serve ads
              based on your prior visits to this website and other websites on the internet.
            </p>
            <p>
              Google&apos;s use of advertising cookies enables it and its partners to serve ads to
              you based on your interests. You may opt out of personalised advertising by
              visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 dark:text-teal-400 underline"
              >
                Google Ads Settings
              </a>{' '}
              or by visiting{' '}
              <a
                href="https://www.aboutads.info"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 dark:text-teal-400 underline"
              >
                aboutads.info
              </a>. You may also opt out of a third-party vendor&apos;s use of cookies for
              personalised advertising by visiting{' '}
              <a
                href="https://www.networkadvertising.org/managing/opt_out.asp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 dark:text-teal-400 underline"
              >
                networkadvertising.org
              </a>.
            </p>
            <p>
              For more information on how Google uses data when you use Google partner sites
              or apps, see{' '}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 dark:text-teal-400 underline"
              >
                How Google uses information from sites or apps that use Google services
              </a>.
            </p>
          </section>

          {/* 6. Web Push Notifications */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              6. Web Push Notifications
            </h2>
            <p>
              We offer optional web push notifications. If you choose to subscribe, your
              browser generates a push subscription token which is stored in Firestore so
              we can send you notifications about new ideas. You can unsubscribe at any
              time through your browser settings. We do not share push subscription tokens
              with third parties.
            </p>
          </section>

          {/* 7. Third-party links */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              7. Third-Party Links
            </h2>
            <p>
              Idea blueprints on this platform may link to external platforms such as Fiverr,
              Gumroad, YouTube, Canva, Groww, and others. We are not responsible for the
              privacy practices of those external sites. We encourage you to review their
              privacy policies before engaging with them.
            </p>
          </section>

          {/* 8. Children */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              8. Children&apos;s Privacy
            </h2>
            <p>
              This website is intended for use by students who are generally 16 years of age
              or older. We do not knowingly collect personal information from children under
              13. If you believe a child has submitted personal information to us, please
              contact us so we can remove it.
            </p>
          </section>

          {/* 9. Your rights */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              9. Your Rights &amp; Data Deletion
            </h2>
            <p>
              Since most data is stored locally on your device, you have direct control over
              it. You can delete localStorage data by clearing your browser&apos;s site data at
              any time.
            </p>
            <p>
              If you have submitted a contact form and would like your submission deleted from
              our Firestore database, or if you have any other privacy-related request, please
              contact us via our{' '}
              <Link href="/contact" className="text-teal-700 dark:text-teal-400 font-bold underline">
                Contact page
              </Link>{' '}
              and we will respond within a reasonable time.
            </p>
          </section>

          {/* 10. Changes */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes to
              the platform. When we do, the &quot;Last Updated&quot; date at the top of this page
              will be revised. We encourage you to review this page periodically.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              11. Contact
            </h2>
            <p>
              For privacy queries or questions about our editorial standards, please reach
              out via our{' '}
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
