import type { Metadata } from "next";
import "./globals.css";
import { Header } from "../components/Header";
import { CartProvider } from "../components/CartProvider";
import { CartSidebar } from "../components/CartSidebar";
import { Footer } from "../components/Footer";
import { StorefrontConfigProvider } from "../components/StorefrontConfigContext";

export const metadata: Metadata = {
  title: "Cheezious | World of Flavors & Cheezy Treats",
  description: "Order online from Cheezious. Delicious pizzas, crunchy bazinga burgers, cheesy sticks, and special deals delivered hot & fresh to your doorstep.",
  icons: {
    icon: "https://cheezious.com/cheezious.svg",
  },
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  let initialConfig = undefined;
  let initialBranches = undefined;

  try {
    const [configRes, branchesRes] = await Promise.all([
      fetch(`${apiUrl}/v1/storefront/config`, { cache: 'no-store' }),
      fetch(`${apiUrl}/v1/branches`, { cache: 'no-store' }),
    ]);

    if (configRes.ok) {
      initialConfig = await configRes.json();
    }
    if (branchesRes.ok) {
      initialBranches = await branchesRes.json();
    }
  } catch (err) {
    console.error("Failed to load storefront initial layout config:", err);
  }

  return (
    <html lang="en">
      <body className="bg-[#F8F9FA] min-h-screen flex flex-col font-sans text-gray-900 antialiased selection:bg-[#FFC107] selection:text-black">
        <StorefrontConfigProvider
          initialConfig={initialConfig}
          initialBranches={initialBranches}
        >
          <CartProvider>
            <Header />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </main>
            <Footer />
            <CartSidebar />
          </CartProvider>
        </StorefrontConfigProvider>
      </body>
    </html>
  );
}
