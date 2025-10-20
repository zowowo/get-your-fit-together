"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

type Workout = {
  id: string;
  owner: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  is_public?: boolean | null;
  owner_profile?: { full_name: string | null } | null; // joined owner profile
};

export default function WorkoutList() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        // Include owner profile name via FK relationship
        const { data, error } = await supabase
          .from("workouts")
          .select(
            "id, owner, title, description, difficulty, is_public, owner_profile:profiles!workouts_owner_fkey(full_name)"
          )
          .order("created_at", { ascending: false });

        if (error) throw error;
        console.log("Workouts data:", data);
        setWorkouts((data as any) ?? []);
      } catch (e: any) {
        setErr(e.message ?? "Failed to load workouts");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (err) return <div className="text-red-600">{err}</div>;

  return (
    <div className="space-y-3">
      {workouts.map((w) => {
        const mine = user?.id === w.owner;
        const ownerName = mine
          ? "My workout"
          : `By ${w.owner_profile?.full_name ?? "Unknown user"}`;
        return (
          <div
            key={w.id}
            className="border rounded p-3 flex items-center justify-between"
          >
            <div>
              <div className="font-semibold">{w.title}</div>
              <div className="text-sm text-gray-600">
                {ownerName} {w.is_public ? "• Public" : "• Private"}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link className="text-indigo-600" href={`/workouts/${w.id}`}>
                View details
              </Link>
              {mine && (
                <>
                  <Link
                    className="text-indigo-600"
                    href={`/workouts/${w.id}/edit`}
                  >
                    Edit
                  </Link>
                  <DeleteButton id={w.id} />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DeleteButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onDelete = async () => {
    if (!confirm("Delete this workout?")) return;
    setBusy(true);
    setErr(null);
    try {
      const { error } = await supabase.from("workouts").delete().eq("id", id);
      if (error) throw error;
      location.reload();
    } catch (e: any) {
      setErr(e.message ?? "Failed to delete");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={onDelete}
        disabled={busy}
        className="text-red-600 disabled:opacity-50"
      >
        {busy ? "Deleting..." : "Delete"}
      </button>
      {err && <span className="text-red-600 text-sm">{err}</span>}
    </>
  );
}
