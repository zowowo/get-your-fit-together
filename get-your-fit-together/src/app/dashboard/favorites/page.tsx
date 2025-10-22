"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getUserFavorites, FavoritedWorkout } from "@/lib/favorites";
import { handleSupabaseError } from "@/lib/error-handler";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Heart, Eye, Pencil, Dumbbell } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import { Tooltip } from "react-tooltip";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="text-center py-12">
        <div className="p-4 text-red-400 bg-red-50 rounded-lg border border-red-200 max-w-md mx-auto">
          {err}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Heart className="h-8 w-8 text-red-400" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            My Favorite Workouts
          </h1>
          <p className="text-slate-600 mt-1">
            Workouts you&apos;ve saved for later
          </p>
        </div>
      </div>

      {/* Favorites List */}
      {favorites.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <Heart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No favorite workouts yet
          </h3>
          <p className="text-slate-500 mb-6">
            Start liking workouts to see them here!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                Browse My Workouts
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Explore Public Workouts
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((workout) => {
            const mine = user?.id === workout.owner;
            const ownerName = mine
              ? "My workout"
              : `By ${workout.owner_profile?.full_name ?? "Anonymous User"}`;

            return (
              <div
                key={workout.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                    <Link
                      href={`/dashboard/workouts/${workout.id}`}
                      className="hover:underline hover:text-blue-500 transition-colors"
                    >
                      {workout.title}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-2 ml-2">
                    <Badge
                      variant={workout.is_public ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {workout.is_public ? "Public" : "Private"}
                    </Badge>
                    {workout.difficulty && (
                      <Badge
                        variant={
                          workout.difficulty === "hard"
                            ? "destructive"
                            : workout.difficulty === "medium"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {workout.difficulty}
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-2">{ownerName}</p>

                {workout.description && (
                  <p className="text-slate-700 text-sm line-clamp-3 mb-4">
                    {workout.description}
                  </p>
                )}

                {/* <p className="text-xs text-slate-500 mb-4">
                  Favorited on{" "}
                  {new Date(workout.favorited_at).toLocaleDateString()}
                </p> */}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FavoriteButton
                      workoutId={workout.id}
                      size="sm"
                      data-tooltip-id="favorite-tooltip"
                      data-tooltip-content="Favorite"
                      onToggle={(isFavorited) =>
                        handleFavoriteToggle(workout.id, isFavorited)
                      }
                    />
                    {/* <Button asChild size="sm" variant="ghost">
                      <Link href={`/dashboard/workouts/${workout.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button> */}
                    {mine && (
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        data-tooltip-id="edit-tooltip"
                        data-tooltip-content="Edit Workout"
                      >
                        <Link href={`/dashboard/workouts/${workout.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button asChild variant="outline" className="justify-start">
            <Link
              href="/dashboard/workouts/new"
              className="flex items-center gap-2"
            >
              <Dumbbell className="h-4 w-4" />
              Create New Workout
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              My Workouts
            </Link>
          </Button>

          <Button asChild variant="outline" className="justify-start">
            <Link href="/" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Browse Public Workouts
            </Link>
          </Button>
        </div>
      </div>
      <Tooltip id="edit-tooltip" place="top" />
      <Tooltip id="favorite-tooltip" place="top" />
    </div>
  );
}
