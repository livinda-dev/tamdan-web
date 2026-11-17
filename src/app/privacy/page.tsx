import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Tamdan",
  description: "Privacy Policy for Tamdan - AI News Automation & Digest Service",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="px-4 sm:px-6 md:px-12 lg:px-[120px] max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 md:p-12 space-y-8">
        {/* Header */}
        <div className="border-b border-gray-100 pb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#00355A]">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Last Updated: November 18, 2026
          </p>
        </div>

        {/* Introduction */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#00355A]">1. Introduction</h2>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            Welcome to <strong>Tamdan</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), available at{" "}
            <Link href="/" className="text-blue-600 hover:underline">
              tamdan-web.vercel.app
            </Link>{" "}
            (or tamdan.co). Tamdan is an AI-powered automated news curation and digest service. We respect your privacy and are committed to protecting the personal information you share with us.
          </p>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you use our website, application, and Telegram notification services.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#00355A]">2. Information We Collect</h2>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            We only collect information necessary to provide and personalize our news delivery services:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
            <li>
              <strong>Google Account Information:</strong> When you sign in using Google OAuth, we receive your name, email address, profile picture URL, and a unique Google user ID.
            </li>
            <li>
              <strong>Preferences & Topics:</strong> Topics of interest that you choose to track for your personalized news digests.
            </li>
            <li>
              <strong>Telegram Account Details (Optional):</strong> Your Telegram Chat ID and username if you choose to receive daily news digests via our Telegram bot.
            </li>
            <li>
              <strong>Usage Data:</strong> Basic technical logs such as device type, browser information, and timestamps to improve reliability and security.
            </li>
          </ul>
        </section>

        {/* Google User Data */}
        <section className="space-y-3 bg-blue-50/50 p-5 rounded-xl border border-blue-100">
          <h2 className="text-xl font-bold text-[#00355A]">3. Google API User Data Policy Compliance</h2>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            Tamdan&apos;s use and transfer of information received from Google APIs adheres to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline font-medium"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
            <li>We only request access to basic identity scopes (<code>openid</code>, <code>email</code>, <code>profile</code>) for user authentication.</li>
            <li>We do <strong>not</strong> sell, rent, or transfer your Google user data to third parties.</li>
            <li>We do <strong>not</strong> use your Google user data for advertising, targeted ads, or credit evaluations.</li>
            <li>We do <strong>not</strong> use or transfer your personal Google user data to train generalized AI models.</li>
          </ul>
        </section>

        {/* How We Use Your Data */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#00355A]">4. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
            <li>To authenticate you and maintain your secure session.</li>
            <li>To generate and deliver customized 24-hour news digests based on your topics of interest.</li>
            <li>To dispatch notifications to your connected Telegram bot.</li>
            <li>To ensure system security, prevent fraud, and maintain compliance.</li>
          </ul>
        </section>

        {/* Data Security & Storage */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#00355A]">5. Data Storage and Security</h2>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            Your data is stored securely in our enterprise-grade database infrastructure (Supabase) protected by strict Row Level Security (RLS) policies and HTTPS encryption in transit. We implement standard organizational and technical measures to guard against unauthorized access, alteration, or disclosure.
          </p>
        </section>

        {/* User Rights & Deletion */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#00355A]">6. Data Retention and Your Rights</h2>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            You retain full control over your personal data:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
            <li><strong>Access & Update:</strong> You can view and update your topics and connected channels directly in your profile settings.</li>
            <li><strong>Account Deletion:</strong> You may request the complete deletion of your account and associated data at any time by contacting us at{" "}
              <a href="mailto:tamdan.cadt@gmail.com" className="text-blue-600 underline">
                tamdan.cadt@gmail.com
              </a>.
            </li>
            <li><strong>Revoke Google Access:</strong> You can revoke Tamdan&apos;s access to your Google account at any time via your{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Google Security Settings
              </a>.
            </li>
          </ul>
        </section>

        {/* Contact */}
        <section className="space-y-3 border-t border-gray-100 pt-6">
          <h2 className="text-xl font-bold text-[#00355A]">7. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            If you have any questions or concerns regarding this Privacy Policy or how your data is handled, please contact us:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 space-y-1">
            <p><strong>Project:</strong> Tamdan (Capstone Project, Group 7, Gen 9)</p>
            <p><strong>Institution:</strong> Cambodia Academy of Digital Technology (CADT)</p>
            <p><strong>Email:</strong> <a href="mailto:tamdan.cadt@gmail.com" className="text-blue-600 hover:underline">tamdan.cadt@gmail.com</a></p>
          </div>
        </section>
      </div>
    </div>
  );
}
