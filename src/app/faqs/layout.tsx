import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Learn how Tamdan uses AI to curate trusted news, deliver automated updates to Telegram and Gmail, and answer your custom questions.",
  alternates: {
    canonical: "https://tamdan.online/faqs",
  },
};

export default function FaqsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
