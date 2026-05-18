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

    const { count: totalStudents } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "student")
      .eq("is_active", 1);

    return NextResponse.json({
      stats: {
        courses: 4,
        totalStudents: totalStudents ?? 0,
        pendingGrading: 42,
        classesToday: 3,
      },
      courses: [
        { code: "CS-301", name: "Data Structures", students: 85, schedule: "Mon/Wed 9-10:30", room: "Hall A" },
        { code: "CS-302", name: "Database Systems", students: 72, schedule: "Tue/Thu 11-12:30", room: "Lab 3" },
        { code: "CS-401", name: "Software Engineering", students: 65, schedule: "Mon/Wed 2-3:30", room: "Hall B" },
        { code: "MT-101", name: "Linear Algebra", students: 90, schedule: "Tue/Thu 9-10:30", room: "Room 201" },
      ],
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
