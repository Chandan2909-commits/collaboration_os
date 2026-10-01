import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isClerkConfigured } from '@/lib/clerk';

export async function GET() {
  return NextResponse.json({
    status: 'ONLINE',
    system: 'CrossTech Collaboration OS',
    version: '1.0.0',
    hierarchy: 'Platform -> Organization -> Department -> Team -> Members',
    supabase: {
      configured: isSupabaseConfigured,
      schema: 'supabase/schema.sql'
    },
    clerk: {
      configured: isClerkConfigured
    },
    timestamp: new Date().toISOString()
  });
}
