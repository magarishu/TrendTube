import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/apiClient';

interface FavoriteVideo {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  views: string;
  duration: string;
  publishedAt: string;
  addedAt?: string;
}

export const useFavorites = () => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToFavorites = useCallback(
    async (videoData: {
      videoId: string;
      title: string;
      channel: string;
      thumbnail: string;
      views: string;
      duration: string;
      publishedAt: string;
    }) => {
      if (!isAuthenticated) {
        setError('Please log in to add favorites');
        return false;
      }

      try {
        setLoading(true);
        await apiClient.favorites.add(videoData);

        // Update local state
        const favoriteWithDate: FavoriteVideo = {
          ...videoData,
          addedAt: new Date().toISOString(),
        };
        setFavorites((prev) => [...prev, favoriteWithDate]);
        setError(null);
        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to add to favorites');
        console.error('Error adding to favorites:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  const removeFromFavorites = useCallback(
    async (videoId: string) => {
      if (!isAuthenticated) {
        setError('Please log in to manage favorites');
        return false;
      }

      try {
        setLoading(true);
        await apiClient.favorites.remove(videoId);

        // Update local state
        setFavorites((prev) => prev.filter((fav) => fav.videoId !== videoId));
        setError(null);
        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to remove from favorites');
        console.error('Error removing from favorites:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  const isFavorite = useCallback(
    (videoId: string) => {
      return favorites.some((fav) => fav.videoId === videoId);
    },
    [favorites]
  );

  const checkFavoriteStatus = useCallback(
    async (videoId: string) => {
      if (!isAuthenticated) {
        return false;
      }

      try {
        const response = await apiClient.favorites.check(videoId);
        return response.data?.isFavorite || false;
      } catch (err) {
        console.error('Error checking favorite status:', err);
        return false;
      }
    },
    [isAuthenticated]
  );

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.favorites.getAll();
      setFavorites(response.data?.favorites || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch favorites');
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    checkFavoriteStatus,
    fetchFavorites,
  };
};
