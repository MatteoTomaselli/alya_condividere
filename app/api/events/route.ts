import { NextRequest, NextResponse } from 'next/server';
import { allAsync } from '@/lib/db';

export async function GET() {
  try {
    const events = await allAsync('SELECT * FROM events ORDER BY date ASC');
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Errore nel recupero degli eventi' }, { status: 500 });
  }
}
