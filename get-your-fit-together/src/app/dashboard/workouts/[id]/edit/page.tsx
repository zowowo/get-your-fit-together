"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import WorkoutForm from "@/components/WorkoutForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="text-center py-12">
        <div className="p-4 text-red-400 bg-red-50 rounded-lg border border-red-200 max-w-md mx-auto">
          {err}
        </div>
        <Button asChild className="mt-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link
            href={`/dashboard/workouts/${workoutId}`}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Workout
          </Link>
        </Button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit Workout</h1>
        <WorkoutForm
          initialValues={{
            ...initial,
            is_public: initial?.is_public ?? false, // normalize null -> false
          }}
          workoutId={workoutId}
        />
      </div>
    </div>
  );
}
