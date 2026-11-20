import type { Metadata, Viewport } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FFF9F0",
};

export const metadata: Metadata = {
  title: "PawAlert | Animal Rescue & Wildlife Dispatch Platform",
  description:
    "Decentralized animal rescue and field sanctuary dispatch platform connecting citizens, rescuers, veterinarians, NGOs, and shelters.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐾</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var saved = localStorage.getItem('pawalert_theme');
                var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                var isDark = saved === 'dark' || (!saved && prefersDark);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-[#FFF9F0] dark:bg-[#0F0E26] text-[#1E1B4B] dark:text-[#FFF9F0] antialiased selection:bg-[#FFB703]/30 selection:text-[#1E1B4B] transition-colors duration-300">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
