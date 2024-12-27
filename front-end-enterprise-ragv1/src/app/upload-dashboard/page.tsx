"use client";

import { AuthProvider } from "@/components/providers/auth-provider";
import { NavBar } from "@/components/shared/nav-bar";

export default function UploadDashboardPage() {
  return (
    <AuthProvider requiredRoles={["user", "admin"]}>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="container mx-auto p-6 flex-1">
          {/* Rest of your upload dashboard content */}
        </div>
      </div>
    </AuthProvider>
  );
}
