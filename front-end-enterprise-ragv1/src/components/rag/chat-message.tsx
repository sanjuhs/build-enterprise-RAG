import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Copy, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import html2canvas from "html2canvas";
import { useRef, useState, useEffect, memo } from "react";
import Editor from "@monaco-editor/react";
import mermaid from "mermaid";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

interface MermaidRenderResult {
  svg: string;
}

// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: "dark",
  securityLevel: "loose",
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: "basis",
  },
  logLevel: 1,
});

const captureHighQualityImage = async (element: HTMLElement) => {
  const canvas = await html2canvas(element, {
    scale: 3, // Increased from 2 to 3 for better quality
    useCORS: true,
    logging: false,
    backgroundColor: null,
    imageTimeout: 0,
  });
  return canvas;
};

function MarkdownTable({ children }: { children: React.ReactNode }) {
  const tableRef = useRef<HTMLDivElement>(null);

  const handleCopyTable = async (tableElement: HTMLElement) => {
    try {
      const canvas = await captureHighQualityImage(tableElement);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            navigator.clipboard.write([
              new ClipboardItem({
                "image/png": blob,
              }),
            ]);
          }
        },
        "image/png",
        1.0
      ); // Maximum quality
    } catch (error) {
      console.error("Failed to copy table:", error);
    }
  };

  const handleDownloadTable = async (tableElement: HTMLElement) => {
    try {
      const canvas = await captureHighQualityImage(tableElement);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png", 1.0); // Maximum quality
      a.download = "table.png";
      a.click();
    } catch (error) {
      console.error("Failed to download table:", error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto" ref={tableRef}>
        <table className="border-collapse border border-border">
          {children}
        </table>
      </div>
      <TooltipProvider>
        <div className="flex gap-2 justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() =>
                  tableRef.current && handleCopyTable(tableRef.current)
                }
              >
                <Copy className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy as image</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() =>
                  tableRef.current && handleDownloadTable(tableRef.current)
                }
              >
                <Download className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download as PNG</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}

interface CodeProps {
  children: React.ReactNode;
  className?: string;
}

interface CodeChildProps {
  props: {
    children?: string | string[];
    className?: string;
  };
}

function MarkdownCode({ children, className }: CodeProps) {
  const codeRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [editorHeight, setEditorHeight] = useState("100px");
  console.log("class name is now going to be ====> ", className);

  // Extract language from className (e.g., "language-javascript" -> "javascript")
  const classLanguage = className?.replace(/^language-/, "");

  const getCodeString = () => {
    console.log("Raw children:", children);
    console.log("Language className:", className);
    console.log("Class language:", classLanguage);

    let codeContent = "";

    if (!children) {
      return { code: "", language: "plaintext" };
    }

    if (typeof children === "string") {
      codeContent = children;
    } else if (typeof children === "object" && "props" in children) {
      const childProps = children as CodeChildProps;
      if (typeof childProps.props.children === "string") {
        codeContent = childProps.props.children;
      } else if (Array.isArray(childProps.props.children)) {
        codeContent = childProps.props.children.join("");
      }
    }

    // Clean the code content
    codeContent = codeContent.trim();

    console.log("Final code:", codeContent);
    return { code: codeContent, language: classLanguage || "plaintext" };
  };

  const { code: codeString, language } = getCodeString();

  useEffect(() => {
    if (codeString) {
      const lineCount = codeString.split("\n").length;
      const newHeight = Math.min(Math.max(lineCount * 24, 100), 400);
      setEditorHeight(`${newHeight}px`);
    }
  }, [codeString]);

  const handleCopyCode = async () => {
    if (!codeString) return;
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <div className="relative group">
      {language !== "plaintext" && (
        <div className="text-xs text-muted-foreground px-4 py-2 border-b border-border bg-muted rounded-t-lg">
          {language}
        </div>
      )}
      <div
        ref={codeRef}
        className={cn(
          "rounded-lg overflow-hidden border border-border",
          language !== "plaintext" && "rounded-t-none"
        )}
      >
        {codeString && (
          <Editor
            height={editorHeight}
            defaultLanguage={language}
            defaultValue={codeString}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              scrollbar: {
                vertical: "hidden",
                horizontal: "hidden",
              },
              lineNumbers: "off",
              folding: false,
              domReadOnly: true,
              padding: { top: 8, bottom: 8 },
              fixedOverflowWidgets: true,
            }}
            loading={<div className="p-4">Loading...</div>}
            onMount={(editor) => {
              editor.layout();
              console.log("Editor mounted with value:", editor.getValue());
            }}
          />
        )}
      </div>
      <TooltipProvider>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 bg-muted/50 hover:bg-muted"
                onClick={handleCopyCode}
              >
                {copied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? "Copied!" : "Copy code"}</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}

