import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dorcyvogue.com"),
  title: {
    default: "Dorcy Vogue | Premium Nigerian Fashion Brand",
    template: "%s | Dorcy Vogue",
  },
  description: "Shop premium Nigerian fashion at Dorcy Vogue. Discover elegant dresses, baggy jeans, joggers, basic tops, casual wear and accessories — delivered within Kaduna.",
  keywords: ["Dorcy Vogue", "Nigerian fashion", "Kaduna fashion store", "online clothing store Nigeria", "buy clothes Nigeria", "dresses Nigeria", "baggy jeans Nigeria", "affordable fashion Nigeria"],
  authors: [{ name: "Dorcy Vogue", url: "https://dorcyvogue.com" }],
  creator: "Dorcy Vogue",
  publisher: "Dorcy Vogue",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://dorcyvogue.com",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://dorcyvogue.com",
    siteName: "Dorcy Vogue",
    title: "Dorcy Vogue | Premium Nigerian Fashion Brand",
    description: "Shop premium Nigerian fashion at Dorcy Vogue. Elegant dresses, baggy jeans, joggers and accessories — delivered within Kaduna.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Dorcy Vogue — Premium Nigerian Fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dorcy Vogue | Premium Nigerian Fashion Brand",
    description: "Shop premium Nigerian fashion at Dorcy Vogue. Elegant dresses, baggy jeans, joggers and accessories — delivered within Kaduna.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF7F2] text-[#1C1512] font-sans selection:bg-[#B78A62] selection:text-white">
        <AuthProvider>
          <CartProvider>
            {children}
            <WhatsAppButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
