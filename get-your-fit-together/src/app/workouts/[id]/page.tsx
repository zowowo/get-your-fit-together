"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth-context";
import ExerciseList from "@/components/ExerciseList";
import ExerciseForm from "@/components/ExerciseForm";
import FavoriteButton from "@/components/FavoriteButton";
import { Button } from "@/components/ui/button";

type Workout = {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  is_public: boolean;
  owner: string;
  owner_profile?: { full_name: string | null } | null;
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
      setWorkout((data as any) ?? null);
      setLoading(false);
    })();
  }, [workoutId]);

  const canEdit = user?.id === workout?.owner;

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Workout Details</h1>

        {loading ? (
          <div>Loading...</div>
        ) : err ? (
          <div className="text-red-600">{err}</div>
        ) : !workout ? (
          <div>Workout not found</div>
        ) : (
          <>
            {/* Workout Info */}
            <div className="border rounded-lg p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">{workout.title}</h2>
                  <div className="text-sm text-slate-400 mt-1">
                    By {workout.owner_profile?.full_name ?? "Unknown user"}{" "}
                    {workout.is_public ? "• Public" : "• Private"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {user && <FavoriteButton workoutId={workout.id} />}
                  {canEdit && (
                    <Button asChild variant="default" className="bg-cyan-600 hover:bg-cyan-500">
                      <Link href={`/workouts/${workout.id}/edit`}>
                        Edit Workout
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              {workout.description && (
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="whitespace-pre-wrap text-gray-700">
                    {workout.description}
                  </p>
                </div>
              )}

              {workout.difficulty && (
                <div>
                  <h3 className="font-medium mb-2">Difficulty</h3>
                  <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {workout.difficulty}
                  </span>
                </div>
              )}
            </div>

            {/* Exercises Section */}
            <div className="space-y-4">
              <ExerciseList workoutId={workoutId} canEdit={canEdit} />

              {canEdit && (
                <ExerciseForm
                  workoutId={workoutId}
                  onSuccess={() => {
                    // Trigger refresh of exercise list
                    window.location.reload();
                  }}
                />
              )}
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
