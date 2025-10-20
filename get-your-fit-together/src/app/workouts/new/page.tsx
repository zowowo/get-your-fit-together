"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import WorkoutForm from "@/components/WorkoutForm";

export default function NewWorkoutPage() {
  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-4">Create Workout</h1>
        <WorkoutForm />
      </div>
    </ProtectedRoute>
  );
}
