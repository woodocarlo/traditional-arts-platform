import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

export async function POST(request) {
  let tempVideoPath = null;
  let tempAudioPath = null;
  let outputVideoPath = null;

  try {
    const { faceVideoPath, audioData, speaker } = await request.json();

    if (!faceVideoPath || !audioData || !speaker) {
      return NextResponse.json({
        error: 'Missing required parameters: faceVideoPath, audioData, speaker'
      }, { status: 400 });
    }

    // Create temp directory for processing
    const tempDir = path.join(os.tmpdir(), `lip-sync-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    // Save audio data to temp file
    const audioBuffer = Buffer.from(audioData, 'base64');
    tempAudioPath = path.join(tempDir, `audio-${speaker}.wav`);
    fs.writeFileSync(tempAudioPath, audioBuffer);

    // Copy face video to temp directory
    tempVideoPath = path.join(tempDir, `face-${speaker}.webm`);
    fs.copyFileSync(faceVideoPath, tempVideoPath);

    // Output path for lip-synced video
    outputVideoPath = path.join(tempDir, `output-${speaker}.mp4`);

    // Call lip sync processing (placeholder - replace with actual lip sync command)
    // This assumes you have a lip sync tool available
    const lipSyncCommand = `python lip_sync.py --video "${tempVideoPath}" --audio "${tempAudioPath}" --output "${outputVideoPath}"`;

    try {
      await execAsync(lipSyncCommand, { cwd: process.cwd() });
    } catch (error) {
      console.error('Lip sync processing failed:', error);
      // For now, just copy the original video as output
      fs.copyFileSync(tempVideoPath, outputVideoPath);
    }

    // Read the output video
    const outputVideoBuffer = fs.readFileSync(outputVideoPath);
    const base64Video = outputVideoBuffer.toString('base64');

    // Clean up temp files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Error cleaning up temp files:', cleanupError);
    }

    return NextResponse.json({
      success: true,
      videoData: base64Video,
      speaker
    });

  } catch (error) {
    console.error('Error in lip sync generation:', error);

    // Clean up temp files on error
    try {
      if (tempVideoPath && fs.existsSync(path.dirname(tempVideoPath))) {
        fs.rmSync(path.dirname(tempVideoPath), { recursive: true, force: true });
      }
    } catch (cleanupError) {
      console.error('Error cleaning up temp files:', cleanupError);
    }

    return NextResponse.json({
      error: 'Failed to generate lip sync',
      details: error.message
    }, { status: 500 });
  }
}
