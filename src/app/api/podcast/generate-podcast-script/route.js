import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = "AIzaSyCoaNv8rp-UVQ3uqio5VD9dIAZQsPR5ok4";

export async function POST(request) {
  if (!GEMINI_API_KEY) {
    console.error('💥 Missing GEMINI_API_KEY environment variable.');
    return NextResponse.json(
      { error: 'Server configuration error: Missing API key.' },
      { status: 500 }
    );
  }

  try {
    const { topic, customQuestions, uploadedStories, length, language, hostName, artistName, type } = await request.json();
    
    console.log('🔍 Request received with data:', {
      topic,
      length,
      language,
      hostName,
      artistName,
      type,
      customQuestionsCount: customQuestions?.length || 0,
      uploadedStoriesCount: uploadedStories?.length || 0
    });

    // Duration guide - SHORTER for face videos
    let durationGuide = '';
    if (type === 'face') {
      // Shorter durations for face/storytelling videos
      if (length === 'short') durationGuide = '1-2 minutes';
      else if (length === 'medium') durationGuide = '3-4 minutes';
      else durationGuide = '5-6 minutes';
    } else {
      // Regular podcast durations
      if (length === 'short') durationGuide = '3-5 minutes';
      else if (length === 'medium') durationGuide = '8-12 minutes';
      else durationGuide = '15-20 minutes';
    }

    let customQuestionsText = '';
    if (customQuestions && customQuestions.length > 0) {
      customQuestionsText = `\n\nThe host should ask these specific questions during the interview:\n${customQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
    }

    let storiesContext = '';
    if (uploadedStories && uploadedStories.length > 0) {
      storiesContext = `\n\nThe artist has shared these stories that should be incorporated naturally into the podcast:\n${uploadedStories.join('\n\n')}`;
    }

    let prompt = '';
    
    if (type === 'face') {
      // Single person storytelling/monologue for face videos
      prompt = 'You are a storytelling script writer. Create a CONCISE ' + length + ' narrative script (approximately ' + durationGuide + ') in ' + language + ' language about "' + topic + '".\n\n' +
      'Speaker name: ' + artistName + storiesContext + '\n\n' +
      'IMPORTANT:\n' +
      '- Keep it SHORT and FOCUSED (approximately ' + durationGuide + ')\n' +
      '- Write as a single-person narrative/story directly to the audience\n' +
      '- Format each line as: "' + artistName + ': What they say"\n' +
      '- Make it engaging, personal, and conversational\n' +
      '- NO long-winded explanations\n' +
      '- Get to the point quickly\n' +
      '- Warm tone appropriate for Indian audience\n\n' +
      'Example format:\n' +
      artistName + ': Hello everyone! Today I want to share something special about ' + topic + '.\n' +
      artistName + ': Let me tell you a quick story about this...\n\n' +
      'Return ONLY the monologue in this format. NO JSON, NO markdown, NO code blocks. Just the speech with "Name: dialogue" format. Keep it BRIEF!';
      
    } else {
      // Dialogue for audio-only podcasts
      prompt = 'You are a podcast script writer. Create a ' + length + ' podcast script (approximately ' + durationGuide + ') in ' + language + ' language about "' + topic + '".\n\n' +
      'Host name: ' + hostName + '\n' +
      'Artist/Guest name: ' + artistName + customQuestionsText + storiesContext + '\n\n' +
      'IMPORTANT FORMAT INSTRUCTIONS:\n' +
      '- Write the script as a natural conversation between ' + hostName + ' and ' + artistName + '\n' +
      '- Format each line as: "SpeakerName: What they say"\n' +
      '- Use EXACTLY these names: ' + hostName + ' and ' + artistName + '\n' +
      '- Include natural back-and-forth dialogue\n' +
      '- Have a warm, conversational tone appropriate for Indian audience\n' +
      '- Include smooth transitions between topics\n\n' +
      'Example format:\n' +
      hostName + ': Welcome to the show! Today we are talking about ' + topic + '.\n' +
      artistName + ': Thank you for having me! I am excited to discuss this.\n' +
      hostName + ': So tell me, what inspired you?\n\n' +
      'Return ONLY the dialogue in this format. NO JSON, NO markdown, NO code blocks. Just the conversation with "Name: dialogue" format.';
    }

    console.log('🚀 Making API call to Google Gemini with model: gemini-2.0-flash-exp');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini response received');

    let scriptText = text.trim();
    
    // Remove markdown code blocks if present
    if (scriptText.startsWith('```')) {
      scriptText = scriptText.replace(/^```[a-z]*\n?/i, '');
      if (scriptText.endsWith('```')) {
        scriptText = scriptText.slice(0, -3).trim();
      }
    }

    console.log('📝 Script generated successfully');
    
    return NextResponse.json({
      script: scriptText,
      title: topic,
      type: type
    });

  } catch (error) {
    console.error('❌ Error generating podcast script:', error);
    return NextResponse.json(
      { error: 'Failed to generate podcast script', details: error.message },
      { status: 500 }
    );
  }
}
