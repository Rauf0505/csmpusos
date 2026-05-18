import { NextResponse } from "next/server";
import { supabase, generateId } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const payload = verifyToken(authHeader.slice(7));
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { data: sessions } = await supabase
      .from("chat_sessions")
      .select("id, title, created_at, updated_at, chat_messages(count)")
      .eq("user_id", payload.id)
      .order("updated_at", { ascending: false });

    return NextResponse.json({
      sessions: (sessions || []).map((s: { id: string; title: string; created_at: string; updated_at: string; chat_messages: { count: number }[] }) => ({
        id: s.id,
        title: s.title,
        messageCount: s.chat_messages?.[0]?.count || 0,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const payload = verifyToken(authHeader.slice(7));
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { title } = await request.json();
    const id = generateId();

    await supabase.from("chat_sessions").insert({
      id,
      user_id: payload.id,
      title: title || "New conversation",
    });

    return NextResponse.json({
      session: {
        id,
        title: title || "New conversation",
        messageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
