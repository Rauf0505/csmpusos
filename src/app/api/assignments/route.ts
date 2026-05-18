import { NextResponse } from "next/server";
import { supabase, generateId } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("no token");
    const payload = verifyToken(authHeader.slice(7));
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { courseId, title, description, dueDate } = await request.json();
    if (!courseId || !title) {
      return NextResponse.json({ error: "Course ID and title are required" }, { status: 400 });
    }

    const id = generateId();
    const { error } = await supabase.from("assignments").insert({
      id,
      course_id: courseId,
      title,
      description: description || null,
      due_date: dueDate || null,
    });
    if (error) throw error;

    return NextResponse.json({ assignment: { id, courseId, title, description, dueDate } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
