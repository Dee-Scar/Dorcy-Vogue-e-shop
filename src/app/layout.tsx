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
  title: "DORCY VOGUE | Premium Nigerian Fashion Brand",
  description: "Discover premium fashion that speaks to your unique sense of style. Curated collections of elegant dresses, baggy jeans, joggers, and accessories celebrating African style with a modern twist.",
  keywords: "fashion, Nigerian fashion, clothing, boutique, luxury brand, Dorcy Vogue, Ankara, maxi dress, streetwear",
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
