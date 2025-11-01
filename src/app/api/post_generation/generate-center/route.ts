import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface VertexAIRequestBody {
  instances: Array<{
    prompt: string;
    referenceImages?: Array<{
      referenceImage: {
        bytesBase64Encoded: string;
      };
      referenceId: number;
      referenceType: string;
    }>;
  }>;
  parameters: {
    sampleCount: number;
    aspectRatio: string;
    safetyFilterLevel: string;
    personGeneration: string;
    referenceStrength?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { postType, description, aspectRatio, image } = await request.json();

    // Read the service account key
    const keyPath = path.join(process.cwd(), 'src/app/AI_generation/post_generation/genexchange-471318-49dd82f14931.json');
    const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    // Authenticate
    const auth = new GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    // Determine aspect ratio for Vertex AI
    let vertexAspectRatio = '3:4'; // default
    if (aspectRatio === '1:1') vertexAspectRatio = '1:1';
    else if (aspectRatio === '9:16') vertexAspectRatio = '9:16';

    // Create prompt for center image
    let prompt = `Generate a decorative center element or focal point suitable for a traditional craft social media post. The element should be elegant and complementary to craftsmanship. Description: ${description}`;

    if (postType === 'general') {
      prompt = `Generate an image based on the following description: ${description}`;
    } else if (postType === 'Shop Drop') {
      prompt = `Generate an elegant decorative element that highlights fine craft details, like ornate borders or artistic motifs. Description: ${description}`;
    } else if (postType === 'Unfold the Tale') {
      prompt = `Generate a creative, story-inspired decorative element that evokes tradition and craftsmanship. Description: ${description}`;
    } else if (postType === 'Art Spotlight') {
      prompt = `Generate a professional decorative element that complements sales-focused craft presentations. Description: ${description}`;
    }

    // Prepare the request body for Vertex AI Imagen
    const requestBody: VertexAIRequestBody = {
      instances: [
        {
          prompt: prompt,
        },
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: vertexAspectRatio,
        safetyFilterLevel: 'block_some',
        personGeneration: 'allow_adult',
      },
    };

    // If image is provided, add it as a reference image for center element generation
    if (image) {
      requestBody.instances[0].referenceImages = [
        {
          referenceImage: {
            bytesBase64Encoded: image.split(',')[1], // Remove data:image/png;base64, prefix
          },
          referenceId: 0,
          referenceType: 'STYLE',
        },
      ];
      requestBody.parameters.referenceStrength = 0.3; // Lower strength for decorative elements
    }

    // Call Vertex AI Imagen using the correct model and parameters
    const response = await axios.post(
      `https://us-central1-aiplatform.googleapis.com/v1/projects/${key.project_id}/locations/us-central1/publishers/google/models/imagegeneration@006:predict`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.predictions && response.data.predictions[0] && response.data.predictions[0].bytesBase64Encoded) {
      const base64Image = response.data.predictions[0].bytesBase64Encoded;

      // Generate caption using Gemini
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=AIzaSyAtVimUosOHmBfhINtzJcQHuOQqqDyk7FU`,
        {
          contents: [
            {
              parts: [
                {
                  text: 'Generate a suitable caption for this social media post image about traditional crafts. Make it engaging and relevant to the image.',
                },
                {
                  inline_data: {
                    mime_type: 'image/png',
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      let caption = '';
      if (
        geminiResponse.data &&
        geminiResponse.data.candidates &&
        geminiResponse.data.candidates[0] &&
        geminiResponse.data.candidates[0].content &&
        geminiResponse.data.candidates[0].content.parts &&
        geminiResponse.data.candidates[0].content.parts[0]
      ) {
        caption = geminiResponse.data.candidates[0].content.parts[0].text;
      }

      return NextResponse.json({ image: `data:image/png;base64,${base64Image}`, caption });
    } else {
      throw new Error('No image generated');
    }
  } catch (error) {
    console.error('Error generating center image:', error);
    return NextResponse.json({ error: 'Failed to generate center image' }, { status: 500 });
  }
}
