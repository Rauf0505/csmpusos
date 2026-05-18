import { NextResponse } from "next/server";
import { supabase, generateId } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(
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

    const { role, content, sourceDoc } = await request.json();

    if (!role || !content) {
      return NextResponse.json({ error: "role and content are required" }, { status: 400 });
    }

    if (!["user", "assistant"].includes(role)) {
      return NextResponse.json({ error: "role must be 'user' or 'assistant'" }, { status: 400 });
    }

    const { data: session } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", payload.id)
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const id = generateId();
    const now = new Date().toISOString();

    await supabase.from("chat_messages").insert({
      id,
      session_id: params.id,
      role,
      content,
      source_doc: sourceDoc || null,
    });

    await supabase.from("chat_sessions").update({ updated_at: now }).eq("id", params.id);

    if (role === "user") {
      const firstWord = content.split(/\s+/).slice(0, 5).join(" ");
      const title = firstWord.length > 50 ? firstWord.slice(0, 50) + "…" : firstWord;
      await supabase.from("chat_sessions").update({ title }).eq("id", params.id).eq("title", "New conversation");
    }

    return NextResponse.json({
      message: {
        id,
        role,
        content,
        sourceDoc: sourceDoc || undefined,
        timestamp: new Date(now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
