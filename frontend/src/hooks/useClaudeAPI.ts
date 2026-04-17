import { useState, useCallback } from 'react';
import { generateThumbnailStrategy } from '../services/claudeService';
import { ThumbnailRequest, ClaudeStrategyResponse } from '../types/thumbnail';

export const useClaudeAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStrategy = useCallback(async (request: ThumbnailRequest): Promise<ClaudeStrategyResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await generateThumbnailStrategy(request);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to generate strategy');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { getStrategy, isGeneratingStrategy: isLoading, strategyError: error };
};
