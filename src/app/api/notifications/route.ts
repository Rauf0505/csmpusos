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

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", payload.id);

    if (unreadOnly) {
      query = query.eq("is_read", 0);
    }

    query = query.order("created_at", { ascending: false }).limit(50);

    const { data: notifications } = await query;

    const { count: unreadCount } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", payload.id)
      .eq("is_read", 0);

    return NextResponse.json({
      notifications: (notifications || []).map((n) => ({
        id: n.id, userId: n.user_id, title: n.title, message: n.message,
        type: n.type, isRead: n.is_read === 1, link: n.link, createdAt: n.created_at,
      })),
      unreadCount: unreadCount || 0,
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, title, message, type, link } = await request.json();

    if (!userId || !title || !message) {
      return NextResponse.json({ error: "userId, title, and message are required" }, { status: 400 });
    }

    const id = generateId();
    const { error: _insertErr } = await supabase.from("notifications").insert({
      id,
      user_id: userId,
      title,
      message,
      type: type || "info",
      link: link || null,
    });
    if (_insertErr) throw _insertErr;

    return NextResponse.json({ notification: { id, userId, title, message, type: type || "info", link, isRead: false } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
