import { NextResponse } from 'next/server';

const SARVAMAI_API_KEY = 'sk_cigvhfng_PJ4EhNTYIUWaqJS9hTZXWtVQ';

function generateSilence(durationMs, sampleRate = 22050) {
  const samples = Math.floor((durationMs / 1000) * sampleRate);
  return new Int16Array(samples);
}

async function synthesizeSpeechSarvamAI(text, targetLanguageCode, speaker) {
  try {
    console.log(`🔊 SarvamAI API call - Speaker: ${speaker}, Language: ${targetLanguageCode}`);
    
    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Subscription-Key': SARVAMAI_API_KEY
      },
      body: JSON.stringify({
        text,
        target_language_code: targetLanguageCode,
        speaker,
        model: 'bulbul:v2',
        pitch: 1.0,
        pace: 1.0,
        loudness: 1.0,
        speech_sample_rate: 22050,
        enable_preprocessing: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ SarvamAI error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    
    if (data.audios && data.audios.length > 0) {
      const int16Arrays = data.audios.map(base64Chunk => {
        const buffer = Buffer.from(base64Chunk, 'base64');
        return new Int16Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 2);
      });
      
      const totalLength = int16Arrays.reduce((sum, arr) => sum + arr.length, 0);
      const mergedInt16 = new Int16Array(totalLength);
      let offset = 0;
      for (const chunk of int16Arrays) {
        mergedInt16.set(chunk, offset);
        offset += chunk.length;
      }
      return mergedInt16;
    }
    return null;
  } catch (error) {
    console.error('❌ SarvamAI error:', error);
    return null;
  }
}

function int16ToWav(samples, sampleRate = 22050) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(samples.length * 2, 40);
  
  for (let i = 0; i < samples.length; i++) {
    buffer.writeInt16LE(samples[i], 44 + i * 2);
  }
  
  return buffer;
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Log what we received
    console.log('📥 Received request body keys:', Object.keys(body));
    
    const { script, language, speakerName, type, gender } = body;
    
    // Better error message with what was received
    if (!script || !language || !speakerName) {
      console.error('❌ Missing parameters. Received:', { 
        hasScript: !!script, 
        hasLanguage: !!language, 
        hasSpeakerName: !!speakerName,
        receivedKeys: Object.keys(body)
      });
      return NextResponse.json(
        { 
          error: 'Missing required parameters', 
          required: ['script', 'language', 'speakerName'],
          received: Object.keys(body)
        },
        { status: 400 }
      );
    }

    console.log(`🎤 Generating audio for speaker: ${speakerName}`);

    const lines = script.split('\n').filter(line => line.trim() && line.includes(':'));
    
    const languageMap = {
      'Hindi': 'hi-IN',
      'English': 'en-IN',
      'Punjabi': 'pa-IN',
      'Haryanvi': 'hi-IN',
      'Malayalam': 'ml-IN',
      'Gujarati': 'gu-IN',
      'Marathi': 'mr-IN',
      'Odia': 'or-IN',
      'Tamil': 'ta-IN'
    };

    const targetLanguageCode = languageMap[language] || 'hi-IN';
    const sampleRate = 22050;
    const silenceDuration = 800;
    
    // Determine voice based on speaker name or type
    let speakerVoice = speakerName.toLowerCase() === 'priya' ? 'anushka' : 'abhilash';

    // For face podcasts, use the gender-based voice
    if (type === 'face') {
      speakerVoice = gender === 'male' ? 'abhilash' : 'anushka';
    }
    
    const allAudioSegments = [];
    let totalDialogues = 0;
    let successfulAudio = 0;

    for (const line of lines) {
      const [speakerPart, ...dialogueParts] = line.split(':');
      const detectedSpeaker = speakerPart.trim().toLowerCase();
      const dialogue = dialogueParts.join(':').trim();

      if (!dialogue) continue;
      totalDialogues++;

      if (detectedSpeaker === speakerName.toLowerCase()) {
        // This speaker's dialogue - generate audio
        console.log(`Generating audio for ${speakerName}: ${dialogue.substring(0, 50)}...`);
        const audioData = await synthesizeSpeechSarvamAI(
          dialogue,
          targetLanguageCode,
          speakerVoice
        );

        if (audioData && audioData.length > 0) {
          allAudioSegments.push(audioData);
          successfulAudio++;
          allAudioSegments.push(generateSilence(silenceDuration, sampleRate));
        } else {
          console.warn(`⚠️ No audio generated for dialogue, adding estimated silence`);
          const estimatedDurationMs = (dialogue.length / 2.5 / 150) * 60 * 1000;
          allAudioSegments.push(generateSilence(estimatedDurationMs, sampleRate));
          allAudioSegments.push(generateSilence(silenceDuration, sampleRate));
        }
      } else {
        // Other speaker's dialogue - add silence
        const estimatedDurationMs = (dialogue.length / 2.5 / 150) * 60 * 1000;
        console.log(`Adding silence for other speaker: ${estimatedDurationMs}ms`);
        allAudioSegments.push(generateSilence(estimatedDurationMs, sampleRate));
        allAudioSegments.push(generateSilence(silenceDuration, sampleRate));
      }
    }

    console.log(`✅ Processed ${totalDialogues} dialogues, generated ${successfulAudio} audio segments`);

    if (allAudioSegments.length === 0) {
      return NextResponse.json(
        { error: 'No audio generated - no audio segments created' },
        { status: 500 }
      );
    }

    // Merge all segments
    const totalLength = allAudioSegments.reduce((sum, seg) => sum + seg.length, 0);
    const finalAudio = new Int16Array(totalLength);
    let offset = 0;
    for (const segment of allAudioSegments) {
      finalAudio.set(segment, offset);
      offset += segment.length;
    }

    // Convert to WAV
    const wavBuffer = int16ToWav(finalAudio, sampleRate);
    const base64Audio = wavBuffer.toString('base64');

    console.log(`✅ Final audio: ${finalAudio.length} samples, ${base64Audio.length} base64 bytes`);

    return NextResponse.json({
      success: true,
      audioData: base64Audio,
      speaker: speakerName
    });

  } catch (error) {
    console.error('❌ Error generating speaker audio:', error);
    return NextResponse.json(
      { error: 'Failed to generate speaker audio', details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
