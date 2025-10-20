"use client";

import { useState } from "react";
import { z } from "zod";
import { workoutSchema, WorkoutInput } from "@/lib/validators";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

type Props = {
  initialValues?: Partial<WorkoutInput>;
  workoutId?: string; // present for edit
};

export default function WorkoutForm({ initialValues, workoutId }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [values, setValues] = useState<WorkoutInput>({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    difficulty: (initialValues?.difficulty as any) ?? "medium",
    is_public: initialValues?.is_public ?? false,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as any;
    setValues((v) => ({ ...v, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = workoutSchema.safeParse(values);
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
      const timeLabel = `saveWorkout:${Date.now()}`;
      console.time(timeLabel);

      console.log("Checking profile…");
      const { data: existingProfile, error: profileSelectErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      if (profileSelectErr) throw profileSelectErr;

      if (!existingProfile) {
        console.log("Upserting profile…");
        const { error: profileUpsertErr } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            full_name: user.user_metadata?.full_name ?? null,
            avatar_url: user.user_metadata?.avatar_url ?? null,
          })
          .select("id")
          .single(); // forces RLS errors to return
        if (profileUpsertErr) throw profileUpsertErr;
      }

      if (workoutId) {
        console.log("Updating workout…");
        const { error } = await supabase
          .from("workouts")
          .update({
            title: values.title,
            description: values.description,
            difficulty: values.difficulty,
            is_public: values.is_public,
          })
          .eq("id", workoutId)
          .select("id")
          .single(); // force error surfacing
        if (error) throw error;
      } else {
        console.log("Inserting workout…");
        const { error } = await supabase
          .from("workouts")
          .insert({
            owner: user.id,
            title: values.title,
            description: values.description,
            difficulty: values.difficulty,
            is_public: values.is_public,
          })
          .select("id")
          .single(); // force error surfacing
        if (error) throw error;
      }

      console.timeEnd(timeLabel);
      router.push("/workouts");
      router.refresh();
    } catch (err: any) {
      console.error("Workout save failed:", err);
      setError(err?.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          name="title"
          value={values.title}
          onChange={onChange}
          className="mt-1 w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          value={values.description ?? ""}
          onChange={onChange}
          className="mt-1 w-full border rounded px-3 py-2"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Difficulty</label>
        <select
          name="difficulty"
          value={values.difficulty ?? "medium"}
          onChange={onChange}
          className="mt-1 w-full border rounded px-3 py-2"
        >
          <option value="easy">easy</option>
          <option value="medium">medium</option>
          <option value="hard">hard</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="is_public"
          name="is_public"
          type="checkbox"
          checked={!!values.is_public}
          onChange={onChange}
        />
        <label htmlFor="is_public" className="text-sm">
          Public
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-indigo-600 text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {submitting
          ? "Saving..."
          : workoutId
          ? "Update Workout"
          : "Create Workout"}
      </button>
    </form>
  );
}
