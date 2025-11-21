import type { Metadata } from "next";
import { Lora, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";

const lora = Lora({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Love Unsent - Personalized Handwritten Letters",
  description: "Express your feelings with authentic handwritten letters. Choose your paper, handwriting style, and perfume.",
};

import { CartProvider } from "@/context/CartContext";
import { CustomizationProvider } from "@/context/CustomizationContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartDrawer } from "@/components/CartDrawer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lora.className} ${playfair.variable} antialiased flex flex-col min-h-screen`}
      >
        <CartProvider>
          <AuthProvider>
            <CustomizationProvider>
              <Header />
              <CartDrawer />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </CustomizationProvider>
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
