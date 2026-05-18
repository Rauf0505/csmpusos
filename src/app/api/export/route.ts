import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const payload = verifyToken(authHeader.slice(7));
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "complaints";

    let csv = "";
    let filename = "";

    if (type === "complaints") {
      const { data: complaints } = await supabase
        .from("complaints")
        .select("id, title, status, description, created_at, user_id")
        .order("created_at", { ascending: false });

      const userIds = Array.from(new Set((complaints || []).map((c) => c.user_id)));
      const { data: users } = await supabase
        .from("users")
        .select("id, name")
        .in("id", userIds);
      const userMap = Object.fromEntries((users || []).map((u) => [u.id, u.name]));

      csv = "ID,Student,Title,Status,Description,Created At\n";
      for (const c of complaints || []) {
        csv += `"${c.id}","${userMap[c.user_id] || ""}","${(c.title || "").replace(/"/g, '""')}","${c.status}","${(c.description || "").replace(/"/g, '""')}","${c.created_at}"\n`;
      }
      filename = "complaints-export.csv";
    } else if (type === "students") {
      const { data: rows } = await supabase
        .from("users")
        .select("id, name, email, role, department, student_id, is_active, created_at")
        .eq("role", "student")
        .order("created_at", { ascending: false });
      csv = "ID,Name,Email,Role,Department,Student ID,Active,Created At\n";
      for (const r of rows || []) {
        csv += `"${r.id}","${r.name}","${r.email}","${r.role}","${r.department || ""}","${r.student_id || ""}","${r.is_active ? "Yes" : "No"}","${r.created_at}"\n`;
      }
      filename = "students-export.csv";
    } else {
      return NextResponse.json({ error: "Invalid type. Use 'complaints' or 'students'" }, { status: 400 });
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
