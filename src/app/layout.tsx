import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import AuthHashListener from "@/components/AuthHashListener";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tamdan.online"),
  title: {
    default: "Tamdan - AI News Automation & Topic Summaries",
    template: "%s | Tamdan",
  },
  description:
    "Stay informed with AI-curated news digests, instant topic summarization, and automated Telegram & Gmail news alerts.",
  keywords: [
    "AI news",
    "news summaries",
    "topic digest",
    "automation",
    "Cambodia news",
    "Tamdan",
    "AI agent news",
    "Telegram news bot",
  ],
  authors: [{ name: "Tamdan", url: "https://tamdan.online" }],
  creator: "Tamdan",
  publisher: "Tamdan",
  alternates: {
    canonical: "https://tamdan.online",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tamdan.online",
    siteName: "Tamdan",
    title: "Tamdan - AI News Automation & Topic Summaries",
    description:
      "Stay informed with AI-curated news digests, instant topic summarization, and automated Telegram & Gmail news alerts.",
    images: [
      {
        url: "/image/LogoTamdan.png",
        width: 1200,
        height: 630,
        alt: "Tamdan AI News Automation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tamdan - AI News Automation & Topic Summaries",
    description:
      "Stay informed with AI-curated news digests, instant topic summarization, and automated Telegram & Gmail news alerts.",
    images: ["/image/LogoTamdan.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <AuthHashListener />
      <NavBar/>
      <main className="min-h-screen background-color text-gray-900 py-6 sm:py-8 md:py-12 lg:py-[60px]">
        {children}
      </main>
      <Footer/>
      </body>

    </html>
  );
}
