"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorite } from "@/lib/use-favorite";
import { cn } from "@/lib/utils";

type Props = {
  workoutId: string;
  className?: string;
};

export default function FavoriteButton({ workoutId, className }: Props) {
  const { isFavorited, isLoading, toggleFavorite } = useFavorite(workoutId);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "hover:bg-slate-800 transition-colors",
        isFavorited && "text-cyan-400",
        className
      )}
      onClick={toggleFavorite}
      disabled={isLoading}
    >
      <Star
        className={cn(
          "w-5 h-5",
          isFavorited && "fill-current"
        )}
      />
      <span className="sr-only">
        {isFavorited ? "Remove from favorites" : "Add to favorites"}
      </span>
    </Button>
  );
}