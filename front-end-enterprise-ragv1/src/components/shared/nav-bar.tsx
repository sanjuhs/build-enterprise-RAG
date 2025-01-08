"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  // DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "admin";

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      description: "Main Dashboard",
    },
    {
      title: "Chat",
      href: "/rag",
      description: "Chat with your documents using AI",
    },
    {
      title: "Upload",
      href: "/upload-dashboard",
      description: "Upload and manage your documents",
    },
    {
      title: "Explore",
      href: "/explore-files",
      description: "Browse and search through your files",
    },
    ...(isAdmin
      ? [
          {
            title: "Monitor",
            href: "/system-monitoring",
            description: "Monitor system performance and usage",
          },
        ]
      : []),
    {
      title: "Profile",
      href: "/profile",
      description: "Manage your account settings",
    },
    {
      title: "Help",
      href: "/help",
      description: "Get help and documentation",
    },
    {
      title: "Billing",
      href: "/billing",
      description: "Manage your subscription and view usage",
    },
  ];

  // Example notification count - this would come from your notification system
  const notificationCount = 2;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto flex h-12 items-center justify-between px-4 md:px-8">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="gap-2 bg-transparent">
                <div className="flex items-center gap-2">
                  <Image
                    src="/abstract.png"
                    alt="Logo"
                    width={24}
                    height={24}
                    className="rounded-lg"
                  />
                  <span className="text-sm font-semibold">
                    <span className="text-[#012042]">Super</span>
                    <span className="text-gradient">RAG</span>
                  </span>
                  <Menu className="h-4 w-4 ml-1 text-muted-foreground" />
                </div>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={item.href}
                          className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                            pathname === item.href ? "bg-accent" : ""
                          }`}
                        >
                          <div className="text-sm font-medium leading-none">
                            {item.title}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {item.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex flex-col gap-2 p-4">
                <p className="text-sm font-medium">Recent Notifications</p>
                <div className="text-sm text-muted-foreground">
                  <p className="py-2 border-b">
                    New document uploaded: &quot;Project Report.pdf&quot;
                  </p>
                  <p className="py-2">
                    Chat session completed with 5 documents
                  </p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            className="text-[#012042] hover:text-[#028ce5]"
            onClick={() => signOut({ callbackUrl: "/auth" })}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
