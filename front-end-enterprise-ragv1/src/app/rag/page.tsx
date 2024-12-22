"use client";

import { AuthProvider } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { ChatMessage } from "@/components/rag/chat-message";
import { ChatSidebar } from "@/components/rag/chat-sidebar";
import { ChatInput } from "@/components/rag/chat-input";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function RAGPage() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! How can I help you today?" },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputHeight, setInputHeight] = useState(72);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user" as const, content: inputMessage.trim() },
    ];
    setMessages(newMessages);
    setInputMessage("");

    setTimeout(() => {
      setMessages([
        ...newMessages,
        { role: "assistant" as const, content: "This is a sample response." },
      ]);
    }, 1000);
  };

  return (
    <AuthProvider requiredRoles={["guest", "user", "admin"]}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-800 border-b dark:border-gray-700 z-50 flex items-center px-4">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <div className="flex h-full">
                <ChatSidebar isExpanded={true} />
              </div>
            </SheetContent>
          </Sheet>
          <span className="ml-4 font-semibold">SuperRAG</span>
        </div>

        <div
          className={`hidden md:flex ${
            isExpanded ? "w-72" : "w-12"
          } flex-col bg-gray-100 dark:bg-gray-800 relative transition-all duration-200`}
        >
          <Button
            variant="ghost"
            className={`absolute right-0 top-2 ${
              isExpanded ? "h-16 w-10" : "h-16 w-8"
            } rounded-none rounded-l-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-0`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center justify-center w-full">
              {isExpanded ? (
                <ChevronLeft className="h-8 w-8" />
              ) : (
                <ChevronRight className="h-6 w-6" />
              )}
            </div>
          </Button>

          <ChatSidebar isExpanded={isExpanded} />
        </div>

        <div className="flex-1 flex flex-col h-full relative">
          <main className="flex-1 overflow-hidden md:pt-0 pt-14">
            <ScrollArea
              className={`h-screen w-full`}
              style={{ paddingBottom: `${inputHeight + 16}px` }}
            >
              <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={index}
                      role={message.role}
                      content={message.content}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </ScrollArea>
          </main>

          <div className="absolute bottom-0 left-0 right-0">
            <ChatInput
              value={inputMessage}
              onChange={setInputMessage}
              onSend={handleSendMessage}
              onHeightChange={setInputHeight}
            />
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
