import { NextResponse } from "next/server";
import { supabase, generateId } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are CampusOS AI Assistant, powered by Gemini. A helpful agent for university students and staff.

Your role:
- Answer questions about university policies, exam schedules, fee structures, hostel rules, and campus life.
- Use the provided document context to give accurate, sourced answers.
- Use past Q&A from other students to provide better answers.
- Use campus announcements relevant to the user's department or role.
- If the context doesn't contain the answer, say so politely and suggest where the user can find the information (e.g., "Please contact the Finance Office" or "Check the student portal").
- Always cite the source document name when you use information from it.
- Be concise but thorough. Use bullet points for lists.
- Respond in the same language the user wrote in.

Rules:
- NEVER make up information. If you're not sure, say you don't know.
- ALWAYS reference the source document when you use specific information from it.
- Be friendly and professional.`;

async function searchDocuments(query: string): Promise<{ source: string; text: string }[]> {
  const { data: docs } = await supabase
    .from("ai_documents")
    .select("id, file_name, extracted_text")
    .not("extracted_text", "is", null)
    .eq("status", "indexed");

  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const results: { source: string; text: string; score: number }[] = [];

  for (const doc of (docs || [])) {
    const text = doc.extracted_text || "";
    const lower = text.toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      const matches = lower.match(regex);
      if (matches) score += matches.length;
    }
    if (score > 0) {
      results.push({ source: doc.file_name, text, score });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 3).map(({ source, text }) => ({ source, text }));
}

function extractRelevantSection(text: string, query: string, maxLen = 3000): string {
  const lower = text.toLowerCase();
  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  if (queryWords.length === 0) return text.slice(0, maxLen);

  const matchPositions: number[] = [];
  for (const word of queryWords) {
    let pos = -1;
    while (true) {
      pos = lower.indexOf(word, pos + 1);
      if (pos === -1) break;
      matchPositions.push(pos);
    }
  }

  if (matchPositions.length === 0) return text.slice(0, maxLen);

  matchPositions.sort((a, b) => a - b);

  let bestStart = 0;
  let bestCount = 0;

  for (const pos of matchPositions) {
    const windowStart = Math.max(0, pos - 400);
    const windowEnd = Math.min(text.length, pos + 400);
    const windowText = lower.slice(windowStart, windowEnd);

    let count = 0;
    for (const word of queryWords) {
      if (windowText.includes(word)) count++;
    }

    if (count > bestCount) {
      bestCount = count;
      bestStart = pos;
    }
  }

  const start = Math.max(0, bestStart - 400);
  const end = Math.min(text.length, bestStart + maxLen - (bestStart - start));
  let excerpt = text.slice(start, end);
  if (start > 0) excerpt = "…" + excerpt;
  if (end < text.length) excerpt = excerpt + "…";
  return excerpt;
}

async function searchPastQueries(query: string): Promise<string> {
  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  if (queryWords.length === 0) return "";

  const { data: userMessages } = await supabase
    .from("chat_messages")
    .select("id, session_id, content, created_at")
    .eq("role", "user")
    .order("created_at", { ascending: false })
    .limit(100);

  const scored: { question: string; answer: string; score: number }[] = [];

  for (const um of (userMessages || [])) {
    const lower = um.content.toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      if (lower.includes(word)) score++;
    }
    if (score === 0) continue;

    const { data: assistantMsgs } = await supabase
      .from("chat_messages")
      .select("content")
      .eq("session_id", um.session_id)
      .eq("role", "assistant")
      .gt("created_at", um.created_at)
      .order("created_at", { ascending: true })
      .limit(1);

    const assistantMsg = assistantMsgs?.[0];
    if (assistantMsg) {
      scored.push({ question: um.content, answer: assistantMsg.content, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 3);
  if (top.length === 0) return "";

  return top.map((qa, i) =>
    `[Past Q&A ${i + 1}]\nStudent asked: ${qa.question}\nAI answered: ${qa.answer}`
  ).join("\n\n");
}

async function searchAnnouncements(query: string, userRole: string, userDepartment?: string | null): Promise<string> {
  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  if (queryWords.length === 0 && !userDepartment) return "";

  let sbQuery = supabase
    .from("announcements")
    .select("title, description, department, priority, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (userRole !== "admin" && userRole !== "department-head" && userDepartment) {
    sbQuery = sbQuery.or(`department.eq.${userDepartment},department.is.null,department.eq.`);
  }

  const { data: announcements } = await sbQuery;

  if (!announcements || announcements.length === 0) return "";

  let relevant = announcements;
  if (queryWords.length > 0) {
    relevant = announcements.filter((a) => {
      const text = `${a.title} ${a.description} ${a.department}`.toLowerCase();
      return queryWords.some((w) => text.includes(w));
    });
  }

  if (relevant.length === 0) return "";

  return relevant.slice(0, 4).map((a, i) =>
    `[Announcement ${i + 1}: ${a.title}] (${a.priority}, ${a.department || "All"})\n${a.description}`
  ).join("\n\n");
}

async function persistMessage(sessionId: string, role: string, content: string, sourceDoc?: string | null) {
  const id = generateId();
  await supabase.from("chat_messages").insert({ id, session_id: sessionId, role, content, source_doc: sourceDoc || null });

  const now = new Date().toISOString();
  await supabase.from("chat_sessions").update({ updated_at: now }).eq("id", sessionId);

  if (role === "user") {
    const firstWord = content.split(/\s+/).slice(0, 5).join(" ");
    const title = firstWord.length > 50 ? firstWord.slice(0, 50) + "…" : firstWord;
    await supabase.from("chat_sessions").update({ title }).eq("id", sessionId).eq("title", "New conversation");
  }
}

async function getHistoryFromDb(sessionId: string): Promise<{ role: string; content: string }[]> {
  const { data } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  return (data || []).map((r) => ({ role: r.role, content: r.content }));
}

export async function POST(request: Request) {
  let sessionId: string | null = null;
  let authenticatedUserId: string | null = null;
  let userRole = "student";
  let userDepartment: string | null = null;

  try {
    const body = await request.json();
    sessionId = body.sessionId || null;
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    let authPayload: ReturnType<typeof verifyToken> = null;
    if (authHeader?.startsWith("Bearer ")) {
      authPayload = verifyToken(authHeader.slice(7));
      if (authPayload) {
        authenticatedUserId = authPayload.id;
        userRole = authPayload.role;
        userDepartment = authPayload.department;
      }
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-api-key-here") {
      const fallbackReply = "AI is not configured yet. Set your GEMINI_API_KEY in .env.local to enable intelligent answers.\n\n";
      if (sessionId && authenticatedUserId) {
        await persistMessage(sessionId, "user", message);
        await persistMessage(sessionId, "assistant", fallbackReply);
      }
      return NextResponse.json({ reply: fallbackReply, source: null });
    }

    if (sessionId && authenticatedUserId) {
      await persistMessage(sessionId, "user", message);
    }

    const docMatches = await searchDocuments(message);
    let contextBlock = "";
    let primarySource: string | null = null;

    if (docMatches.length > 0) {
      contextBlock = docMatches
        .map((m, i) => {
          const excerpt = extractRelevantSection(m.text, message);
          return `[Document ${i + 1}: ${m.source}]\n${excerpt}`;
        })
        .join("\n\n");
      primarySource = docMatches[0].source;
    }

    const pastQueries = await searchPastQueries(message);
    const announcements = await searchAnnouncements(message, userRole, userDepartment);

    let fullPrompt = SYSTEM_PROMPT + "\n\n";

    if (contextBlock) {
      fullPrompt += `Here are relevant documents from the campus knowledge base:\n\n${contextBlock}\n\nUse these documents to answer the user's question. Always cite the document name.\n\n`;
    }

    if (pastQueries) {
      fullPrompt += `Here are similar past Q&A from other students that may help:\n\n${pastQueries}\n\nUse these to provide a better answer, but verify the information is still accurate.\n\n`;
    }

    if (announcements) {
      fullPrompt += `Here are relevant campus announcements:\n\n${announcements}\n\nRefer to these announcements if they help answer the question.\n\n`;
    }

    if (sessionId && authenticatedUserId) {
      const history = await getHistoryFromDb(sessionId);
      if (history.length > 0) {
        const recentHistory = history.slice(-10);
        fullPrompt += "Conversation history:\n";
        for (const msg of recentHistory) {
          fullPrompt += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
        }
        fullPrompt += "\n";
      }
    }

    fullPrompt += `User question: ${message}`;

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
      },
    });

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const reply = response.text();

    if (sessionId && authenticatedUserId) {
      await persistMessage(sessionId, "assistant", reply, primarySource);
    }

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return NextResponse.json({
      reply,
      source: primarySource,
      timestamp: now,
    });
  } catch (error: unknown) {
    console.error("AI Chat error:", error);
    const errMsg = error instanceof Error ? error.message : "Something went wrong";

    let userReply = "Sorry, I encountered an error. Please try again later.";
    if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("Quota")) {
      userReply = "AI service quota exceeded for today. The Gemini free tier daily limit has been reached.\n\n**Solution:** Enable billing on your Google Cloud project at https://console.cloud.google.com to get higher quotas. The integration is working correctly — just need more quota.";
    } else if (errMsg.includes("API_KEY") || errMsg.includes("invalid") || errMsg.includes("not found")) {
      userReply = "AI is not configured correctly. Check your GEMINI_API_KEY in .env.local.";
    }

    if (sessionId && authenticatedUserId) {
      await persistMessage(sessionId, "assistant", userReply);
    }

    return NextResponse.json(
      { error: errMsg, reply: userReply },
      { status: 500 }
    );
  }
}
