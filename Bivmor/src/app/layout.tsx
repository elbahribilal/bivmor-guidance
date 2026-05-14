import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "مباريات المغرب - منصة المباريات والفرص التعليمية",
  description: "منصة مركزية شاملة لجميع المباريات والمدارس والفرص التعليمية في المغرب. اكتشف concours ومباريات الالتحاق بأفضل المؤسسات.",
  keywords: ["مباريات", "المغرب", "concours", "مدارس", "تعليم", "مباراة", "التحاق", "جامعة", "مهندس", "طبيب"],
  authors: [{ name: "مباريات المغرب" }],
  openGraph: {
    title: "مباريات المغرب - منصة المباريات والفرص التعليمية",
    description: "منصة مركزية شاملة لجميع المباريات والمدارس والفرص التعليمية في المغرب",
    type: "website",
    siteName: "مباريات المغرب",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster position="top-center" dir="rtl" />
        </Providers>
      </body>
    </html>
  );
}
