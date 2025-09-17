import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PODCASTS_FILE = path.join(process.cwd(), 'data', 'podcasts.json');

export async function POST(request) {
  try {
    const { id } = await request.json();

    if (!fs.existsSync(PODCASTS_FILE)) {
      return NextResponse.json({ error: 'Podcasts file not found' }, { status: 404 });
    }

    const podcasts = JSON.parse(fs.readFileSync(PODCASTS_FILE, 'utf8'));
    const podcast = podcasts.find(p => p.id === id);

    if (!podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    return NextResponse.json({ script: podcast.script });
  } catch (error) {
    console.error('Error getting podcast script:', error);
    return NextResponse.json(
      { error: 'Failed to get podcast script', details: error.message },
      { status: 500 }
    );
  }
}
