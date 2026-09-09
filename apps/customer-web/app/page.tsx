import { Button, Card, Badge } from "@restaurant/ui";

export default function HomePage() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      <section style={{ textAlign: "center", marginBottom: 48 }}>
        <Badge variant="default" style={{ marginBottom: 12 }}>White-Label Customer Web</Badge>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, margin: "12px 0", color: "var(--color-text)" }}>
          Delicious Food, Delivered Fast.
        </h1>
        <p style={{ fontSize: "1.125rem", color: "var(--color-text-muted)", maxWidth: 600, margin: "0 auto 24px auto" }}>
          Explore our menu, customize your favorite meals, and track your orders in real time.
        </p>
        <Button size="lg" variant="primary">
          Start Ordering
        </Button>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
        <Card padding="md">
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 8 }}>Multi-Branch Delivery</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
            Automated location resolution routes orders to your nearest branch with accurate delivery zones.
          </p>
        </Card>
        <Card padding="md">
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 8 }}>Dynamic Menus</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
            Rich variants, modifier groups, and branch-level inventory control built right in.
          </p>
        </Card>
        <Card padding="md">
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 8 }}>Real-Time Tracking</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
            Live status from kitchen preparation to rider handoff and delivery.
          </p>
        </Card>
      </section>
    </div>
  );
}
