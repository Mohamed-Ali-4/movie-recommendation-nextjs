import { NextResponse } from 'next/server';
import { listMovies } from '@/lib/tmdb-server';

export async function GET(request) {
  const page = Math.max(1, parseInt(new URL(request.url).searchParams.get('page') || '1'));
  try {
    return NextResponse.json(await listMovies('popular', page));
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
