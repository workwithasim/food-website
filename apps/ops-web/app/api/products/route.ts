import { NextResponse } from 'next/server';

const API_BASE = process.env.API_INTERNAL_URL || 'http://localhost:4000/api/v1';

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/v1/admin/catalog/products`, {
      cache: 'no-store',
      headers: {
        'x-ops-admin': 'true',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = (body.name || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    const rawSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${rawSlug || 'item'}-${Date.now().toString().slice(-4)}`;

    const priceNum = parseFloat(body.price) || 0;
    const basePriceMinor = Math.round(priceNum * 100);

    const payload = {
      name,
      slug,
      category_id: body.category_id,
      base_price_minor: basePriceMinor,
      currency_code: 'PKR',
      status: body.status === 'Active' || body.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      description: body.description || undefined,
      image_url: body.image_url || undefined,
      featured: Boolean(body.featured),
    };

    const res = await fetch(`${API_BASE}/v1/admin/catalog/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ops-admin': 'true',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json({ error: errData.message || 'Failed to create product' }, { status: res.status });
    }

    const created = await res.json();
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
