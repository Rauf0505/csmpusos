import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { verifyToken, hashPassword } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("no token");
    const payload = verifyToken(authHeader.slice(7));
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, string | number | boolean | null> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.email !== undefined) updates.email = body.email;
    if (body.role !== undefined) updates.role = body.role;
    if (body.department !== undefined) updates.department = body.department;
    if (body.studentId !== undefined) updates.student_id = body.studentId;
    if (body.isActive !== undefined) updates.is_active = body.isActive ? 1 : 0;
    if (body.password) updates.password = await hashPassword(body.password);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", params.id);

    if (error) throw error;

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
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data: deleted, error } = await supabase
      .from("users")
      .delete()
      .eq("id", params.id)
      .select();

    if (error) throw error;

    if (!deleted || deleted.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
