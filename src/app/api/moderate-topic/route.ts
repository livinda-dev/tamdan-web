export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAi = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!);

const SYSTEM_PROMPT = `
You are a strict content moderation and input validation engine.

Your job is to classify a user topic into SAFE or UNSAFE.

Return UNSAFE if the topic contains ANY of the following:

--- INAPPROPRIATE CONTENT ---
• sexual content  
• violence, terrorism  
• hate speech  
• racism or slurs (including obfuscated forms such as "nigga", "ni99a", "niga")  
• harassment, insults  
• self-harm  
• drug use  
• explicit or illegal topics

--- PROFANITY OR OBFUSCATED SWEAR WORDS ---
Detect disguised forms:
• fck, f*ck, fuk, fk, f@ck  
• b*tch, bich, beetch  
• sh1t, shyt, shyt  
• d1ck, dik, diq  
• as$hole, azzhole  
If the word clearly implies the profanity → mark UNSAFE.

--- NONSENSE / GIBBERISH ---
Mark UNSAFE if input is unreadable or contains:
• random keyboard smashes: "dfklajfklaj", "asdasd", "jdkfjdk"  
• no semantic meaning  
• more than 40% characters being symbols or numbers  
• repeated characters "aaaaaaa", "!!!!", "???"  

--- LOW-QUALITY INPUT ---
Mark UNSAFE if:
• topic is shorter than 3 characters  
• only emojis  
• only symbols  
• only repeated letters  
• meaningless fragments ("ok", "hi", "lol", "hmm")

You MUST respond only in JSON:
{
  "status": "SAFE" | "UNSAFE",
  "reason": "short explanation"
}
`;

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();
    if (!topic) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    }

    const model = genAi.getGenerativeModel({
      model: "models/gemini-2.5-flash",
      generationConfig: { temperature: 0 }
    });

    const result = await model.generateContent([
      SYSTEM_PROMPT,
      `Topic: "${topic}"`
    ]);

    const raw = result.response.text().trim();

    // Try 1 → Pure JSON
    try {
      return NextResponse.json(JSON.parse(raw));
    } catch {}

    // Try 2 → Extract { ... }
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return NextResponse.json(JSON.parse(match[0]));
      } catch {}
    }

    // Try 3 → Final fallback (SAFE default)
    return NextResponse.json({
      status: "UNSAFE",
      reason: "Model returned unreadable output"
    });
  } catch (error: any) {
    console.error("MOD ERROR:", error);
    return NextResponse.json(
      { error: "Moderation failed", detail: error.message },
      { status: 500 }
    );
  }
}
