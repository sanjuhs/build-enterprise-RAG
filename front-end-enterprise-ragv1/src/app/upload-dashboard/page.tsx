// import { auth } from "@/auth";
// import { redirect } from "next/navigation";
// import { Button } from "@/components/ui/button";
import { AuthProvider } from "@/components/providers/auth-provider";
import { NavBar } from "@/components/shared/nav-bar";

export default function UploadDashboardPage() {
  return (
    <AuthProvider requiredRoles={["user", "admin"]}>
      <div className="flex min-h-screen flex-col">
        <NavBar />
        {/* Rest of your page content */}
      </div>
    </AuthProvider>
  );
}
