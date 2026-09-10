import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cheezious | World of Flavors & Cheezy Treats",
  description: "Order online from Cheezious. Delicious pizzas, crunchy bazinga burgers, cheesy sticks, and special deals delivered hot & fresh to your doorstep.",
  icons: {
    icon: "https://cheezious.com/cheezious.svg",
  },
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
      <body className="bg-[#F8F9FA] min-h-screen flex flex-col font-sans text-gray-900 antialiased selection:bg-[#FFC107] selection:text-black">
        <CartProvider>
          <Header />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </main>
          <footer className="border-t border-gray-200 bg-white py-8 px-6 text-center text-xs text-gray-500 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-[#F15B25] text-white font-black text-xs flex items-center justify-center">C</span>
                <span className="font-extrabold text-gray-900 text-sm">Cheezious</span>
                <span className="text-gray-400">— World of Flavors & Cheezy Treats</span>
              </div>
              <div className="text-gray-400">
                UAN Hotline: <strong className="text-gray-800">051 111 446 699</strong> | © {new Date().getFullYear()} Cheezious Platform. All Rights Reserved.
              </div>
            </div>
          </footer>
          <CartSidebar />
        </CartProvider>
      </body>
    </html>
  );
}
