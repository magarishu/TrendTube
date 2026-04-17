import { useState, useCallback } from 'react';
import { generateImage } from '../services/imageGenerationService';

export const useImageGeneration = () => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string): Promise<string | null> => {
    setIsGeneratingImage(true);
    setError(null);
    try {
      const imageUrl = await generateImage(prompt);
      return imageUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to generate image');
      return null;
    } finally {
      setIsGeneratingImage(false);
    }
  }, []);

  return { generate, isGeneratingImage, imageError: error };
};
