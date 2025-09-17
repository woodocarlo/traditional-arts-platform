import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PODCASTS_FILE = path.join(process.cwd(), 'data', 'podcasts.json');

export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!fs.existsSync(PODCASTS_FILE)) {
      return NextResponse.json({ error: 'Podcasts file not found' }, { status: 404 });
    }

    const podcasts = JSON.parse(fs.readFileSync(PODCASTS_FILE, 'utf8'));
    const updatedPodcasts = podcasts.filter(podcast => podcast.id !== id);

    fs.writeFileSync(PODCASTS_FILE, JSON.stringify(updatedPodcasts, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting podcast:', error);
    return NextResponse.json(
      { error: 'Failed to delete podcast', details: error.message },
      { status: 500 }
    );
  }
}
