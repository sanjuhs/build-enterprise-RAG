interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div
      className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`
        max-w-[80%] rounded-lg p-3 text-sm
        ${
          role === "user"
            ? "bg-blue-500 text-white"
            : "bg-gray-100 dark:bg-gray-700 dark:text-gray-100"
        }
      `}
      >
        {content}
      </div>
    </div>
  );
}
