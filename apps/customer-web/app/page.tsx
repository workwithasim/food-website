import { MenuExplorer } from "../components/MenuExplorer";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  let categories = [];
  let products = [];

  try {
    const [catRes, prodRes] = await Promise.all([
      fetch(`${apiUrl}/v1/catalog/categories`, { cache: 'no-store' }),
      fetch(`${apiUrl}/v1/catalog/products`, { cache: 'no-store' }),
    ]);

    if (catRes.ok) {
      categories = await catRes.json();
    }
    if (prodRes.ok) {
      products = await prodRes.json();
    }
  } catch (err) {
    console.error("Failed to load catalog data:", err);
  }

  return (
    <div className="w-full">
      <MenuExplorer
        initialCategories={categories}
        initialProducts={products}
      />
    </div>
  );
}
