import { ToastProvider } from "@/components/ui/toast";
import { AyrshareProvider } from "@/contexts/AyrshareContext";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Validate required environment variables
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!clerkPublishableKey) {
  if (process.env.NODE_ENV === "development") {
    throw new Error(
      "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable. " +
        "Please create a .env.local file with your Clerk publishable key. " +
        "Get your keys from: https://dashboard.clerk.com/"
    );
  } else {
    throw new Error(
      "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable"
    );
  }
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ContentClip AI - AI-Powered Content Creation for Creators",
  description:
    "AI-powered SaaS platform for content creators to clip videos, generate and analyze images, and post to multiple social media platforms including Bluesky, Facebook, Instagram, LinkedIn, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ToastProvider>
      <ClerkProvider
        publishableKey={clerkPublishableKey}
        appearance={{
          baseTheme: undefined,
          variables: {
            colorPrimary: "#3b82f6",
            colorBackground: "#ffffff",
            colorInputBackground: "#ffffff",
            colorInputText: "#1f2937",
          },
          elements: {
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
            card: "shadow-lg",
          },
        }}
      >
        <AyrshareProvider>
          <html lang="en">
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
              suppressHydrationWarning={true}
            >
              {children}
            </body>
          </html>
        </AyrshareProvider>
      </ClerkProvider>
    </ToastProvider>
  );
}
