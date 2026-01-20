import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BackgroundCircles } from "@/components/ui/shadcn-io/background-circles";
import { GridPattern } from "@/components/ui/shadcn-io/grid-pattern";
import { StickyBanner } from "@/components/ui/sticky-banner";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Musicle App",
  description: "Musicle is a detection software which incorporated an AI Agent to detect music styles, BPM, gives realtime tips, etc.",
  icons: {
    icon: "/icons8-piano-ios7-32.png",
  },
};

const noNavbarPages = ["/login", "/register", "/forgot-password"];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <main className="relative min-h-screen bg-[#171717] text-white overflow-hidden font-sans selection:bg-[#BCAAF9] selection:text-black">
          {/* Sticky Banner */}
          <StickyBanner className="bg-gradient-to-b from-yellow-400 to-yellow-500">
            <p className="mx-0 max-w-[50%] text-black drop-shadow-md">
              Newest Musicle Update set to release 23rd February 2026.{" "}
              <a href="#" className="transition duration-200 hover:underline">
                Read announcement
              </a>
            </p>
          </StickyBanner>

          {/* Background Elements */}
          <GridPattern className={cn("[mask-image:radial-gradient(1000px,white,transparent)]")} strokeDasharray="2 6" />

          {/* Background Circles - Bottom Half */}
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-0 pointer-events-none w-full h-1/2 overflow-hidden">
            <div className="absolute inset-0 opacity-100 scale-150">
              <BackgroundCircles variant="quaternary" />
            </div>
            {/* Gradient overlay for smooth blend */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#171717]" />
          </div>

          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-0 pointer-events-none w-full h-1/2 overflow-hidden">
            <div className="absolute inset-0 opacity-25 scale-250">
              <BackgroundCircles variant="septenary" />
            </div>
            {/* Gradient overlay for smooth blend */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#171717]" />
          </div>

          {/* Content Wrapper */}
          <div className="relative z-10">
            {/* Navbar - Conditionally rendered */}
            <Navbar />

            {/* Page Content */}
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
