"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export function NavBar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/rag", label: "Chat" },
    { href: "/upload-dashboard", label: "Upload" },
    { href: "/explore-files", label: "Explore" },
    { href: "/system-monitoring", label: "Monitor" },
  ];

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <div className="font-bold text-xl text-[#012042]">
            super<span className="text-[#028ce5]">RAG</span>
          </div>
          <div className="flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm ${
                  pathname === item.href
                    ? "text-[#028ce5]"
                    : "text-[#012042] hover:text-[#028ce5]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#012042] hover:text-[#028ce5]"
          onClick={() => signOut({ callbackUrl: "/auth" })}
        >
          Logout
        </Button>
      </div>
    </nav>
  );
}
