import { NextResponse } from 'next/server';

const API_BASE = process.env.API_INTERNAL_URL || 'http://localhost:4000/api/v1';

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/v1/admin/branches`, {
      cache: 'no-store',
      headers: {
        'x-ops-admin': 'true',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch branches' }, { status: res.status });
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
      return NextResponse.json({ error: 'Branch name is required' }, { status: 400 });
    }

    const code = body.code || name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase() || 'BR';

    const payload = {
      name,
      code,
      city: body.city || 'Islamabad',
      address_line: body.address_line || body.address || 'Central Mall',
      phone: body.phone || '051 111 446 699',
      status: body.status || 'ACTIVE',
      accepts_delivery: body.accepts_delivery !== undefined ? Boolean(body.accepts_delivery) : true,
      accepts_pickup: body.accepts_pickup !== undefined ? Boolean(body.accepts_pickup) : true,
      timezone: 'Asia/Karachi',
      latitude: parseFloat(body.latitude) || 33.6844,
      longitude: parseFloat(body.longitude) || 73.0479,
    };

    const res = await fetch(`${API_BASE}/v1/admin/branches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ops-admin': 'true',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.message || 'Failed to create branch' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
