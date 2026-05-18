import { NextResponse } from "next/server";
import { supabase, generateId } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { data: announcement, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();

    if (error) throw error;
    if (!announcement) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: recipients } = await supabase
      .from("announcement_recipients")
      .select("recipient_type, recipient_id")
      .eq("announcement_id", params.id);

    return NextResponse.json({
      announcement: {
        id: announcement.id,
        title: announcement.title,
        description: announcement.description,
        department: announcement.department,
        category: announcement.category,
        priority: announcement.priority,
        targetRoles: announcement.target_roles?.split(",").filter(Boolean) || [],
        createdBy: announcement.created_by,
        creatorRole: announcement.creator_role,
        visibilityType: announcement.visibility_type || "department",
        recipients: recipients || [],
        date: announcement.created_at,
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
      .from("announcements")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { title, description, department, category, priority, targetRoles, visibilityType, recipients } = await request.json();
    const targetStr = Array.isArray(targetRoles) ? targetRoles.join(",") : (targetRoles || existing.target_roles);
    const visType = visibilityType || existing.visibility_type || "department";

    const { error: updateError } = await supabase
      .from("announcements")
      .update({
        title: title || existing.title,
        description: description || existing.description,
        department: department || existing.department,
        category: category || existing.category,
        priority: priority || existing.priority,
        target_roles: targetStr,
        visibility_type: visType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (updateError) throw updateError;

    // Replace recipients
    await supabase.from("announcement_recipients").delete().eq("announcement_id", params.id);

    if (recipients && Array.isArray(recipients)) {
      for (const r of recipients) {
        await supabase.from("announcement_recipients").insert({
          id: generateId(),
          announcement_id: params.id,
          recipient_type: r.recipient_type,
          recipient_id: r.recipient_id || null,
        });
      }
    }

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
      .from("announcements")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ message: "Deleted" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
