import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Super-Admin Platform Portal",
  description: "Global multi-tenant restaurant platform administration."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <aside style={{ width: 260, borderRight: "1px solid var(--color-border)", background: "var(--color-surface)", padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--color-brand-primary)", marginBottom: 32 }}>
              Platform Admin
            </div>
            <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-text)" }}>Overview</span>
              <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Tenants</span>
              <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Domains</span>
              <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Plans & Billing</span>
              <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>System Health</span>
              <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Audit Logs</span>
            </nav>
          </aside>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <header style={{ height: 64, borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
              <span style={{ fontWeight: 600 }}>Super-Admin Mode</span>
              <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>root@platform.local</span>
            </header>
            <main style={{ flex: 1, padding: 32 }}>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
