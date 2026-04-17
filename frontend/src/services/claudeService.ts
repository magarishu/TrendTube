import axios from 'axios';
import { ThumbnailRequest, ClaudeStrategyResponse } from '../types/thumbnail';

export const generateThumbnailStrategy = async (
  request: ThumbnailRequest
): Promise<ClaudeStrategyResponse> => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const response = await axios.post(`${API_URL}/thumbnails/designs`, request);
    
    // Transform backend variations to matching interface
    const variations = response.data.variations || [];
    
    return {
      designs: variations.map((v: any) => ({
        id: v.variationNumber?.toString() || Math.random().toString(),
        conceptName: v.name,
        layoutDescription: v.layoutComposition,
        colorSchemeRationale: v.colorScheme ? `${v.colorScheme.background} with ${v.colorScheme.primaryAccent}` : '',
        keyVisualElements: v.visualElements ? v.visualElements.map((e: any) => e.element) : [],
        typographySpecs: v.typography ? `${v.typography.fontFamily} - ${v.typography.mainText}` : '',
        psychologicalAppeal: v.concept,
        imagePrompt: v.imageGenerationPrompt,
        expectedCtrImpact: v.performancePrediction ? v.performancePrediction.estimatedCTRImprovement : '+10%',
        status: 'pending' as const
      })),
      trendAnalysis: {
        currentTrends: ['Dynamic Generation', 'Custom Context'],
        colorPsychology: 'Analyzed specifically for your channel',
        overallStrategy: 'Generated via Claude Opus'
      }
    };
  } catch (err) {
    console.error('Failed to generate designs via backend', err);
    throw new Error('Could not reach backend thumbnail design generator.');
  }
};
