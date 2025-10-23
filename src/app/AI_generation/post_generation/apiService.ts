import axios from "axios";

export interface GenerateImageParams {
  postType: string;
  description: string;
  aspectRatio: string;
  image?: string;
}

export const generateBackground = async (params: GenerateImageParams): Promise<string> => {
  try {
    const response = await axios.post('/api/post_generation/generate-background', params);
    return response.data.image;
  } catch (error) {
    console.error('Error generating background:', error);
    throw new Error('Failed to generate background');
  }
};

export const generateCenter = async (params: GenerateImageParams): Promise<string> => {
  try {
    const response = await axios.post('/api/post_generation/generate-center', params);
    return response.data.image;
  } catch (error) {
    console.error('Error generating center image:', error);
    throw new Error('Failed to generate center image');
  }
};

export const generateOverlay = async (params: GenerateImageParams): Promise<string> => {
  try {
    const response = await axios.post('/api/post_generation/generate-overlay', params);
    return response.data.image;
  } catch (error) {
    console.error('Error generating overlay:', error);
    throw new Error('Failed to generate overlay');
  }
};
