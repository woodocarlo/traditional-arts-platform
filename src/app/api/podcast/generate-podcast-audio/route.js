// src/app/api/podcast/generate-podcast-audio/route.js
import { NextResponse } from 'next/server';
import { SarvamAIClient } from 'sarvamai';
import wav from 'wav-encoder'; // install: npm install wav-encoder

const SARVAMAI_API_KEY = 'sk_cigvhfng_PJ4EhNTYIUWaqJS9hTZXWtVQ'; // your key

// Silence helper
function generateSilence(durationMs, sampleRate = 22050) {
  const samples = Math.floor((durationMs / 1000) * sampleRate);
  return new Float32Array(samples); // silent PCM
}

async function synthesizeSpeechSarvamAI(client, text, targetLanguageCode, speaker) {
  try {
    console.log(`🔊 SarvamAI SDK call - Speaker: ${speaker}, Language: ${targetLanguageCode}`);
    const response = await client.textToSpeech.convert({
      text,
      target_language_code: targetLanguageCode,
      speaker,
      model: 'bulbul:v2',
      pitch: 1.0,
      pace: 1.0,
      loudness: 1.0,
      speech_sample_rate: 22050,
      enable_preprocessing: true,
    });

    if (response.audios && response.audios.length > 0) {
      // Decode all base64 chunks into Int16 PCM
      const buffers = response.audios.map((b64) => Buffer.from(b64, 'base64'));
      const mergedBuffer = Buffer.concat(buffers);

      const pcm = new Int16Array(mergedBuffer.buffer, mergedBuffer.byteOffset, mergedBuffer.length / 2);
      const float32 = Float32Array.from(pcm, (s) => s / 32768); // normalize to [-1,1]

      console.log(`✅ Audio generated successfully - ${float32.length} samples`);
      return float32;
    } else {
      console.warn('⚠️ No audio data in response');
      return null;
    }
  } catch (error) {
    console.error('❌ Error in synthesizeSpeechSarvamAI:', error);
    return null;
  }
}

export async function POST(request) {
  try {
    console.log('🎯 Podcast audio generation API called');
    const { script, language } = await request.json();

    if (!script || !script.trim()) {
      return NextResponse.json({ error: 'Script is required' }, { status: 400 });
    }

    const client = new SarvamAIClient({ apiSubscriptionKey: SARVAMAI_API_KEY });

    const languageMap = {
      Hindi: 'hi-IN',
      English: 'en-IN',
      Punjabi: 'pa-IN',
      Haryanvi: 'hi-IN',
      Malayalam: 'ml-IN',
      Bengali: 'bn-IN',
      Tamil: 'ta-IN',
      Telugu: 'te-IN',
      Gujarati: 'gu-IN',
      Marathi: 'mr-IN',
    };
    const targetLanguageCode = languageMap[language] || 'en-IN';

    // Parse script into dialogue lines
    const lines = script.split('\n').filter((line) => line.trim());
    let currentSpeaker = null;
    let currentText = '';

    const finalSegments = []; // will hold Float32Array segments

    console.log(`📝 Processing ${lines.length} dialogue lines`);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line.includes(':')) {
        console.warn(`⚠️ Skipping invalid line (no colon): "${line.substring(0, 30)}..."`);
        continue;
      }

      const [speakerPart, ...dialogueParts] = line.split(':');
      let detectedSpeaker = speakerPart.trim().replace(/[\*\_\[\]\(\)]/g, '').toLowerCase();
      const text = dialogueParts.join(':').trim();

      if (!text) {
        console.warn(`⚠️ Skipping empty dialogue for "${detectedSpeaker}"`);
        continue;
      }

      let mappedSpeaker = null;
      if (detectedSpeaker === 'priya') mappedSpeaker = 'anushka';
      else if (detectedSpeaker === 'arjun') mappedSpeaker = 'abhilash';

      if (!mappedSpeaker) {
        console.warn(`⚠️ Unknown speaker "${detectedSpeaker}" - skipping line`);
        continue;
      }

      // Grouping consecutive speaker lines
      if (mappedSpeaker === currentSpeaker) {
        currentText += ' ' + text;
      } else {
        // If previous block exists, synthesize it
        if (currentSpeaker && currentText) {
          console.log(`🎙️ Generating audio for ${currentSpeaker}: "${currentText.substring(0, 50)}..."`);
          const audioPCM = await synthesizeSpeechSarvamAI(client, currentText, targetLanguageCode, currentSpeaker);
          if (audioPCM) {
            finalSegments.push(audioPCM);
            // Add natural pause between speakers
            finalSegments.push(generateSilence(800, 22050));
          }
        }
        // Start new block
        currentSpeaker = mappedSpeaker;
        currentText = text;
      }

      // Handle last line
      if (i === lines.length - 1 && currentText) {
        console.log(`🎙️ Generating audio for ${currentSpeaker}: "${currentText.substring(0, 50)}..."`);
        const audioPCM = await synthesizeSpeechSarvamAI(client, currentText, targetLanguageCode, currentSpeaker);
        if (audioPCM) finalSegments.push(audioPCM);
      }
    }

    if (finalSegments.length === 0) {
      console.error('❌ No audio segments generated');
      return NextResponse.json({ error: 'No valid dialogue found' }, { status: 500 });
    }

    // Merge all Float32 samples into one
    const totalLength = finalSegments.reduce((sum, seg) => sum + seg.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const seg of finalSegments) {
      merged.set(seg, offset);
      offset += seg.length;
    }

  // Encode into valid WAV
const wavArrayBuffer = await wav.encode({
  sampleRate: 22050,
  channelData: [merged], // mono
});

// Convert ArrayBuffer → Node Buffer
const wavBuffer = Buffer.from(wavArrayBuffer);

console.log(`✅ Final podcast audio ready: ${merged.length} samples`);

return new NextResponse(wavBuffer, {
  headers: {
    'Content-Type': 'audio/wav',
    'Content-Length': wavBuffer.byteLength.toString(), // <-- use byteLength
    'Cache-Control': 'no-cache',
  },
});
  } catch (error) {
    console.error('❌ Error generating podcast audio:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
