import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
export default async function SystemMonitoringPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="font-bold text-xl text-[#012042]">
            super<span className="text-[#028ce5]">RAG</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#012042] hover:text-[#028ce5]"
          >
            Logout
          </Button>
        </div>
      </nav>
      <main className="flex-1 container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">System Monitoring Dashboard</h1>
        {/* Add your monitoring dashboard content here */}
      </main>
    </div>
  );
}
