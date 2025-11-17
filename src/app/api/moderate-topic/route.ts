import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAi = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!);

const SYSTEM_PROMPT = `
You are a content moderation engine.

Classify the topic into two categories:
- "SAFE"
- "UNSAFE"

UNSAFE means:
• sexual content
• hate speech
• violence / terrorism
• threats
• harassment
• drugs
• explicit content
• self-harm
• anything inappropriate for general audiences

Respond ONLY in JSON:
{
  "status": "SAFE" | "UNSAFE",
  "reason": "short explanation"
}
`;

function extractJSON(raw: string) {
  try { return JSON.parse(raw); } catch {}

  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }

  return { status: "SAFE", reason: "Could not parse JSON" };
}

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    }

    const model = genAi.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    const result = await model.generateContent([
      SYSTEM_PROMPT,
      `Topic: "${topic}"`
    ]);

    const text = result.response.text();
    const parsed = extractJSON(text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Moderation error:", error);
    return NextResponse.json(
      { error: "Moderation failed" },
      { status: 500 }
    );
  }
}
