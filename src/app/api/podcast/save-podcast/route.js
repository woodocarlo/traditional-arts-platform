import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { script, config, timestamp } = await request.json();
    
    const podcastsPath = 'C:\\Users\\Satish\\Desktop\\hack2skill\\genAIexchange\\frontend\\traditional-arts-platform\\public\\assets\\podcasts';
    
    if (!fs.existsSync(podcastsPath)) {
      fs.mkdirSync(podcastsPath, { recursive: true });
    }

    const wordCount = script.split(' ').length;
    const estimatedMinutes = Math.ceil(wordCount / 150);
    const duration = `${estimatedMinutes}:00`;

    const podcastData = {
      id: Date.now(),
      title: config.topic.length > 50 ? `${config.topic.substring(0, 50)}...` : config.topic,
      script,
      config,
      duration,
      createdAt: timestamp,
      language: config.language,
      hostName: config.hostName,
      artistName: config.artistName
    };

    const fileName = `podcast_${Date.now()}.json`;
    const filePath = path.join(podcastsPath, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(podcastData, null, 2));

    return NextResponse.json(podcastData);
  } catch (error) {
    console.error('Error saving podcast:', error);
    return NextResponse.json(
      { error: 'Failed to save podcast' },
      { status: 500 }
    );
  }
}
