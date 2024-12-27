"use client";

import { AuthProvider } from "@/components/providers/auth-provider";
import { NavBar } from "@/components/shared/nav-bar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HelpPage() {
  return (
    <AuthProvider requiredRoles={["guest", "user", "admin"]}>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="container mx-auto p-6 max-w-4xl flex-1">
          <h1 className="text-2xl font-bold mb-8">Help Center</h1>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1">
              <AccordionTrigger>Getting Started with SuperRAG</AccordionTrigger>
              <AccordionContent>
                SuperRAG is an AI-powered chat interface that helps you interact
                with your documents. Start by uploading your documents or asking
                questions directly in the chat interface.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>How to Use Chat Interface</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Type your question in the chat input</li>
                  <li>Press Enter or click the send button</li>
                  <li>Use Shift+Enter for new lines</li>
                  <li>
                    The AI will respond based on your documents and knowledge
                    base
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Document Management</AccordionTrigger>
              <AccordionContent>
                Learn how to manage your documents effectively:
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Upload documents in various formats</li>
                  <li>Organize documents into collections</li>
                  <li>Search through your document library</li>
                  <li>Share documents with team members</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Keyboard Shortcuts</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>Send message:</div>
                  <div>Enter</div>
                  <div>New line:</div>
                  <div>Shift + Enter</div>
                  <div>Clear chat:</div>
                  <div>Ctrl + L</div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </AuthProvider>
  );
}
