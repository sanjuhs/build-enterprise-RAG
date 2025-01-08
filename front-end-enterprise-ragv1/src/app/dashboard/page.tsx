"use client";

import { AuthProvider } from "@/components/providers/auth-provider";
import { NavBar } from "@/components/shared/nav-bar";

export default function Dashboard() {
  return (
    <AuthProvider requiredRoles={["guest", "user", "admin"]}>
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Main Tools Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">
              Main Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DashboardCard
                title="Upload Dashboard"
                description="Upload and manage your documents and files"
                href="/upload-dashboard"
                icon="📤"
              />
              <DashboardCard
                title="RAG Chat"
                description="Interactive chat with your documents using RAG technology"
                href="/rag"
                icon="💬"
              />
              <DashboardCard
                title="Help Center"
                description="Get help and learn how to use our tools"
                href="/help"
                icon="❓"
              />
            </div>
          </section>

          {/* Experimental Features Section */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">
              Experimental Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DashboardCard
                title="HTML to Slide"
                description="Convert HTML content to beautiful presentation slides"
                href="/exp/htmltoslide"
                icon="🎯"
                experimental
              />
              {/* Add more experimental features here */}
            </div>
          </section>
        </main>
      </div>
    </AuthProvider>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  experimental?: boolean;
}

function DashboardCard({
  title,
  description,
  href,
  icon,
  experimental,
}: DashboardCardProps) {
  return (
    <div
      className={`
      p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow
      border-l-4 ${experimental ? "border-purple-500" : "border-blue-500"}
    `}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="flex items-center justify-between">
        <a
          href={href}
          className={`
            inline-flex items-center gap-2
            ${
              experimental
                ? "text-purple-500 hover:text-purple-600"
                : "text-blue-500 hover:text-blue-600"
            }
          `}
        >
          Launch{" "}
          {experimental && (
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
              Experimental
            </span>
          )}
          <span className="transform transition-transform group-hover:translate-x-1">
            →
          </span>
        </a>
      </div>
    </div>
  );
}
