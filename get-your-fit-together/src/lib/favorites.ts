import { supabase } from './supabaseClient';
import { handleSupabaseError } from './error-handler';

export type Favorite = {
  id: string;
  user_id: string;
  workout_id: string;
  created_at: string;
};

export type FavoritedWorkout = {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  is_public: boolean;
  owner: string;
  created_at: string | null;
  updated_at: string | null;
  owner_profile: { full_name: string | null } | null;
  favorited_at: string;
};


/**
 * Toggle favorite status for a workout
 * If favorited, removes the favorite. If not favorited, adds it.
 */
export async function toggleFavorite(workoutId: string, userId: string): Promise<boolean> {
  try {
    // Check if already favorited
    const { data: existingFavorite, error: checkError } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('workout_id', workoutId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw checkError;
    }

    if (existingFavorite) {
      // Remove favorite
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('workout_id', workoutId);

      if (deleteError) throw deleteError;
      return false; // Now unfavorited
    } else {
      // Add favorite
      const { error: insertError } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          workout_id: workoutId,
        });

      if (insertError) throw insertError;
      return true; // Now favorited
    }
  } catch (error) {
    handleSupabaseError(error, 'Failed to toggle favorite');
    throw error;
  }
}

/**
 * Check if a workout is favorited by a user
 */
export async function isWorkoutFavorited(workoutId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('workout_id', workoutId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }

    return !!data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to check favorite status');
    return false;
  }
}

/**
 * Get all favorited workouts for a user
 */
export async function getUserFavorites(userId: string): Promise<FavoritedWorkout[]> {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        created_at,
        workout:workouts!favorites_workout_id_fkey (
          id,
          title,
          description,
          difficulty,
          is_public,
          owner,
          created_at,
          updated_at,
          owner_profile:profiles!workouts_owner_fkey(full_name)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to match our expected format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((item: any) => ({
      ...item.workout,
      owner_profile: Array.isArray(item.workout.owner_profile)
        ? item.workout.owner_profile[0] || { full_name: null }
        : item.workout.owner_profile ?? { full_name: null },
      favorited_at: item.created_at,
    })) as FavoritedWorkout[];
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch favorites');
    throw error;
  }
}

/**
 * Get favorite status for multiple workouts at once
 */
export async function getWorkoutsFavoriteStatus(
  workoutIds: string[],
  userId: string
): Promise<Record<string, boolean>> {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('workout_id')
      .eq('user_id', userId)
      .in('workout_id', workoutIds);

    if (error) throw error;

    const statusMap: Record<string, boolean> = {};
    workoutIds.forEach(id => {
      statusMap[id] = false;
    });

    data?.forEach(favorite => {
      statusMap[favorite.workout_id] = true;
    });

    return statusMap;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch favorite status');
    return {};
  }
}