"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workoutSchema, WorkoutInput } from "@/lib/validators";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { handleSupabaseError, handleSuccess } from "@/lib/error-handler";

type Props = {
  initialValues?: Partial<WorkoutInput>;
  workoutId?: string; // present for edit
};

export default function WorkoutForm({ initialValues, workoutId }: Props) {
  const { user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<WorkoutInput>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      difficulty: initialValues?.difficulty ?? "medium",
      is_public: initialValues?.is_public ?? false,
    },
  });

  const onSubmit = async (data: WorkoutInput) => {
    if (!user) {
      handleSupabaseError(
        new Error("You must be signed in"),
        "Authentication required"
      );
      return;
    }

    try {
      if (workoutId) {
        // Update existing workout
        const { error } = await supabase
          .from("workouts")
          .update({
            title: data.title,
            description: data.description,
            difficulty: data.difficulty,
            is_public: data.is_public,
            updated_at: new Date().toISOString(),
          })
          .eq("id", workoutId)
          .eq("owner", user.id);

        if (error) throw error;
        handleSuccess("Workout updated successfully!");
        router.push(`/workouts/${workoutId}`);
      } else {
        // Create new workout
        const { error } = await supabase.from("workouts").insert({
          title: data.title,
          description: data.description,
          difficulty: data.difficulty,
          is_public: data.is_public,
          owner: user.id,
        });

        if (error) throw error;
        handleSuccess("Workout created successfully!");
        router.push("/workouts");
      }
    } catch (err: unknown) {
      handleSupabaseError(err, "Failed to save workout");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title *
        </label>
        <input
          {...register("title")}
          type="text"
          id="title"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter workout title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          {...register("description")}
          id="description"
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter workout description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="difficulty"
          className="block text-sm font-medium text-gray-700"
        >
          Difficulty
        </label>
        <select
          {...register("difficulty")}
          id="difficulty"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        {errors.difficulty && (
          <p className="mt-1 text-sm text-red-600">
            {errors.difficulty.message}
          </p>
        )}
      </div>

      <div className="flex items-center">
        <input
          {...register("is_public")}
          type="checkbox"
          id="is_public"
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
          Make this workout public
        </label>
        {errors.is_public && (
          <p className="mt-1 text-sm text-red-600">
            {errors.is_public.message}
          </p>
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
            : workoutId
            ? "Update Workout"
            : "Create Workout"}
        </button>
      </div>
    </form>
  );
}
