import { NextResponse } from 'next/server';
import { getMovieDetails } from '@/lib/tmdb-server';

export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const movie = await getMovieDetails(id);
    if (!movie) return NextResponse.json({ message: 'Movie not found' }, { status: 404 });
    return NextResponse.json(movie);
  } catch (err) {
    const status = err.message.includes('404') ? 404 : 500;
    return NextResponse.json({ message: err.message }, { status });
  }
}
