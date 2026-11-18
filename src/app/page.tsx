
import type { Metadata } from "next";
import InterestPage from "./interest/page";

export const metadata: Metadata = {
  title: "Tamdan - AI News Automation & Topic Summaries",
  description:
    "Discover real-time, AI-summarized news tailored to your interests. Receive automated morning digests directly on Telegram or Gmail.",
  alternates: {
    canonical: "https://tamdan.online",
  },
};

export default function Home() {
  return (
    <InterestPage />
  );
}
