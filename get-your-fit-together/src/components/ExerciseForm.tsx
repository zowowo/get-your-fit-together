"use client";

import { useState } from "react";
import { exerciseSchema, ExerciseInput } from "@/lib/validators";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth-context";

type Props = {
  workoutId: string;
  initialValues?: Partial<ExerciseInput & { id: string }>;
  exerciseId?: string; // present for edit
  onSuccess?: () => void;
};

export default function ExerciseForm({
  workoutId,
  initialValues,
  exerciseId,
  onSuccess,
}: Props) {
  const { user } = useAuth();
  const [values, setValues] = useState<ExerciseInput>({
    name: initialValues?.name ?? "",
    sets: initialValues?.sets ?? null,
    reps: initialValues?.reps ?? "",
    notes: initialValues?.notes ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setValues((v) => ({
      ...v,
      [name]: type === "number" ? (value ? parseInt(value, 10) : null) : value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = exerciseSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Validation failed");
      return;
    }
    if (!user) {
      setError("You must be signed in");
      return;
    }

    setSubmitting(true);
    try {
      if (exerciseId) {
        // Update existing exercise
        const { error } = await supabase
          .from("exercises")
          .update({
            name: values.name,
            sets: values.sets,
            reps: values.reps,
            notes: values.notes,
          })
          .eq("id", exerciseId)
          .select("id")
          .single();
        if (error) throw error;
      } else {
        // Insert new exercise
        const { error } = await supabase
          .from("exercises")
          .insert({
            workout_id: workoutId,
            name: values.name,
            sets: values.sets,
            reps: values.reps,
            notes: values.notes,
          })
          .select("id")
          .single();
        if (error) throw error;
      }

      // Reset form for new exercises
      if (!exerciseId) {
        setValues({
          name: "",
          sets: null,
          reps: "",
          notes: "",
        });
      }

      onSuccess?.();
    } catch (err: unknown) {
      console.error("Exercise save failed:", err);
      const error = err as Error;
      setError(error?.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 p-4 border rounded-lg bg-gray-50"
    >
      <h3 className="text-lg font-medium">
        {exerciseId ? "Edit Exercise" : "Add Exercise"}
      </h3>

      <div>
        <label className="block text-sm font-medium mb-1">Exercise Name</label>
        <input
          name="name"
          value={values.name}
          onChange={onChange}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Sets</label>
          <input
            name="sets"
            type="number"
            min="1"
            value={values.sets ?? ""}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Reps</label>
          <input
            name="reps"
            value={values.reps ?? ""}
            onChange={onChange}
            placeholder="e.g., 8-12, AMRAP"
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          name="notes"
          value={values.notes ?? ""}
          onChange={onChange}
          rows={3}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-indigo-600 text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {submitting
          ? "Saving..."
          : exerciseId
          ? "Update Exercise"
          : "Add Exercise"}
      </button>
    </form>
  );
}

