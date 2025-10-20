import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import { supabase } from './supabaseClient';

export function useFavorite(workoutId: string) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check initial favorite status
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const checkFavorite = async () => {
      try {
        const { data, error } = await supabase
          .from('user_workouts')
          .select('workout_id')
          .eq('user_id', user.id)
          .eq('workout_id', workoutId)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error checking favorite:', error);
        }

        setIsFavorited(!!data);
      } catch (err) {
        console.error('Error checking favorite status:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkFavorite();
  }, [workoutId, user]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async () => {
    if (!user) return;

    // Optimistic update
    setIsFavorited(prev => !prev);

    try {
      if (isFavorited) {
        // Remove favorite
        const { error } = await supabase
          .from('user_workouts')
          .delete()
          .eq('user_id', user.id)
          .eq('workout_id', workoutId);

        if (error) throw error;
      } else {
        // Add favorite
        const { error } = await supabase
          .from('user_workouts')
          .insert({
            user_id: user.id,
            workout_id: workoutId
          });

        if (error) throw error;
      }
    } catch (err) {
      // Revert optimistic update on error
      console.error('Error toggling favorite:', err);
      setIsFavorited(prev => !prev);
    }
  }, [workoutId, user, isFavorited]);

  return {
    isFavorited,
    isLoading,
    toggleFavorite
  };
}