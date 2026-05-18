import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const departmentId = searchParams.get("departmentId");

  let query = supabase
    .from("classes")
    .select("*, department:departments(name)");

  if (departmentId) {
    query = query.eq("department_id", departmentId);
  }

  query = query.order("name", { ascending: true });

  const { data, error } = await query;
  if (error) throw error;

  const classes = (data || []).map(({ department, ...rest }) => ({
    ...rest,
    department_name: department?.name ?? null,
  }));

  return NextResponse.json({ classes });
}
