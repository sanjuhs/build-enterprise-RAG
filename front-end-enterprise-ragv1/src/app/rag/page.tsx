import { AuthProvider } from "@/components/providers/auth-provider";
import { NavBar } from "@/components/shared/nav-bar";

export default function RAGPage() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <NavBar />
        {/* Rest of your page content */}
      </div>
    </AuthProvider>
  );
}
