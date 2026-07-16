import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop — Dorcy Vogue | Premium Nigerian Fashion",
  description: "Browse our full collection of premium Nigerian fashion including dresses, baggy jeans, joggers, basic tops, casual wear and accessories. Free delivery on orders over ₦50,000.",
  keywords: ["Dorcy Vogue shop", "buy clothes Nigeria", "Nigerian fashion online", "dresses Kaduna", "baggy jeans Nigeria", "affordable fashion online"],
  alternates: {
    canonical: "https://dorcyvogue.com/shop",
  },
  openGraph: {
    type: "website",
    url: "https://dorcyvogue.com/shop",
    title: "Shop — Dorcy Vogue | Premium Nigerian Fashion",
    description: "Browse our full collection of premium Nigerian fashion. Dresses, jeans, joggers and accessories delivered across Nigeria.",
    images: [{ url: "/og-image.png", width: 500, height: 500, alt: "Dorcy Vogue Shop" }],
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
