import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count };
}

const agentSkillSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Skill name in slug format (e.g., 'react-best-practices')" },
    title: { type: Type.STRING, description: "Human readable title" },
    description: { type: Type.STRING, description: "Brief description of what this skill teaches AI agents" },
    version: { type: Type.STRING, description: "Semantic version (e.g., '1.0.0')" },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Tags for categorization"
    },
    applicability: { type: Type.STRING, description: "When the AI agent should apply this skill (e.g., 'Apply when working with React components')" },
    principles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING, description: "Detailed instruction for the AI agent" },
          priority: { type: Type.STRING, description: "must, should, or may" }
        },
        required: ["title", "description", "priority"]
      },
      description: "Core principles and guidelines (5-8 items)"
    },
    patterns: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          example: { type: Type.STRING, description: "Code example demonstrating the pattern" },
          language: { type: Type.STRING, description: "Programming language for syntax highlighting" }
        },
        required: ["name", "description", "example"]
      },
      description: "Code patterns with examples (3-5 items)"
    },
    antiPatterns: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          badExample: { type: Type.STRING, description: "Code showing what NOT to do" },
          goodExample: { type: Type.STRING, description: "Code showing the correct approach" }
        },
        required: ["name", "description"]
      },
      description: "Anti-patterns to avoid (2-4 items)"
    },
    filePatterns: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Glob patterns for files this skill applies to (e.g., '*.tsx', 'src/components/**')"
    },
    references: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Links to official documentation or resources"
    }
  },
  required: ["name", "title", "description", "version", "tags", "applicability", "principles", "patterns", "antiPatterns"]
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rateLimitKey = getRateLimitKey(request);
  const { allowed, remaining } = checkRateLimit(rateLimitKey);

  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "Retry-After": "60",
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { topic } = body as { topic?: unknown };

  if (typeof topic !== "string") {
    return NextResponse.json({ error: "Topic is required and must be a string" }, { status: 400 });
  }

  const sanitizedTopic = topic.trim().slice(0, 500);
  if (!sanitizedTopic) {
    return NextResponse.json({ error: "Topic cannot be empty" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Create a comprehensive AI coding agent skill for: "${sanitizedTopic}"

This skill will be used by AI coding assistants (like Claude Code, Cursor, GitHub Copilot) to provide better code suggestions and follow best practices.

The skill should include:
1. Clear principles that tell the AI WHAT to do and WHEN
2. Code patterns with REAL, WORKING examples (not pseudocode)
3. Anti-patterns showing common mistakes and how to fix them
4. Specific file patterns where this skill applies

Make the instructions actionable and specific. The AI agent should be able to directly apply these guidelines when writing code.

Focus on practical, production-ready patterns used in modern development.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: agentSkillSchema,
        systemInstruction: `You are an expert software architect creating AI agent skills.
Your skills are used by AI coding assistants to write better code.

Guidelines:
- Write instructions as commands to the AI (e.g., "Always use...", "Never...", "Prefer...")
- Include REAL code examples, not pseudocode
- Be specific and actionable
- Focus on modern best practices (2024+)
- Include edge cases and error handling patterns
- Make principles enforceable and testable`
      }
    });

    if (!response.text) {
      return NextResponse.json({ error: "No response from Gemini" }, { status: 500 });
    }

    const data = JSON.parse(response.text);
    return NextResponse.json(data, {
      headers: {
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate skill" }, { status: 500 });
  }
}
