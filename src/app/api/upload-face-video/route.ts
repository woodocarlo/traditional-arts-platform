import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

export async function POST(request: Request) {
  let tempFilePath: string | null = null;

  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;

    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // Validate file type
    if (!videoFile.type.startsWith('video/')) {
      return NextResponse.json({ error: 'Invalid file type. Only video files are allowed.' }, { status: 400 });
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (videoFile.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 50MB.' }, { status: 400 });
    }

    // Create temporary file in system temp directory
    const tempDir = os.tmpdir();
    const timestamp = Date.now();
    const fileExtension = path.extname(videoFile.name) || '.webm';
    const fileName = `face-video-${timestamp}${fileExtension}`;
    tempFilePath = path.join(tempDir, fileName);

    // Convert file to buffer and save temporarily
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFileAsync(tempFilePath, buffer);

    // Return success response with temp file path (for internal use)
    return NextResponse.json({
      success: true,
      tempFilePath,
      fileName,
      size: videoFile.size,
      type: videoFile.type
    });

  } catch (error) {
    console.error('Error uploading face video:', error);

    // Clean up temp file if it was created
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        await unlinkAsync(tempFilePath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }

    return NextResponse.json(
      { error: 'Failed to upload video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
