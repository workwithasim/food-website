import { NextResponse } from 'next/server';

const API_BASE = process.env.API_INTERNAL_URL || 'http://localhost:4000/api/v1';

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/v1/storefront/config`, {
      cache: 'no-store',
      headers: {
        'x-ops-admin': 'true',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(`${API_BASE}/v1/storefront/config/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-ops-admin': 'true',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.message || 'Failed to update settings' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
