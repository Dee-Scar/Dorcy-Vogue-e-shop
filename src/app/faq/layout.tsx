import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Dorcy Vogue",
  description: "Frequently asked questions about orders, delivery, payments and returns at Dorcy Vogue.",
  alternates: { canonical: "https://dorcyvogue.com/faq" },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
