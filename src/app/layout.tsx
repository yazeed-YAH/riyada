import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// Layout component for the application
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ملتقى ريادة - تجمع سيدات الأعمال",
  description: "تجمع تفاعلي يجمع سيدات الأعمال والقياديات لتبادل الخبرات وبناء علاقات مهنية قوية",
  keywords: ["ريادة", "سيدات الأعمال", "تمكين المرأة", "رؤية 2030", "ملتقى", "شبكة أعمال"],
  authors: [{ name: "ملتقى ريادة" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "ملتقى ريادة - تجمع سيدات الأعمال",
    description: "تجمع تفاعلي يجمع سيدات الأعمال والقياديات",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} antialiased`}>
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: 'Cairo, sans-serif',
              marginTop: '80px',
              fontSize: '14px',
              padding: '12px 20px',
            },
          }}
        />
      </body>
    </html>
  );
}

