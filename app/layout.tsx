import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "@/components/providers";
import { WelcomeModal } from "@/components/welcome-modal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kechimyaku-2",
  description: "Next.js migration of the Kechimyaku lineage explorer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--canvas)] text-[var(--ink)]">
        <Providers>
          <div className="flex min-h-full flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
          </div>
          <WelcomeModal />
        </Providers>
      </body>
    </html>
  );
}