function MermaidDiagram({ children }: { children: string }) {
  const [svgContent, setSvgContent] = useState<string>("");
  const [renderError, setRenderError] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        // Initialize mermaid for this specific render
        try {
          mermaid.initialize({
            startOnLoad: true,
            theme: "dark",
            securityLevel: "loose",
            htmlLabels: true,
            fontSize: 16,
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
              curve: "basis",
            },
            logLevel: 1,
          });
        } catch (initError) {
          console.error("Mermaid initialization failed:", initError);
          setRenderError(true);
          return;
        }

        // Try to render with a timeout to prevent hanging
        const renderPromise = mermaid.render(
          "mermaid-diagram",
          children
        ) as Promise<MermaidRenderResult>;
        const timeoutPromise = new Promise<MermaidRenderResult>((_, reject) =>
          setTimeout(() => reject(new Error("Rendering timed out")), 5000)
        );

        const { svg } = await Promise.race([renderPromise, timeoutPromise]);
        setSvgContent(svg);
        setRenderError(false);
      } catch (error) {
        console.error("Failed to render mermaid diagram:", error);
        setRenderError(true);
      }
    };

    renderDiagram();
  }, [children]);

  // Early return with code view if render fails
  if (renderError) {
    return <MarkdownCode className="language-mermaid">{children}</MarkdownCode>;
  }

  const handleCopyDiagram = async () => {
    if (!diagramRef.current) return;
    try {
      const canvas = await captureHighQualityImage(diagramRef.current);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            navigator.clipboard.write([
              new ClipboardItem({
                "image/png": blob,
              }),
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        },
        "image/png",
        1.0
      ); // Maximum quality
    } catch (error) {
      console.error("Failed to copy diagram:", error);
    }
  };

  const handleDownloadDiagram = async () => {
    if (!diagramRef.current) return;
    try {
      const canvas = await captureHighQualityImage(diagramRef.current);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png", 1.0);
      a.download = "diagram.png";
      a.click();
    } catch (error) {
      console.error("Failed to download diagram:", error);
    }
  };

  return (
    <div className="space-y-2">
      <div
        ref={diagramRef}
        className="overflow-x-auto bg-muted p-4 rounded-lg min-h-[200px] flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
      <TooltipProvider>
        <div className="flex gap-2 justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCopyDiagram}
              >
                {copied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {copied ? "Copied!" : "Copy as image"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleDownloadDiagram}
              >
                <Download className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download as PNG</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}

export const ChatMessage = memo(function ChatMessage({
  role,
  content,
  isStreaming = false,
}: ChatMessageProps) {
  const isAssistant = role === "assistant";

  const cleanContent = isAssistant
    ? content.replace(/\n\n+/g, "\n\n")
    : content;

  return (
    <div
      className={cn(
        "flex w-full gap-4 p-4 rounded-lg text-sm",
        !isAssistant && "bg-blue-50 dark:bg-blue-900/20"
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-2 w-full",
          isAssistant &&
            !isStreaming &&
            "prose prose-xs dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-table:table-auto prose-p:my-2 prose-headings:my-3"
        )}
      >
        {isAssistant && !isStreaming ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              pre: ({ children }) => {
                const codeElement = children?.props;
                const language = codeElement?.className?.replace(
                  /^language-/,
                  ""
                );

                // Handle Mermaid diagrams
                if (language === "mermaid") {
                  return (
                    <MermaidDiagram>{codeElement?.children}</MermaidDiagram>
                  );
                }

                // Handle regular code blocks
                return (
                  <MarkdownCode className={codeElement?.className}>
                    {codeElement?.children}
                  </MarkdownCode>
                );
              },
              code: ({ children }) => (
                <code className="bg-muted px-1 rounded">{children}</code>
              ),
              table: ({ children }) => (
                <MarkdownTable>{children}</MarkdownTable>
              ),
              th: ({ children }) => (
                <th className="border border-border p-2 bg-muted">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-border p-2">{children}</td>
              ),
            }}
          >
            {cleanContent}
          </ReactMarkdown>
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
        )}
      </div>
    </div>
  );
});
