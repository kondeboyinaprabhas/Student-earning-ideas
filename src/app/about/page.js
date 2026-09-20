// src/app/about/page.js — About Student Earning Ideas
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'About Us | Student Earning Ideas',
  description:
    'Learn about Student Earning Ideas — a platform that helps students discover verified, research-backed ways to earn while studying, with no investment required.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-8">

          <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
              About
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              About Student Earning Ideas
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Helping students explore real, practical ways to earn while they study.
            </p>
          </div>

          {/* What we are */}
          <section className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              What is Student Earning Ideas?
            </h2>
            <p>
              Student Earning Ideas is an independent educational platform that curates and publishes
              practical, research-backed blueprints for students who want to explore earning
              opportunities during their studies. We cover a wide range of approaches — from
              freelancing and tutoring to digital content creation, reselling, campus services, and more.
            </p>
            <p>
              Every idea published on this platform is written or reviewed by our editorial desk,
              focusing on approaches that are genuinely accessible to students with limited time,
              capital, or prior experience.
            </p>
          </section>

          {/* How it works */}
          <section className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              How the platform works
            </h2>
            <p>
              When you visit Student Earning Ideas, you see a curated, personalised feed of earning
              blueprints. Each blueprint explains what the earning idea involves, what effort or
              skills it typically requires, tools or platforms commonly used, and realistic
              considerations a student should think about before pursuing it.
            </p>
            <p>
              You can save ideas you find interesting, search for specific topics, and read each
              idea in detail on its own page. Ideas you have already seen are tracked locally on
              your device so that fresh ones appear first — no account or sign-up required.
            </p>
          </section>

          {/* Editorial & informational purpose */}
          <section className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              For informational and educational purposes
            </h2>
            <p>
              All content on this platform is provided for informational and educational purposes
              only. We do not guarantee income, profit, employment, or any specific financial
              outcome. Results vary widely depending on individual effort, skills, local market
              conditions, execution, and many other factors outside our control.
            </p>
            <p>
              Before acting on any idea published here, we strongly encourage you to research
              the opportunity independently, understand any local legal or tax requirements that
              may apply, and evaluate whether it is right for your personal situation. Where
              appropriate, seek professional financial or legal advice.
            </p>
          </section>

          {/* Who operates it */}
          <section className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Who operates this platform
            </h2>
            <p>
              Student Earning Ideas is an independently operated website. The editorial team
              researches, writes, and curates content specifically aimed at students in India
              and similar markets. We are not affiliated with any university, government body,
              investment firm, or financial institution.
            </p>
            <p>
              We believe students deserve access to clear, honest information about practical
              earning options — without inflated promises or misleading claims.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Get in touch
            </h2>
            <p>
              Have a question, feedback, or a student earning idea to suggest? We welcome
              submissions and genuine feedback from students and educators.
            </p>
            <p>
              <Link
                href="/contact"
                className="text-teal-700 dark:text-teal-400 font-bold underline hover:text-teal-800 dark:hover:text-teal-300"
              >
                Visit our Contact page →
              </Link>
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
