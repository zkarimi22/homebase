import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import AppShell from "@/components/AppShell";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Homebase",
  description: "The homeowner's dream dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex bg-neutral-50 text-black font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
