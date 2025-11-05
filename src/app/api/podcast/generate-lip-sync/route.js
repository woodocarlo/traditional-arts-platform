import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { Buffer } from 'buffer';
import path from 'path';
import os from 'os';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

// Configure ffmpeg
// FIX: Removed 'as string' which is TypeScript syntax
ffmpeg.setFfmpegPath(ffmpegStatic);

// SarvamAI API Key (move to .env file)
const SARVAMAI_API_KEY = 'sk_cigvhfng_PJ4EhNTYIUWaqJS9hTZXWtVQ';

/**
 * Creates a valid WAV file buffer from raw PCM audio data.
 */
function addWavHeader(pcmBuffer, sampleRate = 22050) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const fileSize = 36 + dataSize; 

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(fileSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Sub-chunk 1 size
  header.writeUInt16LE(1, 20);  // Audio format (1 for PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

/**
 * Generates a single audio track for the entire script.
 */
async function generateCombinedAudio(script, language, gender) {
  try {
    console.log(`[LipSync API] Generating combined audio for script...`);
    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Subscription-Key': SARVAMAI_API_KEY
      },
      body: JSON.stringify({
        text: script,
        target_language_code: language,
        speaker: gender === 'male' ? 'abhilash' : 'anushka',
        model: 'bulbul:v2',
        speech_sample_rate: 22050,
        enable_preprocessing: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SarvamAI audio generation failed: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();

    if (!data.audios || data.audios.length === 0) {
      throw new Error('SarvamAI returned no audio data');
    }

    const pcmBuffers = data.audios.map((b64Chunk) =>
      Buffer.from(b64Chunk, 'base64')
    );

    const mergedPcmBuffer = Buffer.concat(pcmBuffers);
    const wavBuffer = addWavHeader(mergedPcmBuffer, 22050);

    console.log(`[LipSync API] Generated valid WAV file: ${wavBuffer.length} bytes`);
    return wavBuffer.toString('base64');

  } catch (error) {
    console.error('❌ Error in generateCombinedAudio:', error);
    throw error;
  }
}

/**
 * Converts a video file to MP4 using ffmpeg.
 */
function convertToMp4(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    console.log(`[LipSync API] Converting ${inputPath} to ${outputPath}...`);
    ffmpeg(inputPath)
      .outputOptions([
        '-vcodec', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-acodec', 'aac',
        '-strict', '-2'
      ])
      .output(outputPath)
      .on('end', () => {
        console.log('[LipSync API] Conversion finished.');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('[LipSync API] FFmpeg conversion error:', err);
        reject(err);
      })
      .run();
  });
}

/**
 * Main API Route
 */
export async function POST(request) {
  const lipSyncApiUrl = 'https://lipsync-api-819115636598.asia-southeast1.run.app/process';
  
  let tempVideoPath_In = null;
  let tempVideoPath_Out = null;
  let tempAudioPath = null;

  try {
    // 1. Get FormData from frontend
    const formData = await request.formData();

    // FIX: Removed 'as string' and 'as File' casts
    const script = formData.get('script');
    const language = formData.get('language');
    const gender = formData.get('gender');
    const videoFile = formData.get('video');

    // Added type checking in plain JS
    if (typeof script !== 'string' || !script) {
      return NextResponse.json({ error: 'Missing or invalid "script"' }, { status: 400 });
    }
    if (typeof language !== 'string' || !language) {
      return NextResponse.json({ error: 'Missing or invalid "language"' }, { status: 400 });
    }
    if (typeof gender !== 'string' || !gender) {
      return NextResponse.json({ error: 'Missing or invalid "gender"' }, { status: 400 });
    }
    if (!(videoFile instanceof File)) {
      return NextResponse.json({ error: 'Missing or invalid "video" file' }, { status: 400 });
    }
    // --- End of checking block ---

    const languageMap = { 'Hindi': 'hi-IN', 'English': 'en-IN', 'Punjabi': 'pa-IN', 'Haryanvi': 'hi-IN', 'Malayalam': 'ml-IN', 'Gujarati': 'gu-IN', 'Marathi': 'mr-IN', 'Odia': 'or-IN', 'Tamil': 'ta-IN' };
    const targetLanguageCode = languageMap[language] || 'hi-IN';

    // 2. Save uploaded video to a temp file
    const tempDir = os.tmpdir();
    const videoFileExt = path.extname(videoFile.name) || '.webm';
    tempVideoPath_In = path.join(tempDir, `face-video-in-${Date.now()}${videoFileExt}`);
    
    const videoBytes = await videoFile.arrayBuffer();
    const videoBuffer = Buffer.from(videoBytes);
    await fs.writeFile(tempVideoPath_In, videoBuffer);
    console.log(`[LipSync API] Saved video to temp path: ${tempVideoPath_In}`);

    // 3. Generate the combined audio
    const audioBase64 = await generateCombinedAudio(script, targetLanguageCode, gender);
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    
    tempAudioPath = path.join(tempDir, `audio-out-${Date.now()}.wav`);
    await fs.writeFile(tempAudioPath, audioBuffer);
    console.log(`[LipSync API] Saved audio to temp path: ${tempAudioPath}`);

    // 4. Convert video to .mp4 if it's not already
    let finalMp4Path = tempVideoPath_In;
    if (videoFileExt !== '.mp4') {
      tempVideoPath_Out = path.join(tempDir, `face-video-out-${Date.now()}.mp4`);
      await convertToMp4(tempVideoPath_In, tempVideoPath_Out);
      finalMp4Path = tempVideoPath_Out;
    }

    // 5. Call the external lip-sync API
    const externalFormData = new FormData();
    externalFormData.append('video', new Blob([await fs.readFile(finalMp4Path)]), 'video.mp4');
    externalFormData.append('audio', new Blob([await fs.readFile(tempAudioPath)]), 'audio.wav');
    
    console.log('[LipSync API] Sending data to external model...');
    
    const response = await fetch(lipSyncApiUrl, {
      method: 'POST',
      body: externalFormData,
      signal: AbortSignal.timeout(3600 * 1000), 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[LipSync API] External API Error:', errorText);
      throw new Error(`External lip-sync model failed: ${response.status} ${errorText}`);
    }

    // 6. Get result and send back to frontend
    const videoBlob = await response.blob();
    const videoArrayBuffer = await videoBlob.arrayBuffer();
    const videoBase64 = Buffer.from(videoArrayBuffer).toString('base64');

    console.log('[LipSync API] Job complete. Returning video and audio data.');

    return NextResponse.json({
      success: true,
      videoData: videoBase64,
      audioData: audioBase64, 
    });

  } catch (error) {
    console.error('❌ Error in /api/podcast/generate-lip-sync:', error);
    return NextResponse.json(
      // FIX: Removed 'as Error' cast
      { error: 'Failed to generate lip sync', details: error.message },
      { status: 500 }
    );
  } finally {
    // 7. Cleanup ALL temp files
    try {
      if (tempVideoPath_In) await fs.unlink(tempVideoPath_In);
      if (tempVideoPath_Out) await fs.unlink(tempVideoPath_Out);
      if (tempAudioPath) await fs.unlink(tempAudioPath);
      console.log('[LipSync API] All temp files cleaned up.');
    } catch (cleanupError) {
      console.error('[LipSync API] Error cleaning up temp files:', cleanupError);
    }
  }
}