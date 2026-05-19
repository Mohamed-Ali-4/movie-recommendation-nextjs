import { NextResponse } from 'next/server';
import { listMovies } from '@/lib/tmdb-server';

export async function GET() {
  try {
    await listMovies('popular', 1);
    return NextResponse.json({ ok: true, tmdb: 'connected' });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
