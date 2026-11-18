import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore News & Topic Feeds",
  description:
    "Explore today's top AI-summarized news topics, daily digests, and breaking stories across business, technology, politics, and culture.",
  alternates: {
    canonical: "https://tamdan.online/explore",
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
