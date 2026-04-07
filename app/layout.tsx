import type { Metadata } from "next";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Geist, Geist_Mono } from "next/font/google";
import { TRPCReactProvider } from "../trpc/client";
import "./globals.css"; // your app's globals.css";
import { Toaster } from "../components/ui/sonner";
import { Provider } from "jotai";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "n8n clone",
  description: "An open source workflow automation tool.",
  icons: {
    icon: "/logos/logo.svg",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TRPCReactProvider>
          <NuqsAdapter>
            <Provider>
              {children}
            </Provider>

          </NuqsAdapter>
          <Toaster />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
