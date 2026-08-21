import { AuthConfirmedContent } from "@/components/auth/AuthConfirmedContent";
import { Suspense } from "react";

export default function AuthConfirmedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Suspense>
        <AuthConfirmedContent />
      </Suspense>
    </div>
  );
}
