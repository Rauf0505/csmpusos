import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { verifyActiveToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyActiveToken(authHeader.slice(7));
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    type ClassRow = { id: string; name: string; department_id: string; department_name: string; semester: string };
    let classes: ClassRow[] = [];

    if (payload.role === "teacher") {
      const { data: tcData } = await supabase
        .from("teacher_classes")
        .select("class_id")
        .eq("teacher_id", payload.id);
      const ids = (tcData || []).map((r) => r.class_id);
      if (ids.length > 0) {
        const { data: cls } = await supabase
          .from("classes")
          .select("id, name, department_id, department:departments!inner(name), semester")
          .in("id", ids)
          .order("name", { ascending: true });
        classes = (cls || []).map((c) => ({
          id: c.id,
          name: c.name,
          department_id: c.department_id,
          department_name: (c.department as unknown as { name: string })?.name || "",
          semester: c.semester,
        }));
      }
    } else if (payload.role === "department-head") {
      const { data: cls } = await supabase
        .from("classes")
        .select("id, name, department_id, department:departments!inner(name), semester")
        .eq("departments.name", payload.department)
        .order("name", { ascending: true });
      classes = (cls || []).map((c) => ({
        id: c.id,
        name: c.name,
        department_id: c.department_id,
        department_name: (c.department as unknown as { name: string })?.name || "",
        semester: c.semester,
      }));
    } else if (payload.role === "student") {
      const { data: scData } = await supabase
        .from("student_classes")
        .select("class_id")
        .eq("student_id", payload.id);
      const ids = (scData || []).map((r) => r.class_id);
      if (ids.length > 0) {
        const { data: cls } = await supabase
          .from("classes")
          .select("id, name, department_id, department:departments!inner(name), semester")
          .in("id", ids)
          .order("name", { ascending: true });
        classes = (cls || []).map((c) => ({
          id: c.id,
          name: c.name,
          department_id: c.department_id,
          department_name: (c.department as unknown as { name: string })?.name || "",
          semester: c.semester,
        }));
      }
    }

    return NextResponse.json({ classes });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
