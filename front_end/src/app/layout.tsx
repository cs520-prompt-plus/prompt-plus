"use client";
import { ThemeProvider } from "@/components/provider/theme-provider";
import { Navbar } from "@/components/ui/navbar";
import { Toaster } from "@/components/ui/sonner";
import "@progress/kendo-theme-default/dist/all.css";
import { SessionProvider } from "next-auth/react";
import { Geist, Geist_Mono } from "next/font/google";
import React, { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <SessionProvider>
            <Suspense fallback="loading">
              {children}
              <Navbar />
            </Suspense>
          </SessionProvider>{" "}
        </ThemeProvider>
      </body>
    </html>
  );
}
