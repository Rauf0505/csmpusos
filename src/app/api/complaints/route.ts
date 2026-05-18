import { NextResponse } from "next/server";
import { supabase, generateId } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const userId = searchParams.get("userId");

    let query = supabase
      .from("complaints")
      .select("*, users(name)");

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,users.name.ilike.%${search}%`);
    }

    if (userId) {
      query = query.eq("user_id", userId);
    }

    query = query.order("created_at", { ascending: false });

    const { data: complaints, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      complaints: (complaints || []).map((c: { id: string; user_id: string; users: { name: string } | null; title: string; status: string; description: string; attachment: string | null; created_at: string; updated_at: string }) => ({
        id: c.id,
        userId: c.user_id,
        userName: c.users?.name,
        title: c.title,
        status: c.status,
        description: c.description,
        attachment: c.attachment,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
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
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { title, description, attachment } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const id = generateId();

    const { error } = await supabase.from("complaints").insert({
      id,
      user_id: payload.id,
      title,
      description,
      attachment: attachment || null,
    });

    if (error) throw error;

    return NextResponse.json({
      complaint: {
        id,
        userId: payload.id,
        userName: payload.name,
        title,
        status: "pending",
        description,
        attachment: attachment || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
