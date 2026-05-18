import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*, users(name)")
      .eq("id", params.id)
      .maybeSingle();
    if (courseError) throw courseError;
    if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: assignments, error: assignmentsError } = await supabase
      .from("assignments")
      .select("*")
      .eq("course_id", params.id)
      .order("created_at", { ascending: false });
    if (assignmentsError) throw assignmentsError;

    return NextResponse.json({
      course: {
        id: course.id, name: course.name, code: course.code, teacherId: course.teacher_id,
        teacherName: course.users?.name, department: course.department, semester: course.semester,
        credits: course.credits, schedule: course.schedule, room: course.room, color: course.color,
        createdAt: course.created_at,
      },
      assignments: (assignments || []).map((a) => ({
        id: a.id, courseId: a.course_id, title: a.title, description: a.description,
        dueDate: a.due_date, fileUrl: a.file_url, createdAt: a.created_at,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("no token");
    const payload = verifyToken(authHeader.slice(7));
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { data: existing, error: fetchError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { name, code, department, semester, credits, schedule, room, color } = await request.json();
    const { error: updateError } = await supabase
      .from("courses")
      .update({
        name: name || existing.name,
        code: code || existing.code,
        department: department !== undefined ? department : existing.department,
        semester: semester !== undefined ? semester : existing.semester,
        credits: credits || existing.credits,
        schedule: schedule !== undefined ? schedule : existing.schedule,
        room: room !== undefined ? room : existing.room,
        color: color || existing.color,
      })
      .eq("id", params.id);
    if (updateError) throw updateError;

    return NextResponse.json({ message: "Updated" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("no token");
    const payload = verifyToken(authHeader.slice(7));
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { error } = await supabase.from("courses").delete().eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ message: "Deleted" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
