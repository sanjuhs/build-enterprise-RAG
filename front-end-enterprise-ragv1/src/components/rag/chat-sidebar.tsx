import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, User, ChevronDown } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

interface ChatSidebarProps {
  isExpanded: boolean;
}

export function ChatSidebar({ isExpanded }: ChatSidebarProps) {
  const { data: session } = useSession();

  const userNavItems = [
    { label: "Profile & Settings", href: "/profile" },
    { label: "Help Center", href: "/help" },
    { label: "Log out", onClick: () => signOut({ callbackUrl: "/auth" }) },
  ];

  return (
    <div className="flex flex-col h-full text-sm">
      <div className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full ${isExpanded ? "px-2" : "px-0"}`}
            >
              <div className="flex items-center justify-between ">
                <div
                  className={`font-bold ${isExpanded ? "text-xl" : "text-xs"}`}
                >
                  {isExpanded ? (
                    <div className="flex items-center text-sm">
                      <span className="text-[#012042]">Super</span>
                      <span className="text-gradient">RAG</span>
                      <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                    </div>
                  ) : (
                    <span className="text-gradient">SR</span>
                  )}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <div className="px-2 py-1.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="truncate font-medium">
                  {session?.user?.name || session?.user?.email || "Guest"}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="w-full text-left px-2 py-1.5 cursor-pointer"
              >
                Dashboard
              </button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {userNavItems.map((item) => (
              <DropdownMenuItem key={item.label}>
                {item.href ? (
                  <Link href={item.href} className="w-full">
                    {item.label}
                  </Link>
                ) : (
                  <button onClick={item.onClick} className="w-full text-left">
                    {item.label}
                  </button>
                )}
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
    </div>
  );
}
