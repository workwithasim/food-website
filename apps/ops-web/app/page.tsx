import { Card, Badge, Button } from "@restaurant/ui";

export default function OpsDashboardPage() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 700, margin: "0 0 8px 0" }}>Operations Overview</h1>
          <p style={{ color: "var(--color-text-muted)", margin: 0 }}>
            Real-time branch metrics, live order queues, and kitchen status.
          </p>
        </div>
        <Button variant="primary">Accept New Orders</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 32 }}>
        <Card padding="md">
          <Badge variant="warning" style={{ marginBottom: 8 }}>Pending Orders</Badge>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>4</div>
          <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Requires acceptance</div>
        </Card>
        <Card padding="md">
          <Badge variant="default" style={{ marginBottom: 8 }}>In Kitchen</Badge>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>6</div>
          <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Avg prep: 12 min</div>
        </Card>
        <Card padding="md">
          <Badge variant="success" style={{ marginBottom: 8 }}>Riders Online</Badge>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>8</div>
          <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>5 currently busy</div>
        </Card>
        <Card padding="md">
          <Badge variant="muted" style={{ marginBottom: 8 }}>Today&apos;s Revenue</Badge>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>Rs 48,250</div>
          <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>32 completed orders</div>
        </Card>
      </div>
    </div>
  );
}
