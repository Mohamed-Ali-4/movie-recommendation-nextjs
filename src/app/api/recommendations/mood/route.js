import { NextResponse } from 'next/server';
import { discoverByGenre, searchMovies, listMovies, GENRE_NAME_TO_ID } from '@/lib/tmdb-server';

const MOOD_KEYWORDS = {
  Comedy: ['funny', 'laugh', 'humor', 'comedy', 'silly', 'lighthearted', 'feel-good', 'feel good', 'cheerful', 'hilarious', 'amusing'],
  Romance: ['romantic', 'romance', 'love story', 'dreamy', 'date night', 'rom com', 'rom-com'],
  Horror: ['scary', 'horror', 'creepy', 'frightening', 'terrifying', 'spooky', 'chilling'],
  Thriller: ['thriller', 'suspense', 'tense', 'gripping', 'nail-biting', 'edge of my seat', 'edge-of-my-seat'],
  Action: ['action', 'fight', 'explosion', 'adrenaline', 'pumped', 'energetic', 'high octane'],
  Drama: ['drama', 'emotional', 'cry', 'heartbreaking', 'sad', 'tearjerker', 'moving', 'serious', 'heartfelt', 'depressing'],
  'Sci-Fi': ['sci-fi', 'scifi', 'science fiction', 'space', 'aliens', 'futuristic', 'mind-bending', 'cyberpunk', 'time travel', 'dystopian'],
  Fantasy: ['fantasy', 'magic', 'magical', 'wizard', 'dragon', 'enchanted', 'fairy tale'],
  Adventure: ['adventure', 'journey', 'quest', 'epic', 'exploration', 'explore'],
  Animation: ['animated', 'animation', 'cartoon', 'anime', 'pixar', 'disney'],
  Mystery: ['mystery', 'detective', 'whodunit', 'puzzle', 'clue'],
  Crime: ['crime', 'heist', 'gangster', 'mafia', 'noir', 'robbery'],
  Documentary: ['documentary', 'true story', 'real life', 'docu'],
  Family: ['family', 'kids', 'children', 'wholesome', 'family-friendly'],
  War: ['war', 'battle', 'military', 'soldier', 'wartime'],
  Western: ['western', 'cowboy', 'wild west'],
  History: ['historical', 'period drama', 'period piece', 'history']
};

function matchGenres(moodText) {
  const text = ` ${moodText.toLowerCase()} `;
  const hits = [];
  for (const [genre, kws] of Object.entries(MOOD_KEYWORDS)) {
    for (const kw of kws) {
      if (text.includes(` ${kw} `) || text.includes(` ${kw},`) || text.includes(` ${kw}.`)) {
        hits.push(genre);
        break;
      }
    }
  }
  return [...new Set(hits)].slice(0, 3);
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { body = {}; }
  const mood = (body?.mood || '').trim();
  if (mood.length < 2) return NextResponse.json({ message: 'Mood too short (min 2 chars)' }, { status: 400 });
  if (mood.length > 500) return NextResponse.json({ message: 'Mood too long (max 500 chars)' }, { status: 400 });

  const matchedGenres = matchGenres(mood);
  const genreIds = matchedGenres.map(g => GENRE_NAME_TO_ID[g.toLowerCase()]).filter(Boolean);

  let results = [];
  let source = 'popular';

  if (genreIds.length) {
    try {
      const data = await discoverByGenre(genreIds.join('|'), 1);
      if (data.results.length) { results = data.results; source = 'discover'; }
    } catch {}
  }

  if (!results.length) {
    try {
      const data = await searchMovies(mood, 1);
      if (data.results.length) { results = data.results; source = 'search'; }
    } catch {}
  }

  if (!results.length) {
    try {
      const data = await listMovies('popular', 1);
      results = data.results;
      source = 'popular';
    } catch {}
  }

  return NextResponse.json({
    mood,
    matchedGenres,
    classifier: matchedGenres.length ? 'keyword' : null,
    source,
    results: results.slice(0, 12)
  });
}
