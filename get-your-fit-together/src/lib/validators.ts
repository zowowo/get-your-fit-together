import { z } from "zod";

export const workoutSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().nullable(),
  is_public: z.boolean().optional(),
});

export type WorkoutInput = z.infer<typeof workoutSchema>;