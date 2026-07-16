import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Dorcy Vogue",
  description: "Get in touch with Dorcy Vogue. Reach us via phone, email or WhatsApp for orders, enquiries and support.",
  alternates: { canonical: "https://dorcyvogue.com/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
