import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { data: complaint, error } = await supabase
      .from("complaints")
      .select("*, users(name)")
      .eq("id", params.id)
      .maybeSingle();

    if (error) throw error;

    if (!complaint) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      complaint: {
        id: complaint.id,
        userId: complaint.user_id,
        userName: complaint.users?.name,
        title: complaint.title,
        status: complaint.status,
        description: complaint.description,
        attachment: complaint.attachment,
        createdAt: complaint.created_at,
        updatedAt: complaint.updated_at,
      },
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("no token");
    const payload = verifyToken(authHeader.slice(7));
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { data: existing, error: fetchError } = await supabase
      .from("complaints")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { status, title, description, attachment } = await request.json();

    const { error } = await supabase
      .from("complaints")
      .update({
        status: status || existing.status,
        title: title || existing.title,
        description: description || existing.description,
        attachment: attachment !== undefined ? attachment : existing.attachment,
        updated_at: new Date().toISOString(),
      })
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
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { error } = await supabase
      .from("complaints")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ message: "Deleted" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
