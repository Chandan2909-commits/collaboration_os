import { NextResponse } from 'next/server';
import { SEED_ORGANIZATIONS } from '@/lib/store';

export async function GET() {
  return NextResponse.json({
    organizations: SEED_ORGANIZATIONS
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug } = body;

    if (!name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }

    const newOrg = {
      id: `org_${Date.now()}`,
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      created_at: new Date().toISOString()
    };

    return NextResponse.json({ organization: newOrg }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
