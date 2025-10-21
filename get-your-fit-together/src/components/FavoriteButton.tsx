"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { toggleFavorite, isWorkoutFavorited } from "@/lib/favorites";
import { handleSupabaseError } from "@/lib/error-handler";

type Props = {
  workoutId: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  onToggle?: (isFavorited: boolean) => void;
};

export default function FavoriteButton({
  workoutId,
  size = "md",
  showText = false,
  onToggle,
}: Props) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load initial favorite status
  useEffect(() => {
    if (!user || !workoutId) return;

    const loadFavoriteStatus = async () => {
      try {
        const favorited = await isWorkoutFavorited(workoutId, user.id);
        setIsFavorited(favorited);
      } catch (error) {
        console.error("Failed to load favorite status:", error);
      } finally {
        setInitialized(true);
      }
    };

    loadFavoriteStatus();
  }, [user, workoutId]);

  const handleToggle = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      const newStatus = await toggleFavorite(workoutId, user.id);
      setIsFavorited(newStatus);
      onToggle?.(newStatus);
    } catch (error) {
      handleSupabaseError(error, "Failed to toggle favorite");
    } finally {
      setLoading(false);
    }
  };

  if (!user || !initialized) {
    return null;
  }

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className={`${
        sizeClasses[size]
      } p-0 text-slate-300 hover:text-red-400 hover:bg-slate-800 transition-colors ${
        isFavorited ? "text-red-400" : "text-slate-300"
      }`}
    >
      <Heart
        className={`${iconSizes[size]} transition-all ${
          isFavorited ? "fill-current" : ""
        }`}
      />
      {showText && (
        <span className="ml-2">
          {isFavorited ? "Favorited" : "Add to Favorites"}
        </span>
      )}
    </Button>
  );
}
