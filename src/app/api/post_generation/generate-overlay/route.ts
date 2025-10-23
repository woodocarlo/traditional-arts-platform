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

    // Create prompt for overlay
    let prompt = `Generate a subtle overlay texture or pattern that adds depth and interest to a traditional craft social media post. The overlay should be semi-transparent and complementary. Description: ${description}`;

    if (postType === 'Shop Drop') {
      prompt = `Generate an elegant, subtle overlay with luxurious textures or patterns that enhance the presentation of fine crafts. Description: ${description}`;
    } else if (postType === 'Unfold the Tale') {
      prompt = `Generate a creative overlay with artistic textures that evoke storytelling and tradition. Description: ${description}`;
    } else if (postType === 'Art Spotlight') {
      prompt = `Generate a professional overlay with clean patterns that complement sales-focused presentations. Description: ${description}`;
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

    // If image is provided, add it as a reference image for overlay generation
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
      requestBody.parameters.referenceStrength = 0.2; // Very low strength for subtle overlays
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
      return NextResponse.json({ image: `data:image/png;base64,${base64Image}` });
    } else {
      throw new Error('No image generated');
    }
  } catch (error) {
    console.error('Error generating overlay:', error);
    return NextResponse.json({ error: 'Failed to generate overlay' }, { status: 500 });
  }
}
