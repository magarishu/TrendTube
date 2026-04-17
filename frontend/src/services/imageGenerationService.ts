import axios from 'axios';

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const response = await axios.post(`${API_URL}/thumbnails/generate-image`, { prompt });
    
    if (response.data && response.data.imageUrl) {
      return response.data.imageUrl;
    }
    throw new Error('Image URL missing in response');
  } catch (err) {
    console.error('Failed to generate image via backend', err);
    throw new Error('Image generation failed.');
  }
};
