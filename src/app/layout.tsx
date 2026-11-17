import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "POWER ALERT | Every Life Matters. Every Alert Counts.",
  description:
    "Production-grade animal rescue and welfare management platform connecting citizens, rescuers, veterinarians, NGOs, and shelters.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><path d='M20 2 36 11v18L20 38 4 29V11z' fill='%2305070d' stroke='%23d4ff3a' stroke-width='3'/><path d='M12 24 20 16 28 24' fill='none' stroke='%23d4ff3a' stroke-width='3' stroke-linecap='round'/></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col font-sans bg-[#05070d] text-slate-100 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
