import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthPendingContent } from "@/components/auth/AuthPendingContent";

export default async function AuthPendingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (user.email_confirmed_at) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <AuthPendingContent email={user.email ?? ""} />
    </div>
  );
}
