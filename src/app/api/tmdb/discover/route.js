import { NextResponse } from 'next/server';
import { discoverByGenre, GENRE_NAME_TO_ID } from '@/lib/tmdb-server';

export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  const genre = sp.get('genre') || '';
  if (!genre) return NextResponse.json({ message: 'Missing genre' }, { status: 400 });
  const genreId = isNaN(Number(genre)) ? GENRE_NAME_TO_ID[genre.toLowerCase()] : parseInt(genre);
  if (!genreId) return NextResponse.json({ message: 'Unknown genre' }, { status: 400 });
  const page = Math.max(1, parseInt(sp.get('page') || '1'));
  try {
    return NextResponse.json(await discoverByGenre(genreId, page));
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
