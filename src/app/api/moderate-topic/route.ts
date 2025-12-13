export const runtime = "nodejs";

import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is not defined in the environment variables");
}


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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.5-flash",
        "messages": [
          { "role": "system", "content": SYSTEM_PROMPT },
          { "role": "user", "content": `Topic: "${topic}"` }
        ],
        "temperature": 0
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenRouter API Error:", errorBody);
      return NextResponse.json({ error: "Failed to fetch from OpenRouter API", details: errorBody }, { status: response.status });
    }

    const result = await response.json();
    const raw = result.choices[0].message.content.trim();

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
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error";

    console.error("MODERATION ERROR:", errorMessage);

    return NextResponse.json(
      { error: "Moderation failed", detail: errorMessage },
      { status: 500 }
    );
  }
}
