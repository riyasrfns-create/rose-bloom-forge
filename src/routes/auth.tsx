import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Sign In | Flower Industries" },
      { name: "description", content: "Owner access redirect to the admin dashboard." },
      { property: "og:title", content: "Admin Sign In | Flower Industries" },
      { property: "og:description", content: "Owner access redirect to the admin dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/admin" });
  }, [navigate]);

  return null;
}