// src/app/AI_generation/create_your_own/page.tsx
"use client";

import { Loader2 } from "lucide-react";

export default function CreateYourOwnPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-500" />
        <h1 className="text-2xl font-bold">Editor is being upgraded</h1>
        <p className="mt-2 text-gray-400">
          The full canvas editor will be back shortly.
        </p>
      </div>
    </div>
  );
}