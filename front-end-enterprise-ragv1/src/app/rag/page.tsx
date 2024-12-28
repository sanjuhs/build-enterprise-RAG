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
  const [messages, setMessages] = useState<Message[]>(() => [
    { role: "assistant", content: "Hello! How can I help you today?" },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputHeight, setInputHeight] = useState(72);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(
    null
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: inputMessage.trim() },
    ];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ragchat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let accumulatedContent = "";
      const decoder = new TextDecoder();

      // Add placeholder and set streaming ID
      const streamingIndex = newMessages.length;
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setStreamingMessageId(streamingIndex);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulatedContent += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: accumulatedContent,
          };
          return updated;
        });
      }
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setStreamingMessageId(null);
      setIsLoading(false);
    }
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
          <main className="flex-1 overflow-hidden">
            <ScrollArea
              className={`h-screen w-full md:pt-0 pt-16`}
              style={{ paddingBottom: `${inputHeight + 16}px` }}
            >
              <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={`${index}-${message.role}`}
                      role={message.role}
                      content={message.content}
                      isStreaming={index === streamingMessageId}
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
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
