import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import Script from "next/script";

export const metadata: Metadata = {
  title: "CodeLens | Professional Extension Intelligence Platform",
  description: "Deep-inspect browser extensions instantly. Real-time security auditing, behavior mapping, and privacy verification for Chrome, Edge, and Firefox extensions.",
  keywords: ["extension analyzer", "browser extension security", "CRX inspector", "extension source code", "malware detection"],
  openGraph: {
    title: "CodeLens | Professional Extension Intelligence",
    description: "Deep-inspect browser extensions instantly. Real-time security auditing.",
    type: "website",
    locale: "en_US",
    url: "https://codelens.sec",
    siteName: "CodeLens",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeLens | Professional Extension Intelligence",
    description: "Real-time security auditing and behavior mapping for browser extensions.",
  },
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${jetbrainsMono.variable} antialiased font-headline selection:bg-indigo-600 selection:text-white bg-background text-foreground transition-colors duration-300`}>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5940823355150687"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
