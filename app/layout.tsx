import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context/AppContext";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Toast from "@/components/Toast";
import PageAccessGate from "@/components/PageAccessGate";
import AuthGate from "@/components/AuthGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Forever Us ❤️ Intimate Couple App",
  description: "Quick love requests, playful games, romantic date ideas, a private zone, and couple rewards.",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-rose-500 selection:text-white flex flex-col font-sans`}
      >
        {/* Ambient atmospheric glows */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -left-32 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 -right-32 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl" />
        </div>

        <AppProvider>
          <AuthGate>
            <div className="sticky top-0 z-40 w-full">
              <Header />
              <Navigation />
            </div>
            <main className="flex-1 pb-8 max-w-5xl w-full mx-auto px-4 py-4 sm:py-6">
              <PageAccessGate>{children}</PageAccessGate>
            </main>
            <Toast />
          </AuthGate>
        </AppProvider>
      </body>
    </html>
  );
}
