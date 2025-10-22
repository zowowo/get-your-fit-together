"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabaseClient";
import { handleSupabaseError, handleSuccess } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Mail, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

type Profile = {
  id: string;
  full_name: string | null;
  created_at: string | null;
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setProfile(data);
        reset({
          full_name: data?.full_name || "",
        });
      } catch (error) {
        handleSupabaseError(error, "Failed to load profile");
        setErr("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setSaving(true);
    setErr(null);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: data.full_name,
      });

      if (error) throw error;

      handleSuccess("Profile updated successfully!");

      // Reload profile data
      const { data: updatedProfile, error: reloadError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (reloadError) throw reloadError;
      setProfile(updatedProfile);
    } catch (error) {
      handleSupabaseError(error, "Failed to update profile");
      setErr("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <User className="h-8 w-8 text-cyan-600" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
          <p className="text-slate-600 mt-1">
            Manage your personal information
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-slate-700"
            >
              Email Address
            </Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-slate-50 text-slate-500"
              />
            </div>
            <p className="text-xs text-slate-500">
              Email cannot be changed. Contact support if you need to update
              your email.
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label
              htmlFor="full_name"
              className="text-sm font-medium text-slate-700"
            >
              Full Name *
            </Label>
            <Input
              id="full_name"
              {...register("full_name")}
              placeholder="Enter your full name"
              className={errors.full_name ? "border-red-300" : ""}
            />
            {errors.full_name && (
              <p className="text-sm text-red-600">{errors.full_name.message}</p>
            )}
          </div>

          {/* Error Message */}
          {err && (
            <div className="p-4 text-red-400 bg-red-50 rounded-lg border border-red-200">
              {err}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Profile Info */}
      {profile && (
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Profile Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-slate-600">Member since:</span>
              <p className="text-slate-900">
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
            <div>
              <span className="font-medium text-slate-600">Profile ID:</span>
              <p className="text-slate-900 font-mono text-xs">{profile.id}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
