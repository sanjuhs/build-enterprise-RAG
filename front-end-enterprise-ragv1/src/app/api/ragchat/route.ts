import { NextResponse } from "next/server";
import { PROVIDER_CONFIGS } from "./models.config";
import { auth } from "@/auth";

interface OpenAIError {
  code?: string;
  message: string;
  status?: number;
}

export async function POST(req: Request) {
  // Get session using the auth helper directly
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      messages,
      provider = "deepseek",
      model = "deepseek-chat",
    } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    const config = PROVIDER_CONFIGS[provider];
    if (!config) {
      return NextResponse.json(
        { error: "Invalid provider specified" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const client = config.createClient();
    const response = await config.createCompletion(client, messages, model);

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const err = error as OpenAIError;
    console.error("RAG Chat Error:", err);

    if (err?.code === "invalid_api_key") {
      return NextResponse.json(
        { error: "Invalid API key. Please check your configuration." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
