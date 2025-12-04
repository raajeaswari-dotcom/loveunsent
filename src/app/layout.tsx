import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { CustomizationProvider } from "../context/CustomizationContext";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import { ReactNode } from "react";
import { Inter, Gorditas } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const gorditas = Gorditas({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-gorditas",
});

export const metadata = {
  title: "LoveUnsent",
  description: "Write Heartfelt Letters",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${gorditas.variable}`}>
      <body>
        <AuthProvider>
          <CartProvider>
            <CustomizationProvider>
              <Header />
              <main>{children}</main>
              <Footer />
            </CustomizationProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
