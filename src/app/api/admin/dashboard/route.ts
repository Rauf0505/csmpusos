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

    const { count: activeStudents } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "student")
      .eq("is_active", 1);

    const { count: openComplaints } = await supabase
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .neq("status", "resolved");

    const { count: liveAnnouncements } = await supabase.from("announcements").select("*", { count: "exact", head: true });

    const { count: totalComplaints } = await supabase.from("complaints").select("*", { count: "exact", head: true });

    const today = new Date().toISOString().slice(0, 10);

    const { data: activityFeed } = await supabase
      .from("complaints")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(8);

    const { count: aiQueriesToday } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("role", "user")
      .gte("created_at", today);

    const { data: aiHourlyData } = await supabase
      .from("chat_messages")
      .select("created_at")
      .eq("role", "user")
      .gte("created_at", today);

    const hourlyMap = new Map<string, number>();
    for (const msg of aiHourlyData ?? []) {
      const hour = msg.created_at?.slice(11, 13) ?? "00";
      hourlyMap.set(hour, (hourlyMap.get(hour) ?? 0) + 1);
    }
    const aiHourly = Array.from(hourlyMap.entries())
      .map(([hour, queries]) => ({ hour, queries }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    return NextResponse.json({
      stats: {
        activeStudents: activeStudents ?? 0,
        openComplaints: openComplaints ?? 0,
        aiQueriesToday: aiQueriesToday ?? 0,
        liveAnnouncements: liveAnnouncements ?? 0,
      },
      totalComplaints: totalComplaints ?? 0,
      aiHourlyData: aiHourly,
      activityFeed: (activityFeed ?? []).map((a) => ({
        id: a.id,
        type: "complaint",
        description: `New complaint: ${a.title}`,
        timestamp: a.created_at,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
