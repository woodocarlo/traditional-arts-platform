import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

const LIPSYNC_API_URL = 'https://lipsync-api-819115636598.asia-southeast1.run.app/process';

export async function POST(request) {
  let tempAudioPath = null;
  
  try {
    const { faceVideoPath, audioData, speaker } = await request.json();
    
    if (!faceVideoPath || !audioData || !speaker) {
      return NextResponse.json(
        { error: 'Missing required parameters: faceVideoPath, audioData, speaker' },
        { status: 400 }
      );
    }

    console.log(`🎬 Calling hosted lip sync API for ${speaker}...`);
    console.log(`📹 Video path: ${faceVideoPath}`);
    console.log(`🔊 Audio data size: ${audioData.length} bytes (data URL)`);

    // Verify video file exists
    if (!fs.existsSync(faceVideoPath)) {
      throw new Error(`Video file not found: ${faceVideoPath}`);
    }

    // Get video file size
    const videoStats = fs.statSync(faceVideoPath);
    console.log(`📊 Video file size: ${videoStats.size} bytes`);

    // Convert base64 audio to buffer (handle data URL format)
    const base64Data = audioData.includes(',') ? audioData.split(',')[1] : audioData;
    const audioBuffer = Buffer.from(base64Data, 'base64');
    console.log(`📊 Audio buffer size: ${audioBuffer.length} bytes`);
    
    // Create temp directory
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Save audio to temp file
    tempAudioPath = path.join(tempDir, `audio-${speaker}-${Date.now()}.wav`);
    fs.writeFileSync(tempAudioPath, audioBuffer);
    console.log(`✅ Audio file saved: ${tempAudioPath} (${fs.statSync(tempAudioPath).size} bytes)`);

    // Create FormData
    const form = new FormData();
    form.append('video', fs.createReadStream(faceVideoPath), {
      filename: 'input.mp4',
      contentType: 'video/mp4'
    });
    form.append('audio', fs.createReadStream(tempAudioPath), {
      filename: 'audio.wav',
      contentType: 'audio/wav'
    });

    console.log(`📤 Uploading to lip sync API: ${LIPSYNC_API_URL}`);

    // Call the hosted lip sync API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 900000); // 15 min timeout

    const response = await fetch(LIPSYNC_API_URL, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorText = '';
      
      if (contentType && contentType.includes('application/json')) {
        const errorJson = await response.json();
        errorText = JSON.stringify(errorJson);
      } else {
        errorText = await response.text();
      }
      
      console.error(`❌ API returned error: ${errorText}`);
      throw new Error(`Lip sync API error: ${response.status} ${response.statusText} - ${errorText || 'No error details provided'}`);
    }

    console.log(`📥 Receiving processed video from API...`);

    // Get the video buffer from response
    const videoBuffer = await response.buffer();
    
    if (!videoBuffer || videoBuffer.length === 0) {
      throw new Error('Received empty video buffer from API');
    }
    
    const base64Video = videoBuffer.toString('base64');
    
    console.log(`✅ Lip sync video received: ${videoBuffer.length} bytes (${base64Video.length} base64)`);

    // Clean up temp files
    if (tempAudioPath && fs.existsSync(tempAudioPath)) {
      try {
        fs.unlinkSync(tempAudioPath);
        console.log('✅ Temp audio file cleaned up');
      } catch (cleanupError) {
        console.warn('⚠️ Could not clean up temp file:', cleanupError);
      }
    }

    return NextResponse.json({
      success: true,
      videoData: base64Video,
      speaker,
      size: videoBuffer.length
    });

  } catch (error) {
    console.error('❌ Error in lip sync generation:', error);
    
    // Clean up on error
    if (tempAudioPath && fs.existsSync(tempAudioPath)) {
      try {
        fs.unlinkSync(tempAudioPath);
      } catch (cleanupError) {
        console.warn('⚠️ Could not clean up temp file:', cleanupError);
      }
    }

    // Provide more detailed error message
    const errorMessage = error.message || 'Unknown error';
    const isTimeout = errorMessage.includes('aborted');
    
    return NextResponse.json(
      { 
        error: 'Failed to generate lip sync', 
        details: isTimeout ? 'Request timed out after 15 minutes. Video might be too long.' : errorMessage 
      },
      { status: 500 }
    );
  }
}
