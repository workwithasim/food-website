import { NextResponse } from 'next/server';

const API_BASE = process.env.API_INTERNAL_URL || 'http://localhost:4000/api/v1';

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/cms/banners`, {
      cache: 'no-store',
      headers: {
        'x-ops-admin': 'true',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch banners' }, { status: res.status });
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

    const title = (body.title || '').trim();
    if (!title) {
      return NextResponse.json({ error: 'Banner title is required' }, { status: 400 });
    }

    if (!body.image_url) {
      return NextResponse.json({ error: 'Banner image URL is required' }, { status: 400 });
    }

    const payload = {
      title,
      image_url: body.image_url,
      target_url: body.target_url || body.link_url || '/#menu',
      sort_order: parseInt(body.sort_order, 10) || 0,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
    };

    const res = await fetch(`${API_BASE}/cms/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ops-admin': 'true',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.message || 'Failed to create banner' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
