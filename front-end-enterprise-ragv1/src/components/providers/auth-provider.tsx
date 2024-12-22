"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { hasRequiredRole } from "@/auth";

interface AuthProviderProps {
  children: React.ReactNode;
  requiredRoles: ("guest" | "user" | "admin")[];
}

export function AuthProvider({ children, requiredRoles }: AuthProviderProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || !hasRequiredRole(session, requiredRoles)) {
    redirect("/auth");
  }

  return <>{children}</>;
}
