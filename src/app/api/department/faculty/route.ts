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

    const { data: faculty } = await supabase
      .from("users")
      .select("name, email, department")
      .eq("role", "teacher")
      .eq("department", payload.department)
      .order("name", { ascending: true });

    return NextResponse.json({ faculty: faculty || [] });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
