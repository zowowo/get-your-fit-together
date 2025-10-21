"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Dumbbell, LogIn, UserPlus } from "lucide-react";
import { handleSupabaseError } from "@/lib/error-handler";

type PublicWorkout = {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  owner: string;
  owner_profile: { full_name: string | null } | null;
};

export default function HomePage() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<PublicWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const loadPublicWorkouts = async () => {
      setLoading(true);
      setErr(null);
      try {
        // Only fetch public workouts
        const { data, error } = await supabase
          .from("workouts")
          .select(
            "id, title, description, difficulty, owner, owner_profile:profiles!workouts_owner_fkey(full_name)"
          )
          .eq("is_public", true)
          .order("created_at", { ascending: false })
          .limit(12); // Limit to 12 for performance

        if (error) throw error;
        if (!data) throw new Error("No data returned from workouts query");

        // Transform the data to match our types
        const workoutsData = data.map((w) => ({
          ...w,
          owner_profile: Array.isArray(w.owner_profile)
            ? w.owner_profile[0] || { full_name: null }
            : w.owner_profile ?? { full_name: null },
        }));

        setWorkouts(workoutsData);
      } catch (e: unknown) {
        const error = e as Error;
        handleSupabaseError(error, "Failed to load public workouts");
        setErr(error?.message ?? "Failed to load workouts");
      } finally {
        setLoading(false);
      }
    };

    loadPublicWorkouts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Dumbbell className="h-16 w-16 mx-auto mb-6 text-cyan-200" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Get Your Fit Together
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-cyan-100">
              Track your workouts and stay consistent with your fitness journey
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-cyan-600 hover:bg-cyan-50"
                >
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-cyan-600 hover:bg-cyan-50"
                  >
                    <Link href="/login" className="flex items-center gap-2">
                      <LogIn className="h-5 w-5" />
                      Log In
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="bg-white text-cyan-600 hover:bg-cyan-50"
                  >
                    <Link href="/signup" className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Public Workouts Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Explore Public Workouts
          </h2>
          <p className="text-lg text-slate-600">
            Discover workouts shared by our community
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
          </div>
        ) : err ? (
          <div className="text-center py-12">
            <div className="p-4 text-red-400 bg-red-50 rounded-lg border border-red-200 max-w-md mx-auto">
              {err}
            </div>
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">
              No public workouts available yet
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Be the first to share a workout with the community!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                    {workout.title}
                  </h3>
                  {workout.difficulty && (
                    <Badge
                      variant={
                        workout.difficulty === "hard"
                          ? "destructive"
                          : workout.difficulty === "medium"
                          ? "default"
                          : "secondary"
                      }
                      className="ml-2 flex-shrink-0"
                    >
                      {workout.difficulty}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-slate-600 mb-4">
                  By {workout.owner_profile?.full_name ?? "Anonymous User"}
                </p>

                {workout.description && (
                  <p className="text-slate-700 text-sm line-clamp-3 mb-4">
                    {workout.description}
                  </p>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Public Workout</span>
                  {user ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/workouts/${workout.id}`}>
                        View Details
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="outline">
                      <Link href="/login">Log In to View</Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {!user && (
          <div className="text-center mt-16 bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Ready to start your fitness journey?
            </h3>
            <p className="text-slate-600 mb-6">
              Create your own workouts, track your progress, and connect with
              our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <Link href="/signup" className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Get Started Free
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login" className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Already have an account?
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
