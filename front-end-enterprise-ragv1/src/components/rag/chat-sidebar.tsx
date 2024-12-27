import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Settings, User, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

interface ChatSidebarProps {
  isExpanded: boolean;
}

export function ChatSidebar({ isExpanded }: ChatSidebarProps) {
  const { data: session } = useSession();

  const navItems = [
    { label: "Chat", href: "/rag" },
    { label: "Upload", href: "/upload-dashboard" },
    { label: "Explore Files", href: "/explore-files" },
    { label: "System Monitor", href: "/system-monitoring" },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth" });
  };

  return (
    <div className="flex flex-col h-full text-sm">
      <div className="p-4 mb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full justify-between ${
                isExpanded ? "px-2" : "px-0"
              }`}
            >
              <h1
                className={`font-bold ${
                  isExpanded ? "text-xl" : "text-xs"
                } flex items-center gap-2`}
              >
                {isExpanded ? (
                  <>
                    <span className="text-[#012042]">Super</span>
                    <span className="text-gradient">RAG</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </>
                ) : (
                  <span className="text-gradient">SR</span>
                )}
              </h1>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {navItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href}>{item.label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isExpanded && (
        <div className="px-4">
          <Button className="w-full justify-start" variant="secondary">
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 p-2">
          <Button
            variant="ghost"
            className={`w-full ${
              isExpanded ? "justify-start" : "justify-center p-2"
            }`}
          >
            {isExpanded ? "Previous Chat 1" : "•"}
          </Button>
          <Button
            variant="ghost"
            className={`w-full ${
              isExpanded ? "justify-start" : "justify-center p-2"
            }`}
          >
            {isExpanded ? "Previous Chat 2" : "•"}
          </Button>
        </div>
      </ScrollArea>

      <div className="border-t mt-auto p-4 dark:border-gray-700">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full ${
                isExpanded ? "justify-start" : "justify-center p-2"
              }`}
            >
              <User className="h-4 w-4" />
              {isExpanded && (
                <>
                  <span className="ml-2 truncate">
                    {session?.user?.name || session?.user?.email || "Guest"}
                  </span>
                  <Settings className="ml-auto h-4 w-4" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile & Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/help">Help Center</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
