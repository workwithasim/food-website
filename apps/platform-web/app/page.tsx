import { Card, Badge, Button } from "@restaurant/ui";

export default function PlatformDashboardPage() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 700, margin: "0 0 8px 0" }}>Platform Overview</h1>
          <p style={{ color: "var(--color-text-muted)", margin: 0 }}>
            Global SaaS tenant provisioning, custom domains, and platform system metrics.
          </p>
        </div>
        <Button variant="primary">Provision New Tenant</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        <Card padding="md">
          <Badge variant="default" style={{ marginBottom: 8 }}>Total Tenants</Badge>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>12</div>
          <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>10 active, 2 trial</div>
        </Card>
        <Card padding="md">
          <Badge variant="success" style={{ marginBottom: 8 }}>Active Branches</Badge>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>45</div>
          <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Across all tenants</div>
        </Card>
        <Card padding="md">
          <Badge variant="muted" style={{ marginBottom: 8 }}>Custom Domains</Badge>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>9</div>
          <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>SSL provisioned</div>
        </Card>
        <Card padding="md">
          <Badge variant="success" style={{ marginBottom: 8 }}>System Health</Badge>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>100%</div>
          <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>All services operational</div>
        </Card>
      </div>
    </div>
  );
}
