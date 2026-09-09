import { Badge, Button } from "@restaurant/ui";
import { ProductCard } from "../components/ProductCard";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let products = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${apiUrl}/v1/catalog/products`, { cache: 'no-store' });
    if (res.ok) {
      products = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch products:", err);
  }

  return (
    <div className="space-y-12 pb-12">
      <section className="text-center bg-white rounded-3xl p-12 shadow-sm border mt-4">
        <Badge variant="default" className="mb-4">White-Label Customer Web</Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
          Delicious Food, Delivered Fast.
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Explore our menu, customize your favorite meals, and track your orders in real time.
        </p>
        <Button size="lg" variant="primary" className="rounded-full px-8">
          Start Ordering
        </Button>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Our Menu</h2>
        </div>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed">
            <p className="text-gray-500">No products available at the moment.</p>
          </div>
        )}
      </section>
    </div>
  );
}
