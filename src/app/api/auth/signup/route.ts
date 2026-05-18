import { NextResponse } from "next/server";
import { supabase, generateId } from "@/lib/db";
import { hashPassword, signToken, generateInitials } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password, role, department, studentId } = await request.json();

    const validRoles = ["student", "teacher", "department-head"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (role === "admin") {
      return NextResponse.json({ error: "Admin cannot be created via signup" }, { status: 403 });
    }

    const { data: existing } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const initials = generateInitials(name);
    const id = generateId();

    const { error: insertErr } = await supabase.from("users").insert({
      id,
      name,
      email,
      password: hashedPassword,
      role,
      department,
      student_id: studentId,
      initials,
    });
    if (insertErr) throw insertErr;

    const user = { id, name, email, role, department, studentId, initials };

    const token = signToken({ id, email, role, name, department: department || null });

    return NextResponse.json({ user, token }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
