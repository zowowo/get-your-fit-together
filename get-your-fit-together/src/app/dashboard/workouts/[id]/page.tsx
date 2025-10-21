"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth-context";
import ExerciseList from "@/components/ExerciseList";
import ExerciseForm from "@/components/ExerciseForm";
import FavoriteButton from "@/components/FavoriteButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import Link from "next/link";

type Workout = {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  is_public: boolean;
  owner: string;
  owner_profile: { full_name: string | null };
};

export default function WorkoutDetailsPage() {
  const params = useParams<{ id: string }>();
  const workoutId = params?.id;
  const { user } = useAuth();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workoutId) return;
    (async () => {
      setLoading(true);
      setErr(null);
      const { data, error } = await supabase
        .from("workouts")
        .select(
          "id,title,description,difficulty,is_public,owner, owner_profile:profiles!workouts_owner_fkey(full_name)"
        )
        .eq("id", workoutId)
        .single();
      if (error) setErr(error.message);
      if (data) {
        const workoutData = data as {
          id: string;
          title: string;
          description: string | null;
          difficulty: string | null;
          is_public: boolean;
          owner: string;
          owner_profile: { full_name: string | null }[] | null;
        };
        const workout: Workout = {
          id: workoutData.id,
          title: workoutData.title,
          description: workoutData.description,
          difficulty: workoutData.difficulty,
          is_public: workoutData.is_public,
          owner: workoutData.owner,
          owner_profile: {
            full_name: workoutData.owner_profile?.[0]?.full_name ?? null,
          },
        };
        setWorkout(workout);
      } else {
        setWorkout(null);
      }
      setLoading(false);
    })();
  }, [workoutId]);

  const canEdit = user?.id === workout?.owner;

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
        <Button asChild className="mt-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Workout not found
        </h2>
        <p className="text-slate-600 mb-6">
          The workout you&apos;re looking for doesn&apos;t exist or has been
          deleted.
        </p>
        <Button asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <FavoriteButton workoutId={workout.id} size="md" showText={true} />
          {canEdit && (
            <Button asChild>
              <Link
                href={`/dashboard/workouts/${workout.id}/edit`}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Workout
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Workout Info */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {workout.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>
                By {workout.owner_profile?.full_name ?? "Anonymous User"}
              </span>
              <div className="flex items-center gap-2">
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
          </div>
        </div>

        {workout.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Description
            </h3>
            <p className="text-slate-700 whitespace-pre-wrap">
              {workout.description}
            </p>
          </div>
        )}
      </div>

      {/* Exercises Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Exercises</h2>
          {canEdit && (
            <Button asChild>
              <Link href={`/dashboard/workouts/${workout.id}/exercises/new`}>
                Add Exercise
              </Link>
            </Button>
          )}
        </div>

        <ExerciseList workoutId={workoutId} canEdit={canEdit} />

        {canEdit && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Add New Exercise
            </h3>
            <ExerciseForm
              workoutId={workoutId}
              onSuccess={() => {
                // Trigger refresh of exercise list
                window.location.reload();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
