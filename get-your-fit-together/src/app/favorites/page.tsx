"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { getUserFavorites, FavoritedWorkout } from "@/lib/favorites";
import { handleSupabaseError } from "@/lib/error-handler";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Heart } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoritedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadFavorites = async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await getUserFavorites(user.id);
        setFavorites(data);
      } catch (error) {
        handleSupabaseError(error, "Failed to load favorites");
        setErr("Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  const handleFavoriteToggle = (workoutId: string, isFavorited: boolean) => {
    if (!isFavorited) {
      // Remove from local state
      setFavorites((prev) => prev.filter((fav) => fav.id !== workoutId));
    }
  };

  if (loading)
    return (
      <ProtectedRoute>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
          </div>
        </div>
      </ProtectedRoute>
    );

  if (err)
    return (
      <ProtectedRoute>
        <div className="max-w-3xl mx-auto">
          <div className="p-4 text-red-400 bg-red-950/50 rounded-lg border border-red-800/50">
            {err}
          </div>
        </div>
      </ProtectedRoute>
    );

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-8 w-8 text-red-400" />
          <h1 className="text-2xl font-semibold">My Favorites</h1>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center p-12 rounded-lg border border-slate-800 bg-slate-900/50">
            <Heart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No favorite workouts yet</p>
            <p className="text-slate-500 text-sm mb-4">
              Start favoriting workouts you like to see them here!
            </p>
            <Button asChild className="bg-cyan-600 hover:bg-cyan-500">
              <Link href="/workouts">Browse Workouts</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((workout) => {
              const mine = user?.id === workout.owner;
              const ownerName = mine
                ? "My workout"
                : `By ${workout.owner_profile?.full_name ?? "Anonymous User"}`;

              return (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-slate-100 truncate">
                        {workout.title}
                      </h3>
                      <Badge
                        variant={workout.is_public ? "default" : "secondary"}
                        className="bg-cyan-600 hover:bg-cyan-500"
                      >
                        {workout.is_public ? "Public" : "Private"}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{ownerName}</p>
                    {workout.description && (
                      <p className="text-sm text-slate-300 mt-2 line-clamp-2">
                        {workout.description}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                      Favorited on{" "}
                      {new Date(workout.favorited_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <FavoriteButton
                      workoutId={workout.id}
                      size="sm"
                      onToggle={(isFavorited) =>
                        handleFavoriteToggle(workout.id, isFavorited)
                      }
                    />
                    <Button
                      variant="ghost"
                      asChild
                      className="text-slate-300 hover:text-cyan-400 hover:bg-slate-800"
                    >
                      <Link href={`/workouts/${workout.id}`}>View details</Link>
                    </Button>
                    {mine && (
                      <Button
                        variant="ghost"
                        asChild
                        className="text-slate-300 hover:text-cyan-400 hover:bg-slate-800"
                      >
                        <Link href={`/workouts/${workout.id}/edit`}>Edit</Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
