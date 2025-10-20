"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import WorkoutList from "@/components/WorkoutList";

export default function WorkoutsPage() {
  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Workouts</h1>
          <Link
            href="/workouts/new"
            className="text-white bg-indigo-600 px-3 py-2 rounded"
          >
            New Workout
          </Link>
        </div>
        <WorkoutList />
      </div>
    </ProtectedRoute>
  );
}
