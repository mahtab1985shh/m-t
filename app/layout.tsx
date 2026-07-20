import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "نقشه راه بنیان‌گذاران | Mahtab & Tom",
  description: "از هم‌راستایی بنیان‌گذاران تا رشد بلندمدت؛ یک مسیر روشن و قابل پیگیری.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
