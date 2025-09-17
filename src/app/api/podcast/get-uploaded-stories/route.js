import fs from 'fs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const uploadsPath = 'C:\\Users\\Satish\\Desktop\\hack2skill\\genAIexchange\\frontend\\traditional-arts-platform\\public\\assets\\uploads';
    
    if (!fs.existsSync(uploadsPath)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(uploadsPath);
    const audioFiles = files.filter(file => 
      file.toLowerCase().endsWith('.mp3') || 
      file.toLowerCase().endsWith('.wav') || 
      file.toLowerCase().endsWith('.m4a') ||
      file.toLowerCase().endsWith('.ogg')
    );

    const stories = audioFiles.map(file => ({
      name: file,
      path: `/assets/uploads/${file}`,
      duration: '2:30',
      summary: `Traditional craft story from ${file.replace(/\.[^/.]+$/, "")}`
    }));

    return NextResponse.json(stories);
  } catch (error) {
    console.error('Error loading stories:', error);
    return NextResponse.json([]);
  }
}
