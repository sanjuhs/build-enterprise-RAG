import { NextResponse } from "next/server";
import Together from "together-ai";
import { auth } from "@/auth";

interface TogetherError {
  message: string;
  status?: number;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { messages } = await req.json(); // imageUrl

    if (!process.env.TOGETHER_API_KEY) {
      return NextResponse.json(
        { error: "Together AI API key is not configured" },
        { status: 500 }
      );
    }

    const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

    const response = await together.chat.completions.create({
      messages,
      model: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo",
    });

    return NextResponse.json({
      content: response.choices[0]?.message?.content || "",
    });
  } catch (error: unknown) {
    const err = error as TogetherError;
    console.error("Image Chat Error:", err);
    return NextResponse.json(
      { error: "An error occurred while analyzing the image." },
      { status: 500 }
    );
  }
}
