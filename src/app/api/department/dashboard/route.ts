import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { verifyActiveToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyActiveToken(authHeader.slice(7));
    if (!payload || payload.role !== "department-head") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const dept = payload.department;

    const { count: totalTeachers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "teacher")
      .eq("department", dept);

    const { count: totalStudents } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "student")
      .eq("department", dept);

    const { count: totalCourses } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("department", dept);

    const { count: recentAnnouncements } = await supabase
      .from("announcements")
      .select("*", { count: "exact", head: true })
      .or(`visibility_type.eq.global,and(visibility_type.eq.department,department.eq.${dept})`);

    const { data: allFaculty } = await supabase
      .from("users")
      .select("id, name, email, department")
      .eq("role", "teacher")
      .eq("department", dept)
      .order("name", { ascending: true });

    const { data: coursesForFaculty } = await supabase
      .from("courses")
      .select("teacher_id, id")
      .eq("department", dept);

    const courseCountByTeacher = new Map<string, number>();
    for (const c of coursesForFaculty ?? []) {
      courseCountByTeacher.set(c.teacher_id, (courseCountByTeacher.get(c.teacher_id) ?? 0) + 1);
    }

    const facultyMapped = (allFaculty ?? []).map((f) => ({
      name: f.name,
      email: f.email,
      department: f.department,
      course_count: courseCountByTeacher.get(f.id) ?? 0,
      student_count: totalStudents ?? 0,
    }));

    const { data: announcements } = await supabase
      .from("announcements")
      .select("id, title, description, priority, category, created_at")
      .or(`visibility_type.eq.global,and(visibility_type.eq.department,department.eq.${dept})`)
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: students } = await supabase
      .from("users")
      .select("name, email, student_id")
      .eq("role", "student")
      .eq("department", dept)
      .order("name", { ascending: true });

    return NextResponse.json({
      stats: {
        totalTeachers: totalTeachers ?? 0,
        totalStudents: totalStudents ?? 0,
        totalCourses: totalCourses ?? 0,
        announcements: recentAnnouncements ?? 0,
      },
      faculty: facultyMapped.map((f) => ({
        name: f.name,
        email: f.email,
        department: f.department,
        courses: f.course_count,
        students: f.student_count,
      })),
      students: students ?? [],
      announcements: announcements ?? [],
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
