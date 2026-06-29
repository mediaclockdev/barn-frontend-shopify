import type { Metadata } from "next";
import { Poppins, Inter, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/src/layout/Header";
import Footer from "@/src/layout/Footer";
import ScrollToTop from "@/src/components/misc/ScrollToTop";
import { constructMetadata } from "@/src/utils/seo";
import { getFooterData } from "@/src/utils/footer-api";
import { FOOTER_FALLBACK } from "@/src/utils/footer-fallback";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = constructMetadata({
  title: "Barn | Premium Pet Stock and Feed",
  description:
    "At Barn, we believe every animal deserves quality care, attention, and supplies. Shop the best feed and animal supplies.",
});

import { Toaster } from "react-hot-toast";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const footerRes = await getFooterData();
  const footerData = { ...FOOTER_FALLBACK, ...(footerRes?.data || {}) };

  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${poppins.variable} ${inter.variable} ${outfit.variable} antialiased`}
      >
        <ScrollToTop />
        <Header />
        {children}
        <Footer data={footerData} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "custom-toast",
            style: {
              background: "#333",
              color: "#fff",
              alignItems: "flex-start",
            },
          }}
        />
      </body>
    </html>
  );
}
