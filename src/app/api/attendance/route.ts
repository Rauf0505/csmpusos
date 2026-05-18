import { NextResponse } from "next/server";
import { supabase, generateId } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const studentId = searchParams.get("studentId");
    const date = searchParams.get("date");

    let query = supabase
      .from("attendance")
      .select("*, users!inner(name)");

    if (courseId) { query = query.eq("course_id", courseId); }
    if (studentId) { query = query.eq("student_id", studentId); }
    if (date) { query = query.eq("date", date); }

    query = query.order("date", { ascending: false });

    const { data: records } = await query;

    return NextResponse.json({
      attendance: (records || []).map((a: { id: string; course_id: string; student_id: string; users: { name: string } | null; date: string; status: string; marked_by: string | null; created_at: string }) => ({
        id: a.id, courseId: a.course_id, studentId: a.student_id,
        studentName: a.users?.name, date: a.date, status: a.status,
        markedBy: a.marked_by, createdAt: a.created_at,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("no token");
    const payload = verifyToken(authHeader.slice(7));
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { courseId, studentId, date, status } = await request.json();
    if (!courseId || !studentId || !date || !status) {
      return NextResponse.json({ error: "courseId, studentId, date, and status are required" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("attendance")
      .select("id")
      .eq("course_id", courseId)
      .eq("student_id", studentId)
      .eq("date", date)
      .maybeSingle();

    if (existing) {
      await supabase.from("attendance").update({ status, marked_by: payload.id }).eq("id", existing.id);
      return NextResponse.json({ message: "Updated" });
    }

    const id = generateId();
    const { error: _insertErr } = await supabase.from("attendance").insert({
      id,
      course_id: courseId,
      student_id: studentId,
      date,
      status,
      marked_by: payload.id,
    });
    if (_insertErr) throw _insertErr;

    return NextResponse.json({ attendance: { id, courseId, studentId, date, status } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
