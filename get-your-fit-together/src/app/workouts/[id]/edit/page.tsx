"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabaseClient";
import WorkoutForm from "@/components/WorkoutForm";

type Workout = {
  id: string;
  title: string;
  description: string | null;
  difficulty: "easy" | "medium" | "hard" | null;
  is_public?: boolean | null;
};

export default function EditWorkoutPage() {
  const params = useParams<{ id: string }>();
  const workoutId = params?.id;
  const [initial, setInitial] = useState<Partial<Workout> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workoutId) return;
    (async () => {
      setLoading(true);
      setErr(null);
      const { data, error } = await supabase
        .from("workouts")
        .select("id,title,description,difficulty,is_public")
        .eq("id", workoutId)
        .single();
      if (error) setErr(error.message);
      setInitial(data ?? null);
      setLoading(false);
    })();
  }, [workoutId]);

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-4">Edit Workout</h1>
        {loading ? (
          "Loading..."
        ) : err ? (
          <div className="text-red-600">{err}</div>
        ) : (
          <WorkoutForm
            initialValues={{
              ...initial,
              is_public: initial?.is_public ?? false, // normalize null -> false
            }}
            workoutId={workoutId}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
