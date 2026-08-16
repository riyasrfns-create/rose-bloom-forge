import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const title = "Owner Sign In | Flower Industries (Pvt) Ltd";
const description = "Sign in to manage the Flower Industries boutique catalogue and orders.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const field =
  "w-full rounded-sm border border-gold/20 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none transition-colors";

async function getIsAdmin() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userData.user.id);

  return (roles ?? []).some((row) => {
    const role = String((row as { role?: string } | null)?.role ?? "").toLowerCase();
    return role === "admin";
  });
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) return;

      const isAdmin = await getIsAdmin();
      navigate({ to: isAdmin ? "/admin" : "/shop" });
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created. Check your inbox if confirmation is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      const isAdmin = await getIsAdmin();
      navigate({ to: isAdmin ? "/admin" : "/shop" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;

    const isAdmin = await getIsAdmin();
    navigate({ to: isAdmin ? "/admin" : "/shop" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm rounded-sm border border-gold/15 p-8 glass-panel">
        <h1 className="text-3xl">
          Owner <span className="italic gold-text">access</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sign in to add items, prices and view incoming orders.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-3">
          <input name="email" type="email" required placeholder="Email" className={field} />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Password"
            className={field}
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-sm bg-gold px-6 py-3 text-[0.65rem] tracking-[0.3em] uppercase text-accent-foreground disabled:opacity-60"
          >
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          onClick={google}
          className="mt-3 w-full rounded-sm border border-gold/30 px-6 py-3 text-[0.65rem] tracking-[0.3em] uppercase text-gold"
        >
          Continue with Google
        </button>
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 w-full text-[0.65rem] tracking-[0.25em] uppercase text-muted-foreground hover:text-gold"
        >
          {mode === "signin" ? "Need an account?" : "Have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}