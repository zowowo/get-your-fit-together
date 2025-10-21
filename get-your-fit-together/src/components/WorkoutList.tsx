"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

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
        if (!data) throw new Error("No data returned from workouts query");
        
        // Transform the data to match our types
        const workoutsData = data.map(w => ({
          ...w,
          owner_profile: {
            full_name: w.owner_profile?.full_name ?? null
          }
        }));
        
        setWorkouts(workoutsData);
      } catch (e: unknown) {
        const error = e as Error;
        setErr(error?.message ?? "Failed to load workouts");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
        </div>
      </div>
    );
  if (err)
    return (
      <div className="max-w-3xl mx-auto">
        <div className="p-4 text-red-400 bg-red-950/50 rounded-lg border border-red-800/50">
          {err}
        </div>
      </div>
    );

  if (workouts.length === 0)
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center p-12 rounded-lg border border-slate-800 bg-slate-900/50">
          <p className="text-slate-400">No workouts found</p>
          <Button asChild className="mt-4 bg-cyan-600 hover:bg-cyan-500">
            <Link href="/workouts/new">Create your first workout</Link>
          </Button>
        </div>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {workouts.map((w) => {
        const mine = user?.id === w.owner;
        const ownerName = mine
          ? "My workout"
          : `By ${w.owner_profile?.full_name ?? "Anonymous User"}`;
        return (
          <div
            key={w.id}
            className="flex items-center justify-between p-4 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-medium text-slate-100 truncate">
                  {w.title}
                </h3>
                <Badge
                  variant={w.is_public ? "default" : "secondary"}
                  className="bg-cyan-600 hover:bg-cyan-500"
                >
                  {w.is_public ? "Public" : "Private"}
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mt-1">{ownerName}</p>
              {w.description && (
                <p className="text-sm text-slate-300 mt-2 line-clamp-2">
                  {w.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 ml-4">
              <Button
                variant="ghost"
                asChild
                className="text-slate-300 hover:text-cyan-400 hover:bg-slate-800"
              >
                <Link href={`/workouts/${w.id}`}>View details</Link>
              </Button>
              {mine && (
                <>
                  <Button
                    variant="ghost"
                    asChild
                    className="text-slate-300 hover:text-cyan-400 hover:bg-slate-800"
                  >
                    <Link href={`/workouts/${w.id}/edit`}>Edit</Link>
                  </Button>
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="bg-red-900 hover:bg-red-800 text-slate-200"
          disabled={busy}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-slate-800 border-slate-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-100">
            Delete Workout
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Are you sure you want to delete this workout? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-slate-200">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={busy}
            className="bg-red-900 hover:bg-red-800 text-slate-200"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
        {err && <p className="text-red-400 text-sm mt-2">{err}</p>}
      </AlertDialogContent>
    </AlertDialog>
  );
}
