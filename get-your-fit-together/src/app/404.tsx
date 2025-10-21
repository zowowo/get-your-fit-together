"use client";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-slate-100">404 – Not Found</h1>
      <p className="text-slate-400 mt-2">
        The page you’re looking for doesn’t exist.
      </p>
    </div>
  );
}
