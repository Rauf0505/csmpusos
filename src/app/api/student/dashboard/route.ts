import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { verifyActiveToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const payload = await verifyActiveToken(authHeader.slice(7));
    if (!payload) return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });

    const { count: announcementCount } = await supabase.from("announcements").select("*", { count: "exact", head: true });

    const { count: pendingComplaints } = await supabase
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .eq("user_id", payload.id)
      .neq("status", "resolved");

    const today = new Date().toISOString().slice(0, 10);
    const { count: aiQueriesToday } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("role", "user")
      .gte("created_at", today);

    const { data: announcements } = await supabase
      .from("announcements")
      .select("id, title, department, priority, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    return NextResponse.json({
      stats: {
        announcements: announcementCount ?? 0,
        pendingComplaints: pendingComplaints ?? 0,
        upcomingDeadlines: 5,
        aiQueriesToday: aiQueriesToday ?? 0,
      },
      recentAnnouncements: (announcements ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        department: a.department,
        priority: a.priority,
        date: a.created_at,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
