"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { handleSupabaseError, handleSuccess } from "@/lib/error-handler";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Edit, Trash2, Eye, Dumbbell } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";

type Workout = {
  id: string;
  owner: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  is_public?: boolean | null;
  owner_profile?: { full_name: string | null } | null;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadUserWorkouts = async () => {
      setLoading(true);
      setErr(null);
      try {
        // Load user's own workouts
        const { data, error } = await supabase
          .from("workouts")
          .select(
            "id, owner, title, description, difficulty, is_public, owner_profile:profiles!workouts_owner_fkey(full_name)"
          )
          .eq("owner", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!data) throw new Error("No data returned from workouts query");

        // Transform the data to match our types
        const workoutsData = data.map((w) => ({
          ...w,
          owner_profile: Array.isArray(w.owner_profile)
            ? w.owner_profile[0] || { full_name: null }
            : w.owner_profile ?? { full_name: null },
        }));

        setWorkouts(workoutsData);
      } catch (e: unknown) {
        const error = e as Error;
        handleSupabaseError(error, "Failed to load workouts");
        setErr(error?.message ?? "Failed to load workouts");
      } finally {
        setLoading(false);
      }
    };

    loadUserWorkouts();
  }, [user]);

  const handleDelete = async (workoutId: string) => {
    try {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", workoutId)
        .eq("owner", user?.id);

      if (error) throw error;

      handleSuccess("Workout deleted successfully!");
      setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
    } catch (error) {
      handleSupabaseError(error, "Failed to delete workout");
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
      <div className="p-4 text-red-400 bg-red-50 rounded-lg border border-red-200">
        {err}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Workouts</h1>
          <p className="text-slate-600 mt-1">
            Manage your personal workout collection
          </p>
        </div>
        <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
          <Link
            href="/dashboard/workouts/new"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Workout
          </Link>
        </Button>
      </div>

      {/* Workouts List */}
      {workouts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <Dumbbell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No workouts yet
          </h3>
          <p className="text-slate-500 mb-6">
            Create your first workout to get started with tracking your fitness
            journey.
          </p>
          <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
            <Link
              href="/dashboard/workouts/new"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Your First Workout
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                  {workout.title}
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

              {workout.description && (
                <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                  {workout.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FavoriteButton workoutId={workout.id} size="sm" />
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/dashboard/workouts/${workout.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/dashboard/workouts/${workout.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <DeleteButton onDelete={() => handleDelete(workout.id)} />
                </div>
              </div>
            </div>
          ))}
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
              <Plus className="h-4 w-4" />
              Create New Workout
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link
              href="/dashboard/favorites"
              className="flex items-center gap-2"
            >
              <Dumbbell className="h-4 w-4" />
              View Favorites
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
    </div>
  );
}

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    setBusy(true);
    try {
      await onDelete();
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          disabled={busy}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Workout</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this workout? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={busy}
            className="bg-red-600 hover:bg-red-700"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
