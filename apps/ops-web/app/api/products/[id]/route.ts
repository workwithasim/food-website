import { NextResponse } from 'next/server';

const API_BASE = process.env.API_INTERNAL_URL || 'http://localhost:4000/api/v1';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const payload: Record<string, any> = {};

    if (body.name !== undefined) payload.name = body.name.trim();
    if (body.category_id !== undefined) payload.category_id = body.category_id;
    if (body.price !== undefined) {
      const priceNum = parseFloat(body.price) || 0;
      payload.base_price_minor = Math.round(priceNum * 100);
    }
    if (body.status !== undefined) {
      payload.status = body.status === 'Active' || body.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
    }
    if (body.description !== undefined) payload.description = body.description;
    if (body.image_url !== undefined) payload.image_url = body.image_url;

    const res = await fetch(`${API_BASE}/v1/admin/catalog/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-ops-admin': 'true',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json({ error: errData.message || 'Failed to update product' }, { status: res.status });
    }

    const updated = await res.json();
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const res = await fetch(`${API_BASE}/v1/admin/catalog/products/${id}`, {
      method: 'DELETE',
      headers: {
        'x-ops-admin': 'true',
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json({ error: errData.message || 'Failed to delete product' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
