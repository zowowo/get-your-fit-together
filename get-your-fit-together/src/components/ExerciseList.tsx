"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ExerciseForm from "@/components/ExerciseForm";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Trash2 } from "lucide-react";

type Exercise = {
  id: string;
  workout_id: string;
  name: string;
  sets: number | null;
  reps: string | null;
  notes: string | null;
  created_at: string;
};

type Props = {
  workoutId: string;
  canEdit?: boolean; // whether current user can edit exercises
};

export default function ExerciseList({ workoutId, canEdit = false }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [workoutOwnerId, setWorkoutOwnerId] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    const loadExercises = async () => {
      setLoading(true);
      setErr(null);

      try {
        // Get current user
        const { data: user } = await supabase.auth.getUser();
        setUserId(user?.user?.id ?? null);

        // Get workout owner
        const { data: workoutData, error: workoutError } = await supabase
          .from("workouts")
          .select("owner")
          .eq("id", workoutId)
          .single();

        if (workoutError) throw workoutError;
        setWorkoutOwnerId(workoutData?.owner ?? null);

        // Fetch exercises
        const { data, error } = await supabase
          .from("exercises")
          .select("*")
          .eq("workout_id", workoutId)
          .order("created_at", { ascending: true });

        if (error) throw error;

        setExercises(data ?? []);
      } catch (e: unknown) {
        const error = e as Error;
        setErr(error?.message ?? "Failed to load exercises");
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, [workoutId]);

  const handleDelete = async (exerciseId: string) => {
    if (!confirm("Delete this exercise?")) return;

    try {
      const { error } = await supabase
        .from("exercises")
        .delete()
        .eq("id", exerciseId);

      if (error) throw error;

      // Remove from local state
      setExercises(exercises.filter((ex) => ex.id !== exerciseId));
    } catch (e: unknown) {
      const error = e as Error;
      setErr(error?.message ?? "Failed to delete exercise");
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setErr(null);

    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("workout_id", workoutId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setExercises(data ?? []);
    } catch (e: unknown) {
      const error = e as Error;
      setErr(error?.message ?? "Failed to load exercises");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-gray-600">Loading exercises...</div>;
  if (err) return <div className="text-red-600">{err}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Exercises ({exercises.length})</h3>
        {/* {canEdit && (
          <button
            onClick={handleRefresh}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Refresh
          </button>
        )} */}
      </div>

      {exercises.length === 0 ? (
        userId === workoutOwnerId && (
          <div className="text-gray-500 text-center py-8 border rounded-lg">
            No exercises yet. Add one below to get started!
          </div>
        )
      ) : (
        <div className="space-y-3">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-lg">{exercise.name}</h4>

                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    {exercise.sets && <div>Sets: {exercise.sets}</div>}
                    {exercise.reps && <div>Reps: {exercise.reps}</div>}
                    {exercise.notes && (
                      <div className="mt-2">
                        <span className="font-medium">Notes:</span>
                        <p className="whitespace-pre-wrap">{exercise.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {canEdit && (
                  <div className="flex items-center gap-2 ml-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setEditingExercise(exercise)}
                            className="text-indigo-600 hover:text-indigo-700 p-2 rounded hover:bg-indigo-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit exercise</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleDelete(exercise.id)}
                            className="text-red-600 hover:text-red-700 p-2 rounded hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete exercise</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Exercise Modal */}
      {editingExercise && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50"
          onClick={() => setEditingExercise(null)}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Edit {editingExercise.name}
              </h3>
              <button
                onClick={() => setEditingExercise(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <ExerciseForm
              workoutId={editingExercise.workout_id}
              exerciseId={editingExercise.id}
              initialValues={{
                id: editingExercise.id,
                name: editingExercise.name,
                sets: editingExercise.sets,
                reps: editingExercise.reps,
                notes: editingExercise.notes,
              }}
              showHeading={false}
              onSuccess={() => {
                setEditingExercise(null);
                handleRefresh();
              }}
              onCancel={() => setEditingExercise(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
