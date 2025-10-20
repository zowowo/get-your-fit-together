"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth-context";

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
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const loadExercises = async () => {
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
      } catch (e: any) {
        setErr(e.message ?? "Failed to load exercises");
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
    } catch (e: any) {
      setErr(e.message ?? "Failed to delete exercise");
    }
  };

  const handleRefresh = () => {
    // Trigger reload by updating workoutId dependency
    setLoading(true);
    setErr(null);
    supabase
      .from("exercises")
      .select("*")
      .eq("workout_id", workoutId)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) throw error;
        setExercises(data ?? []);
      })
      .catch((e: any) => {
        setErr(e.message ?? "Failed to load exercises");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) return <div className="text-gray-600">Loading exercises...</div>;
  if (err) return <div className="text-red-600">{err}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Exercises ({exercises.length})</h3>
        {canEdit && (
          <button
            onClick={handleRefresh}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Refresh
          </button>
        )}
      </div>

      {exercises.length === 0 ? (
        <div className="text-gray-500 text-center py-8 border rounded-lg">
          No exercises yet. Add one below to get started!
        </div>
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
                    <EditExerciseButton
                      exercise={exercise}
                      onSuccess={handleRefresh}
                    />
                    <button
                      onClick={() => handleDelete(exercise.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Edit button component
function EditExerciseButton({
  exercise,
  onSuccess,
}: {
  exercise: Exercise;
  onSuccess: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="space-y-2">
        <ExerciseForm
          workoutId={exercise.workout_id}
          exerciseId={exercise.id}
          initialValues={{
            id: exercise.id,
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            notes: exercise.notes,
          }}
          onSuccess={() => {
            setIsEditing(false);
            onSuccess();
          }}
        />
        <button
          onClick={() => setIsEditing(false)}
          className="text-sm text-gray-600 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="text-indigo-600 hover:text-indigo-700 text-sm"
    >
      Edit
    </button>
  );
}
