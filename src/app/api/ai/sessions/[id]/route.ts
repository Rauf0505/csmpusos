import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const payload = verifyToken(authHeader.slice(7));
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { data: session } = await supabase
      .from("chat_sessions")
      .select("id, title, created_at, updated_at")
      .eq("id", params.id)
      .eq("user_id", payload.id)
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const { data: messages } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", params.id)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      session: {
        id: session.id,
        title: session.title,
        createdAt: session.created_at,
        updatedAt: session.updated_at,
      },
      messages: (messages || []).map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        sourceDoc: m.source_doc || undefined,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const payload = verifyToken(authHeader.slice(7));
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { data: session } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", payload.id)
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await supabase.from("chat_sessions").delete().eq("id", params.id);

    return NextResponse.json({ message: "Session deleted" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
