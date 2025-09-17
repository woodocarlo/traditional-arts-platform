import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const podcastsPath = 'C:\\Users\\Satish\\Desktop\\hack2skill\\genAIexchange\\frontend\\traditional-arts-platform\\public\\assets\\podcasts';
    
    if (!fs.existsSync(podcastsPath)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(podcastsPath);
    const podcastFiles = files.filter(file => file.endsWith('.json'));

    const podcasts = podcastFiles.map(file => {
      try {
        const filePath = path.join(podcastsPath, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return data;
      } catch (error) {
        console.error(`Error reading podcast file ${file}:`, error);
        return null;
      }
    }).filter(Boolean);

    podcasts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json(podcasts);
  } catch (error) {
    console.error('Error loading podcasts:', error);
    return NextResponse.json([]);
  }
}
