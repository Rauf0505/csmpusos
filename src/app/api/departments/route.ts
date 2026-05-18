import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function GET() {
  const { data: departments, error } = await supabase
    .from("departments")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw error;

  return NextResponse.json({ departments: departments || [] });
}
