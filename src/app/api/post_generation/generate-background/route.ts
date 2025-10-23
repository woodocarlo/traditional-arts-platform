import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

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

    // Create prompt based on postType and description
    let prompt = '';
    if (postType === 'Shop Drop') {
      prompt = `Generate an elegant, sophisticated background suitable for showcasing fine craft details. The background should be minimalist and luxurious, complementing traditional craftsmanship. Description: ${description}`;
    } else if (postType === 'Unfold the Tale') {
      prompt = `Generate an inspiring, story-like background that evokes creativity and tradition. The background should have a warm, narrative feel suitable for sharing artisan stories. Description: ${description}`;
    } else if (postType === 'Art Spotlight') {
      prompt = `Generate a professional, spotlight-style background perfect for sales-focused craft posts. The background should be clean and modern with a call-to-action feel. Description: ${description}`;
    } else {
      prompt = `Generate a beautiful background for a traditional craft social media post. Description: ${description}`;
    }

    // Prepare the request body for Vertex AI Imagen
    const requestBody: any = {
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

    // If image is provided, add it as a reference image for background generation
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
      requestBody.parameters.referenceStrength = 0.5; // Adjust strength as needed
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

    console.log('Vertex AI Response:', response.data); // Debug log

    if (response.data.predictions && response.data.predictions[0] && response.data.predictions[0].bytesBase64Encoded) {
      const base64Image = response.data.predictions[0].bytesBase64Encoded;
      return NextResponse.json({ image: `data:image/png;base64,${base64Image}` });
    } else {
      throw new Error('No image generated');
    }
  } catch (error) {
    console.error('Error generating background:', error);
    return NextResponse.json({ error: 'Failed to generate background' }, { status: 500 });
  }
}
