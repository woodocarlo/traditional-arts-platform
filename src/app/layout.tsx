import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RootLayoutClient } from "@/components/RootLayoutClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KalaSakhi - Traditional Arts Platform",
  description: "A platform for traditional artists to digitize and promote their work",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootLayoutClient 
      geistSansClass={geistSans.variable} 
      geistMonoClass={geistMono.variable}
    >
      {children}
    </RootLayoutClient>
  );
}
