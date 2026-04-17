export interface ThumbnailRequest {
  title: string;
  category: string;
  audience: string;
  summary: string;
  style: string;
  primaryColor: string;
  secondaryColor: string;
  includeText: string;
  focusElements: {
    face: boolean;
    text: boolean;
    product: boolean;
    numbers: boolean;
  };
  referenceImageUrl?: string;
}

export interface DesignVariation {
  id: string;
  conceptName: string;
  layoutDescription: string;
  colorSchemeRationale: string;
  keyVisualElements: string[];
  typographySpecs: string;
  psychologicalAppeal: string;
  imagePrompt: string;
  expectedCtrImpact: string;
  imageUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  error?: string;
}

export interface ClaudeStrategyResponse {
  designs: DesignVariation[];
  trendAnalysis: {
    currentTrends: string[];
    colorPsychology: string;
    overallStrategy: string;
  };
}
