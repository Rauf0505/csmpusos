import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();

    const { data: user } = await supabase.from("users").select("*").eq("email", email).single();
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: "Account is deactivated" }, { status: 403 });
    }

    if (user.role !== role) {
      return NextResponse.json({ error: "Invalid role for this account" }, { status: 403 });
    }

    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.student_id,
        initials: user.initials,
      },
      token,
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
