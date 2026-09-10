import { NextResponse } from 'next/server';

const API_BASE = process.env.API_INTERNAL_URL || 'http://localhost:4000/api/v1';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const res = await fetch(`${API_BASE}/v1/admin/catalog/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-ops-admin': 'true',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.message || 'Failed to update category' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const res = await fetch(`${API_BASE}/v1/admin/catalog/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'x-ops-admin': 'true',
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.message || 'Failed to delete category' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
