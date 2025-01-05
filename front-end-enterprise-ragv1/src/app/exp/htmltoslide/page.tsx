"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";

function extractCodeFromMarkdown(markdown: string) {
  const htmlMatch = markdown.match(/```html\n([\s\S]*?)```/);
  const cssMatch = markdown.match(/```css\n([\s\S]*?)```/);

  return {
    html: htmlMatch ? htmlMatch[1].trim() : "",
    css: cssMatch ? cssMatch[1].trim() : "",
  };
}

export default function HTMLToSlide() {
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [llmResponse, setLlmResponse] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setIsComplete(false);
    setLlmResponse("");
    try {
      const response = await fetch("/api/ragchat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that generates HTML and CSS code. Always wrap HTML code in ```html blocks and CSS in ```css blocks.",
            },
            {
              role: "user",
              content: `First input: ${input1}\n
              Second input:
               ${input2}\n
               
               Please generate HTML and CSS based on these inputs. Make sure the aspect ratio is 16:9. Wrap HTML code in \`\`\`html and CSS in \`\`\`css.
               Please make sure that there is no scrolling in the output.
               it should be in a 16:9 ratio. 
               it should resemble a beautiful powerpoint slide.
               ALso only output the code, no other text.
               Remember there is no scrolling in the output, in case of a lot of text or content please reduce the font size.
               `,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Handle streaming response
      const reader = response.body?.getReader();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            setIsComplete(true);
            break;
          }
          const text = new TextDecoder().decode(value);
          setLlmResponse((prev) => prev + text);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setLlmResponse("Error generating code");
      setIsComplete(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!iframeRef.current) return;

    try {
      const iframe = iframeRef.current;

      // Wait for iframe to load
      await new Promise((resolve) => {
        iframe.onload = resolve;
        // Trigger reload to ensure content is accessible
        iframe.srcdoc = iframe.srcdoc;
      });

      // Get the iframe window and document
      const iframeWindow = iframe.contentWindow;
      const iframeDoc = iframe.contentDocument;

      if (!iframeWindow || !iframeDoc) {
        throw new Error("Cannot access iframe content");
      }

      const canvas = await html2canvas(iframeDoc.documentElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: iframeDoc.documentElement.scrollWidth,
        height: iframeDoc.documentElement.scrollHeight,
        windowWidth: iframeDoc.documentElement.scrollWidth,
        windowHeight: iframeDoc.documentElement.scrollHeight,
        logging: true, // Add logging for debugging
      });

      // Force download using Blob
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "slide.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const { html, css } = isComplete
    ? extractCodeFromMarkdown(llmResponse)
    : { html: "", css: "" };
  const combinedHtml = css
    ? `<!DOCTYPE html>
       <html>
         <head>
           <base href="/" />
           <meta charset="utf-8" />
           <style>
             /* Reset default styles */
             * {
               margin: 0;
               padding: 0;
               box-sizing: border-box;
             }
             body {
               margin: 0;
               overflow: hidden;
               width: 100%;
               height: 100%;
             }
             ${css}
           </style>
         </head>
         <body>
           ${html}
         </body>
       </html>`
    : html;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              First Input
            </label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={4}
              value={input1}
              onChange={(e) => setInput1(e.target.value)}
              placeholder="Enter your first input..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Second Input
            </label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={4}
              value={input2}
              onChange={(e) => setInput2(e.target.value)}
              placeholder="Enter your second input..."
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? "Generating..." : "Generate HTML"}
          </button>

          {isComplete && (html || css) && (
            <button
              onClick={handleDownload}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Download as PNG
            </button>
          )}
        </div>

        {llmResponse && (
          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">LLM Response:</h3>
              <div className="bg-gray-100 p-4 rounded-md">
                <pre className="whitespace-pre-wrap">{llmResponse}</pre>
              </div>
            </div>

            {isComplete && (html || css) && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Rendered Result:</h3>
                <div className="w-full h-[600px] bg-white border-2 border-gray-300 rounded-md overflow-hidden">
                  <iframe
                    ref={iframeRef}
                    srcDoc={combinedHtml}
                    className="w-full h-full"
                    sandbox="allow-scripts allow-same-origin"
                    frameBorder="0"
                    loading="lazy"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
