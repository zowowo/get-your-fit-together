"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#363636",
          color: "#fff",
        },
        success: {
          duration: 3000,
          style: {
            background: "#10B981",
          },
        },
        error: {
          duration: 5000,
          style: {
            background: "#EF4444",
          },
        },
      }}
    />
  );
}
