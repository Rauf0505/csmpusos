import { NextResponse } from "next/server";
import { supabase, generateId } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");

    let query = supabase.from("courses").select("*, users(name)");

    if (teacherId) {
      query = query.eq("teacher_id", teacherId);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    const courses = data || [];

    return NextResponse.json({
      courses: courses.map((c) => ({
        id: c.id, name: c.name, code: c.code, teacherId: c.teacher_id,
        teacherName: c.users?.name, department: c.department, semester: c.semester,
        credits: c.credits, schedule: c.schedule, room: c.room, color: c.color,
        createdAt: c.created_at,
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

    const { name, code, department, semester, credits, schedule, room, color } = await request.json();
    if (!name || !code) {
      return NextResponse.json({ error: "Name and code are required" }, { status: 400 });
    }

    const id = generateId();
    const { error } = await supabase.from("courses").insert({
      id,
      name,
      code,
      teacher_id: payload.role === "teacher" ? payload.id : null,
      department: department || null,
      semester: semester || null,
      credits: credits || 3,
      schedule: schedule || null,
      room: room || null,
      color: color || "#2563eb",
    });
    if (error) throw error;

    return NextResponse.json({ course: { id, name, code, teacherId: payload.id, department, semester, credits: credits || 3, schedule, room, color: color || "#2563eb" } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
