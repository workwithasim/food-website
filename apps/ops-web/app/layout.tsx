import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Restaurant Operations Portal | Admin & KDS",
  description: "Operations dashboard for restaurant managers, branch supervisors, and kitchen staff."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen text-gray-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
