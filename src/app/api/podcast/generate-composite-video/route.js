import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { participantVideoBase64, combinedAudioBase64 } = await request.json();
    
    console.log('🎬 Composite video API called (pass-through mode)');
    
    if (!participantVideoBase64 || !combinedAudioBase64) {
      return NextResponse.json(
        { error: 'Missing video or audio data' },
        { status: 400 }
      );
    }

    // Since we're handling composition in the frontend with CSS/Canvas,
    // we just pass the data through without processing
    console.log('✅ Returning participant video and audio for frontend composition');

    return NextResponse.json({
      success: true,
      participantVideo: participantVideoBase64,
      combinedAudio: combinedAudioBase64
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}
