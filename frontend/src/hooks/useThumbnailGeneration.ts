import { useState, useCallback } from 'react';
import { useClaudeAPI } from './useClaudeAPI';
import { useImageGeneration } from './useImageGeneration';
import { ThumbnailRequest, DesignVariation } from '../types/thumbnail';

export const useThumbnailGeneration = () => {
  const [designs, setDesigns] = useState<DesignVariation[]>([]);
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);
  const { getStrategy, isGeneratingStrategy } = useClaudeAPI();
  const { generate, isGeneratingImage } = useImageGeneration();

  const generateThumbnails = useCallback(async (request: ThumbnailRequest) => {
    // 1. Get Strategy and Prompts from Claude
    const strategyResponse = await getStrategy(request);
    
    if (!strategyResponse || !strategyResponse.designs) {
      console.error('Failed to get strategy');
      return;
    }

    // Set initial pending designs
    const initialDesigns = strategyResponse.designs.map((design) => ({
      ...design,
      status: 'pending' as const,
    }));
    setDesigns(initialDesigns);
    if (initialDesigns.length > 0) {
      setSelectedDesignId(initialDesigns[0].id);
    }

    // 2. Generate Images for each design sequentially (or in parallel depending on rate limits)
    for (const design of initialDesigns) {
      setDesigns((prev) =>
        prev.map((d) => (d.id === design.id ? { ...d, status: 'generating' } : d))
      );

      const imageUrl = await generate(design.imagePrompt);

      setDesigns((prev) =>
        prev.map((d) =>
          d.id === design.id
            ? {
                ...d,
                status: imageUrl ? 'completed' : 'failed',
                imageUrl: imageUrl || undefined,
                error: imageUrl ? undefined : 'Failed to generate image from prompt',
              }
            : d
        )
      );
    }
  }, [getStrategy, generate]);

  const regenerateImage = useCallback(async (designId: string) => {
    const design = designs.find((d) => d.id === designId);
    if (!design) return;

    setDesigns((prev) =>
      prev.map((d) => (d.id === designId ? { ...d, status: 'generating', error: undefined } : d))
    );

    const imageUrl = await generate(design.imagePrompt);

    setDesigns((prev) =>
      prev.map((d) =>
        d.id === designId
          ? {
              ...d,
              status: imageUrl ? 'completed' : 'failed',
              imageUrl: imageUrl || undefined,
              error: imageUrl ? undefined : 'Failed to regenerate image',
            }
          : d
      )
    );
  }, [designs, generate]);

  return {
    designs,
    selectedDesignId,
    setSelectedDesignId,
    isGeneratingStrategy,
    isGeneratingImage,
    generateThumbnails,
    regenerateImage,
  };
};
