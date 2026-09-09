import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Food Platform | White-Label Ordering",
  description: "Fast, seamless online food ordering for premium restaurant brands."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)", padding: "16px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-brand-primary)" }}>
              Food Platform
            </span>
            <nav style={{ display: "flex", gap: "16px" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Delivery / Pickup</span>
            </nav>
          </div>
        </header>
        <main style={{ minHeight: "calc(100vh - 140px)" }}>{children}</main>
        <footer style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-surface)", padding: "24px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          © {new Date().getFullYear()} White-Label Multi-Tenant Restaurant Platform
        </footer>
      </body>
    </html>
  );
}
