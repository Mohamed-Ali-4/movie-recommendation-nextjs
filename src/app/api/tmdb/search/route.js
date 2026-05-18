import { NextResponse } from 'next/server';
import { searchMovies } from '@/lib/tmdb-server';

export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  const q = (sp.get('q') || '').trim();
  if (!q) return NextResponse.json({ message: 'Missing q' }, { status: 400 });
  const page = Math.max(1, parseInt(sp.get('page') || '1'));
  try {
    return NextResponse.json(await searchMovies(q, page));
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
