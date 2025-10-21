import toast from "react-hot-toast";

export function handleSupabaseError(error: unknown, fallbackMessage: string = "An error occurred") {
  const message = (error as Error)?.message || fallbackMessage;
  toast.error(message);
  console.error("Supabase error:", error);
  return message;
}

export function handleSuccess(message: string) {
  toast.success(message);
}

export function handleLoading(message: string) {
  return toast.loading(message);
}
