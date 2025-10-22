"use client";

import { useParams } from "next/navigation";
import ExerciseForm from "@/components/ExerciseForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewExercisePage() {
  const params = useParams<{ id: string }>();
  const workoutId = params?.id;

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
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          Add New Exercise
        </h1>
        <ExerciseForm
          workoutId={workoutId}
          showHeading={false}
          onSuccess={() => {
            // Redirect back to workout details
            window.location.href = `/dashboard/workouts/${workoutId}`;
          }}
        />
      </div>
    </div>
  );
}
