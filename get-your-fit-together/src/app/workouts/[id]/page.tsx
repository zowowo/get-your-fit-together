"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabaseClient";

type Workout = {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  is_public: boolean;
  owner_profile?: { full_name: string | null } | null;
};

export default function WorkoutDetailsPage() {
  const params = useParams<{ id: string }>();
  const workoutId = params?.id;
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
          "id,title,description,difficulty,is_public, owner_profile:profiles!workouts_owner_fkey(full_name)"
        )
        .eq("id", workoutId)
        .single();
      if (error) setErr(error.message);
      setWorkout((data as any) ?? null);
      setLoading(false);
    })();
  }, [workoutId]);

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto p-6 space-y-4">
        <h1 className="text-xl font-semibold">Workout details</h1>
        {loading ? (
          <div>Loading...</div>
        ) : err ? (
          <div className="text-red-600">{err}</div>
        ) : !workout ? (
          <div>Not found</div>
        ) : (
          <div className="border rounded p-4 space-y-2">
            <div className="text-2xl font-bold">{workout.title}</div>
            <div className="text-sm text-gray-600">
              By {workout.owner_profile?.full_name ?? "Unknown user"}{" "}
              {workout.is_public ? "• Public" : "• Private"}
            </div>
            {workout.description && (
              <p className="mt-2 whitespace-pre-wrap">{workout.description}</p>
            )}
            {workout.difficulty && (
              <div className="text-sm">Difficulty: {workout.difficulty}</div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
