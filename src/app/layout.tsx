import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OXYNISX VTuber Studio",
  description: "VTuber studio with Ohto Ai (red hoodie) — Live2D avatar with lip-sync, mouse tracking, and BongoCat-style keyboard overlay.",
  keywords: ["OXYNISX", "VTuber", "Live2D", "Ohto Ai", "BongoCat", "avatar"],
  authors: [{ name: "OXYNISX" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        {/* Live2D Cubism 4 core runtime - must load before pixi-live2d-display */}
        <script src="/live2dcubismcore.min.js" async={false} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
