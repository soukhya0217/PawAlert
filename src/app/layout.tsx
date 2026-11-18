import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans bg-[#FFFBF5] text-[#1B3B2B] antialiased selection:bg-[#FFB703]/30 selection:text-[#1B3B2B]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
