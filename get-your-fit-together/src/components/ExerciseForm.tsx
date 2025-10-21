"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { exerciseSchema, ExerciseInput } from "@/lib/validators";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth-context";
import { handleSupabaseError, handleSuccess } from "@/lib/error-handler";

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ExerciseInput>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      sets: initialValues?.sets ?? null,
      reps: initialValues?.reps ?? "",
      notes: initialValues?.notes ?? "",
    },
  });

  const onSubmit = async (data: ExerciseInput) => {
    if (!user) {
      handleSupabaseError(
        new Error("You must be signed in"),
        "Authentication required"
      );
      return;
    }

    try {
      if (exerciseId) {
        // Update existing exercise
        const { error } = await supabase
          .from("exercises")
          .update({
            name: data.name,
            sets: data.sets,
            reps: data.reps,
            notes: data.notes,
          })
          .eq("id", exerciseId)
          .eq("workout_id", workoutId);

        if (error) throw error;
        handleSuccess("Exercise updated successfully!");
      } else {
        // Create new exercise
        const { error } = await supabase.from("exercises").insert({
          name: data.name,
          sets: data.sets,
          reps: data.reps,
          notes: data.notes,
          workout_id: workoutId,
        });

        if (error) throw error;
        handleSuccess("Exercise added successfully!");
      }

      reset();
      onSuccess?.();
    } catch (err: unknown) {
      handleSupabaseError(err, "Failed to save exercise");
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="text-lg font-medium mb-4">
        {exerciseId ? "Edit Exercise" : "Add Exercise"}
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Exercise Name *
          </label>
          <input
            {...register("name")}
            type="text"
            id="name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter exercise name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="sets"
              className="block text-sm font-medium text-gray-700"
            >
              Sets
            </label>
            <input
              {...register("sets", { valueAsNumber: true })}
              type="number"
              id="sets"
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Number of sets"
            />
            {errors.sets && (
              <p className="mt-1 text-sm text-red-600">{errors.sets.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="reps"
              className="block text-sm font-medium text-gray-700"
            >
              Reps
            </label>
            <input
              {...register("reps")}
              type="text"
              id="reps"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., 10-12, 8-10"
            />
            {errors.reps && (
              <p className="mt-1 text-sm text-red-600">{errors.reps.message}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700"
          >
            Notes
          </label>
          <textarea
            {...register("notes")}
            id="notes"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Additional notes or instructions"
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Saving..."
              : exerciseId
              ? "Update Exercise"
              : "Add Exercise"}
          </button>
        </div>
      </form>
    </div>
  );
}
