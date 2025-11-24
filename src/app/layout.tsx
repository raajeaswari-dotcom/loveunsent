import type { Metadata } from "next";
import { Jost } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";

const jost = Jost({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const gorditas = localFont({
  src: "../../public/fonts/gorditas.regular.ttf",
  variable: "--font-gorditas",
  weight: "400",
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
        className={`${jost.className} ${gorditas.variable} antialiased flex flex-col min-h-screen font-extralight`}
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
