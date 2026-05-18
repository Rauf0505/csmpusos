import { NextResponse } from "next/server";
import { supabase, generateId } from "@/lib/db";
import { verifyToken, hashPassword, generateInitials } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const payload = verifyToken(authHeader.slice(7));
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV must have a header row and at least one data row" }, { status: 400 });
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = headers.indexOf("name");
    const emailIdx = headers.indexOf("email");
    const passwordIdx = headers.indexOf("password");
    const roleIdx = headers.indexOf("role");
    const deptIdx = headers.indexOf("department");
    const studentIdIdx = headers.indexOf("studentid");
    const classIdx = headers.indexOf("class");

    if (nameIdx === -1 || emailIdx === -1 || passwordIdx === -1 || roleIdx === -1) {
      return NextResponse.json({
        error: "CSV must have columns: name, email, password, role (optional: department, studentId, class)",
      }, { status: 400 });
    }

    const validRoles = ["student", "teacher", "department-head"];

    const classCache: Record<string, string | null> = {};

    const resolveClass = async (name: string, deptName?: string): Promise<string | null> => {
      const key = `${deptName || ""}::${name}`;
      if (classCache[key] !== undefined) return classCache[key];

      let query = supabase.from("classes").select("id").eq("name", name);
      if (deptName) {
        const { data: dept } = await supabase
          .from("departments")
          .select("id")
          .eq("name", deptName)
          .maybeSingle();
        if (dept) {
          query = query.eq("department_id", dept.id);
        } else {
          classCache[key] = null;
          return null;
        }
      }

      const { data } = await query.maybeSingle();
      classCache[key] = data ? data.id : null;
      return classCache[key];
    };

    const results: { row: number; email: string; status: string; error?: string }[] = [];
    const insertBatch: { name: string; email: string; password: string; role: string; department: string | null; studentId: string | null; className: string | null }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      const name = cols[nameIdx] || "";
      const email = cols[emailIdx] || "";
      const password = cols[passwordIdx] || "";
      const role = cols[roleIdx] || "";
      const department = deptIdx !== -1 ? (cols[deptIdx] || null) : null;
      const studentId = studentIdIdx !== -1 ? (cols[studentIdIdx] || null) : null;
      const className = classIdx !== -1 ? (cols[classIdx] || null) : null;

      if (!name || !email || !password || !role) {
        results.push({ row: i + 1, email, status: "skipped", error: "Missing required fields" });
        continue;
      }

      if (!validRoles.includes(role)) {
        results.push({ row: i + 1, email, status: "skipped", error: `Invalid role '${role}'. Must be one of: ${validRoles.join(", ")}` });
        continue;
      }

      if (!email.includes("@")) {
        results.push({ row: i + 1, email, status: "skipped", error: "Invalid email" });
        continue;
      }

      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        results.push({ row: i + 1, email, status: "skipped", error: "Email already exists" });
        continue;
      }

      insertBatch.push({ name, email, password, role, department, studentId, className });
      results.push({ row: i + 1, email, status: "pending" });
    }

    const hashedBatch = await Promise.all(
      insertBatch.map(async (row) => ({
        ...row,
        hashedPassword: await hashPassword(row.password),
        initials: generateInitials(row.name),
        id: generateId(),
      }))
    );

    let imported = 0;
    for (const row of hashedBatch) {
      const { error: userError } = await supabase.from("users").insert({
        id: row.id,
        name: row.name,
        email: row.email,
        password: row.hashedPassword,
        role: row.role,
        department: row.department,
        student_id: row.studentId,
        initials: row.initials,
      });
      if (userError) throw userError;

      if (row.className && row.role === "student") {
        const clsId = await resolveClass(row.className, row.department || undefined);
        if (clsId) {
          const { error: scError } = await supabase.from("student_classes").upsert(
            { student_id: row.id, class_id: clsId },
            { onConflict: "student_id,class_id", ignoreDuplicates: true }
          );
          if (scError) throw scError;
        }
      }

      if (row.className && row.role === "teacher") {
        const clsId = await resolveClass(row.className, row.department || undefined);
        if (clsId) {
          const { error: tcError } = await supabase.from("teacher_classes").upsert(
            { teacher_id: row.id, class_id: clsId },
            { onConflict: "teacher_id,class_id", ignoreDuplicates: true }
          );
          if (tcError) throw tcError;
        }
      }

      imported++;
    }

    for (const r of results) {
      if (r.status === "pending") r.status = "imported";
    }

    return NextResponse.json({ imported, total: lines.length - 1, results });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
