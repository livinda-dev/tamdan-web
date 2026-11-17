import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Tamdan",
  description: "Terms of Service for Tamdan - AI News Automation & Digest Service",
};

export default function TermsOfServicePage() {
  return (
    <div className="px-4 sm:px-6 md:px-12 lg:px-[120px] max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 md:p-12 space-y-8">
        {/* Header */}
        <div className="border-b border-gray-100 pb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#00355A]">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Last Updated: November 18, 2026
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#00355A]">1. Agreement to Terms</h2>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            By accessing or using <strong>Tamdan</strong> (&quot;the Service&quot;), hosted at{" "}
            <Link href="/" className="text-blue-600 hover:underline">
              tamdan-web.vercel.app
            </Link>{" "}
            or associated domains, you agree to be bound by these Terms of Service. If you do not agree to all terms and conditions, you must not access or use our Service.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#00355A]">2. Description of the Service</h2>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            Tamdan is an automated news aggregation and summarization platform. Our AI agents curate articles from reputable external news publications based on user-defined topics and deliver digest summaries via the web portal and connected Telegram channels.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#00355A]">3. Account Registration & Google Authentication</h2>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            To use certain features of the Service, such as saving topics and receiving automated digests, you must authenticate using your Google account. You agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
            <li>Provide accurate and current account information.</li>
            <li>Maintain the confidentiality and security of your account.</li>
            <li>Notify us immediately of any unauthorized use of your account.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#00355A]">4. Acceptable Use Policy</h2>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            You agree not to misuse the Service. Specifically, you must not:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
            <li>Interfere with or disrupt the integrity or performance of the Service or its servers.</li>
            <li>Attempt to gain unauthorized access to any part of the Service, database, or networks.</li>
            <li>Use automated bots, scrapers, or scripts to overload or abuse the news generation pipeline.</li>
            <li>Use the Service for any unlawful, infringing, or fraudulent purposes.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#00355A]">5. Intellectual Property & Third-Party News Content</h2>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            Tamdan aggregates content and headlines from publicly available web sources. All original news articles, headlines, logos, and trademarks belong to their respective publishers and copyright owners. Tamdan provides summaries and links directly to the original publisher sources for fair attribution.
          </p>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            The Tamdan design, software code, logos, and features are the intellectual property of Tamdan and are protected by applicable intellectual property laws.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#00355A]">6. Disclaimer of Warranties</h2>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. While our AI systems strive for high accuracy, we do not guarantee the completeness, timeliness, or absolute accuracy of external news reports or AI-generated summaries.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#00355A]">7. Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            In no event shall Tamdan, its developers, or affiliated institutions be liable for any indirect, incidental, special, consequential, or punitive damages arising from your access to or inability to use the Service.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#00355A]">8. Modifications to Terms</h2>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            We reserve the right to modify or replace these Terms at any time. Material changes will be indicated by updating the &quot;Last Updated&quot; date at the top of this page. Your continued use of the Service following any changes constitutes acceptance of the new Terms.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-3 border-t border-gray-100 pt-6">
          <h2 className="text-xl font-bold text-[#00355A]">9. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            If you have questions about these Terms of Service, please reach out to:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 space-y-1">
            <p><strong>Project:</strong> Tamdan (Group 7, Gen 9)</p>
            <p><strong>Institution:</strong> Cambodia Academy of Digital Technology (CADT)</p>
            <p><strong>Email:</strong> <a href="mailto:tamdan.cadt@gmail.com" className="text-blue-600 hover:underline">tamdan.cadt@gmail.com</a></p>
          </div>
        </section>
      </div>
    </div>
  );
}
