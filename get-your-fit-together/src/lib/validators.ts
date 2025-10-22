import { z } from "zod";

export const workoutSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().nullable(),
  is_public: z.boolean().optional(),
});

export const exerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  sets: z.number().int().min(1, "Sets must be a positive integer").optional().nullable(),
  reps: z.string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val || val.trim() === "") return true; // Allow empty
      // Check if it's a single number or a range (e.g., "10" or "6-8")
      const singleNumber = /^\d+$/.test(val.trim());
      const range = /^\d+-\d+$/.test(val.trim());
      return singleNumber || range;
    }, "Reps must be a number (e.g., 10) or range (e.g., 6-8)"),
  notes: z.string().optional().nullable(),
});

export type WorkoutInput = z.infer<typeof workoutSchema>;
export type ExerciseInput = z.infer<typeof exerciseSchema>;