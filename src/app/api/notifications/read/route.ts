import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const payload = verifyToken(authHeader.slice(7));
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { ids, all } = await request.json();

    if (all) {
      await supabase.from("notifications").update({ is_read: 1 }).eq("user_id", payload.id);
    } else if (Array.isArray(ids) && ids.length > 0) {
      await supabase.from("notifications").update({ is_read: 1 }).in("id", ids).eq("user_id", payload.id);
    }

    return NextResponse.json({ message: "Marked as read" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
