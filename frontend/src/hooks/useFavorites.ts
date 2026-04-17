import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

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
  const { token } = useAuth();
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
      if (!token) {
        setError('Please log in to add favorites');
        return false;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/auth/favorites/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(videoData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add to favorites');
        }

        // Update local state
        const favoriteWithDate: FavoriteVideo = {
          ...videoData,
          addedAt: new Date().toISOString(),
        };
        setFavorites((prev) => [...prev, favoriteWithDate]);
        setError(null);
        return true;
      } catch (err: any) {
        setError(err.message);
        console.error('Error adding to favorites:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const removeFromFavorites = useCallback(
    async (videoId: string) => {
      if (!token) {
        setError('Please log in to manage favorites');
        return false;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/auth/favorites/remove', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ videoId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to remove from favorites');
        }

        // Update local state
        setFavorites((prev) => prev.filter((fav) => fav.videoId !== videoId));
        setError(null);
        return true;
      } catch (err: any) {
        setError(err.message);
        console.error('Error removing from favorites:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const isFavorite = useCallback(
    (videoId: string) => {
      return favorites.some((fav) => fav.videoId === videoId);
    },
    [favorites]
  );

  const checkFavoriteStatus = useCallback(
    async (videoId: string) => {
      if (!token) {
        return false;
      }

      try {
        const response = await fetch(`/api/auth/favorites/check/${videoId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to check favorite status');
        }

        const data = await response.json();
        return data.data.isFavorite;
      } catch (err) {
        console.error('Error checking favorite status:', err);
        return false;
      }
    },
    [token]
  );

  const fetchFavorites = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/auth/favorites', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const data = await response.json();
      setFavorites(data.data.favorites);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

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
