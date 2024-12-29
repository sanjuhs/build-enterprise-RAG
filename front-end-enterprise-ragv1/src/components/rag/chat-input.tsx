import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useEffect, useRef, useCallback } from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onHeightChange: (height: number) => void;
  isLoading?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onHeightChange,
  isLoading = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize function
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 14 * 24);
    const finalHeight = Math.max(72, newHeight);
    textarea.style.height = `${finalHeight}px`;
    onHeightChange(finalHeight);
  }, [onHeightChange]);

  // Adjust height on value change
  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  return (
    <div className="px-4 py-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder="Type your message here..."
            className="min-h-[72px] resize-none text-sm shadow-lg rounded-lg border-gray-200 pr-12 leading-6"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                e.preventDefault();
                onSend();
              }
            }}
            disabled={isLoading}
          />
          <Button
            size="icon"
            className="absolute right-2 bottom-2"
            onClick={onSend}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="animate-spin">⌛</span>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
