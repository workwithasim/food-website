import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Food Platform | White-Label Ordering",
  description: "Fast, seamless online food ordering for premium restaurant brands."
};

import { Header } from "../components/Header";
import { CartProvider } from "../components/CartProvider";
import { CartSidebar } from "../components/CartSidebar";

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
          <footer className="border-t bg-white p-6 text-center text-sm text-gray-500 mt-auto">
            © {new Date().getFullYear()} BrandFood Restaurant
          </footer>
          <CartSidebar />
        </CartProvider>
      </body>
    </html>
  );
}
