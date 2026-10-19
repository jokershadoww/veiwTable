import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "جدول منصات",
    template: "%s | جدول منصات",
  },
  description: "جدول المنصات — متابعة القلاع والمنصات واللاعبين",
  applicationName: "جدول منصات",
  authors: [{ name: "omar326" }],
  creator: "omar326",
  other: {
    copyright: "omar326",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#060a16",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
