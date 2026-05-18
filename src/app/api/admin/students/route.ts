import { NextResponse } from "next/server";
import { supabase, generateId } from "@/lib/db";
import { verifyToken, hashPassword, generateInitials } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    let query = supabase
      .from("users")
      .select("id, name, email, role, department, student_id, initials, is_active, created_at");

    if (role && role !== "all") {
      query = query.eq("role", role);
    }

    query = query.order("created_at", { ascending: false });

    const { data: users, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      users: (users || []).map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        studentId: u.student_id,
        initials: u.initials,
        isActive: u.is_active === 1 || u.is_active === true,
        createdAt: u.created_at,
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
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, email, password, role, department, studentId } = await request.json();

    const validRoles = ["student", "teacher", "department-head"];
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "name, email, password, and role are required" }, { status: 400 });
    }
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (role === "admin") {
      return NextResponse.json({ error: "Cannot create admin users" }, { status: 403 });
    }

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const initials = generateInitials(name);
    const id = generateId();

    const { error } = await supabase.from("users").insert({
      id,
      name,
      email,
      password: hashedPassword,
      role,
      department: department || null,
      student_id: studentId || null,
      initials,
    });

    if (error) throw error;

    return NextResponse.json({
      user: { id, name, email, role, department, studentId, initials, isActive: true },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
