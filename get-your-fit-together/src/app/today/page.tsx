"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/ProtectedRoute";
import { handleSupabaseError } from "@/lib/error-handler";
import { Loader2 } from "lucide-react";
import Link from "next/link";

type Exercise = {
  id: string;
  name: string;
  sets: number | null;
  reps: string | null;
  notes: string | null;
  created_at: string;
  workouts: {
    id: string;
    title: string;
    created_at: string;
  };
};

export default function TodayPage() {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecentExercises = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        // Get recent exercises from the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data, error: fetchError } = await supabase
          .from("exercises")
          .select(
            `
            id,
            name,
            sets,
            reps,
            notes,
            created_at,
            workouts!inner(
              id,
              title,
              created_at
            )
          `
          )
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(20);

        if (fetchError) throw fetchError;

        const exercises = (data || []).map((item: unknown) => {
          const exercise = item as {
            id: string;
            name: string;
            sets: number | null;
            reps: string | null;
            notes: string | null;
            created_at: string;
            workouts:
              | { id: string; title: string; created_at: string }[]
              | { id: string; title: string; created_at: string };
          };
          return {
            id: exercise.id,
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            notes: exercise.notes,
            created_at: exercise.created_at,
            workouts: Array.isArray(exercise.workouts)
              ? exercise.workouts[0]
              : exercise.workouts,
          };
        });
        setExercises(exercises);
      } catch (err: unknown) {
        handleSupabaseError(err, "Failed to load recent exercises");
        setError((err as Error)?.message ?? "Failed to load exercises");
      } finally {
        setLoading(false);
      }
    };

    loadRecentExercises();
  }, [user]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-semibold mb-6">Today&apos;s Workout</h1>
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="ml-2 text-gray-600">
              Loading recent exercises...
            </span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-semibold mb-6">Today&apos;s Workout</h1>
          <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
            {error}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">Today&apos;s Workout</h1>

        {exercises.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              No recent exercises found
            </div>
            <p className="text-gray-400 mb-6">
              Start by creating a workout and adding some exercises!
            </p>
            <Link
              href="/workouts/new"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Your First Workout
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-medium text-blue-900 mb-2">
                Recent Exercises (Last 7 Days)
              </h2>
              <p className="text-blue-700 text-sm">
                Here are your recent exercises to help you plan today&apos;s
                workout.
              </p>
            </div>

            <div className="grid gap-4">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{exercise.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        From: {exercise.workouts.title}
                      </p>

                      <div className="flex gap-4 text-sm text-gray-600">
                        {exercise.sets && <span>Sets: {exercise.sets}</span>}
                        {exercise.reps && <span>Reps: {exercise.reps}</span>}
                        <span>
                          Added:{" "}
                          {new Date(exercise.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {exercise.notes && (
                        <div className="mt-2">
                          <span className="font-medium text-sm">Notes:</span>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {exercise.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/workouts/${exercise.workouts.id}`}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      View Workout
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-6">
              <Link
                href="/workouts"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View All Workouts →
              </Link>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
