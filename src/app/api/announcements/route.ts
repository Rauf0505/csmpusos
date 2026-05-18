import { NextResponse } from "next/server";
import { supabase, generateId } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

function getCreator(token: string | null) {
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const department = searchParams.get("department");
    const classId = searchParams.get("classId");

    const authHeader = request.headers.get("authorization");
    const viewer = getCreator(authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);

    // Determine visible announcement IDs based on role
    let visibleIds: string[] | null = null;

    if (role) {
      const roleMatch = `target_roles.is.null,target_roles.eq.all,target_roles.ilike.%${role}%`;

      if (role === "admin") {
        const { data: ids } = await supabase
          .from("announcements")
          .select("id")
          .not("visibility_type", "is", null)
          .or(roleMatch);
        visibleIds = (ids || []).map((a) => a.id);
      } else if (role === "department-head" && viewer?.department) {
        const [globalRows, deptRows] = await Promise.all([
          supabase.from("announcements").select("id").eq("visibility_type", "global").not("visibility_type", "is", null).or(roleMatch),
          supabase.from("announcements").select("id").eq("visibility_type", "department").eq("department", viewer.department).or(roleMatch),
        ]);

        const { data: deptData } = await supabase
          .from("departments")
          .select("id")
          .eq("name", viewer.department)
          .maybeSingle();

        let classAnnIds: string[] = [];
        if (deptData) {
          const { data: classes } = await supabase
            .from("classes")
            .select("id")
            .eq("department_id", deptData.id);
          const classIds = (classes || []).map((c) => c.id);
          if (classIds.length > 0) {
            const { data: rcpts } = await supabase
              .from("announcement_recipients")
              .select("announcement_id")
              .eq("recipient_type", "class")
              .in("recipient_id", classIds);
            classAnnIds = (rcpts || []).map((r) => r.announcement_id);
          }
        }

        const allIds = new Set([
          ...(globalRows.data || []).map((a) => a.id),
          ...(deptRows.data || []).map((a) => a.id),
          ...classAnnIds,
        ]);
        visibleIds = Array.from(allIds);
      } else if (role === "teacher" && viewer?.id) {
        const [globalRows, deptRows] = await Promise.all([
          supabase.from("announcements").select("id").eq("visibility_type", "global").not("visibility_type", "is", null).or(roleMatch),
          supabase.from("announcements").select("id").eq("visibility_type", "department").eq("department", viewer.department || "").or(roleMatch),
        ]);

        const { data: tClasses } = await supabase
          .from("teacher_classes")
          .select("class_id")
          .eq("teacher_id", viewer.id);
        const classIds = (tClasses || []).map((c) => c.class_id);

        let classAnnIds: string[] = [];
        if (classIds.length > 0) {
          const { data: rcpts } = await supabase
            .from("announcement_recipients")
            .select("announcement_id")
            .eq("recipient_type", "class")
            .in("recipient_id", classIds);
          classAnnIds = (rcpts || []).map((r) => r.announcement_id);
        }

        const allIds = new Set([
          ...(globalRows.data || []).map((a) => a.id),
          ...(deptRows.data || []).map((a) => a.id),
          ...classAnnIds,
        ]);
        visibleIds = Array.from(allIds);
      } else if (role === "student") {
        const [globalRows, deptRows] = await Promise.all([
          supabase.from("announcements").select("id").eq("visibility_type", "global").not("visibility_type", "is", null).or(roleMatch),
          supabase.from("announcements").select("id").eq("visibility_type", "department").eq("department", viewer?.department || "").or(roleMatch),
        ]);

        const { data: sClasses } = await supabase
          .from("student_classes")
          .select("class_id")
          .eq("student_id", viewer?.id || "");
        const classIds = (sClasses || []).map((c) => c.class_id);

        let classAnnIds: string[] = [];
        if (classIds.length > 0) {
          const { data: rcpts } = await supabase
            .from("announcement_recipients")
            .select("announcement_id")
            .eq("recipient_type", "class")
            .in("recipient_id", classIds);
          classAnnIds = (rcpts || []).map((r) => r.announcement_id);
        }

        const allIds = new Set([
          ...(globalRows.data || []).map((a) => a.id),
          ...(deptRows.data || []).map((a) => a.id),
          ...classAnnIds,
        ]);
        visibleIds = Array.from(allIds);
      }
    }

    // Main query
    let query = supabase.from("announcements").select("*");

    if (visibleIds !== null) {
      query = query.in("id", visibleIds.length > 0 ? visibleIds : ["__none__"]);
    }

    if (category && category !== "All") {
      query = query.eq("category", category);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (department) {
      query = query.eq("department", department);
    }
    if (classId) {
      const { data: rcpts } = await supabase
        .from("announcement_recipients")
        .select("announcement_id")
        .eq("recipient_type", "class")
        .eq("recipient_id", classId);
      const classAnnIds = (rcpts || []).map((r) => r.announcement_id);
      query = query.in("id", classAnnIds.length > 0 ? classAnnIds : ["__none__"]);
    }

    query = query.order("created_at", { ascending: false });

    const { data: announcements, error } = await query;
    if (error) throw error;

    // Fetch recipients for all returned announcements
    const annIds = (announcements || []).map((a) => a.id);
    const { data: rcpts } = annIds.length > 0
      ? await supabase.from("announcement_recipients")
          .select("announcement_id, recipient_type, recipient_id")
          .in("announcement_id", annIds)
      : { data: [] };

    const recipientsMap: Record<string, { recipient_type: string; recipient_id: string | null }[]> = {};
    for (const r of rcpts || []) {
      if (!recipientsMap[r.announcement_id]) recipientsMap[r.announcement_id] = [];
      recipientsMap[r.announcement_id].push({
        recipient_type: r.recipient_type,
        recipient_id: r.recipient_id,
      });
    }

    return NextResponse.json({
      announcements: (announcements || []).map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        department: a.department,
        category: a.category,
        priority: a.priority,
        targetRoles: a.target_roles?.split(",").filter(Boolean) || [],
        createdBy: a.created_by,
        creatorRole: a.creator_role,
        visibilityType: a.visibility_type || "department",
        recipients: recipientsMap[a.id] || [],
        date: a.created_at,
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

    const { title, description, category, priority, targetRoles, visibilityType, recipients } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const id = generateId();
    const targetStr = Array.isArray(targetRoles) ? targetRoles.join(",") : (targetRoles || "student");
    const visType = visibilityType || (payload.role === "admin" ? "global" : "department");

    if (payload.role === "teacher" && visType !== "class") {
      return NextResponse.json({ error: "Teachers can only post class announcements" }, { status: 403 });
    }
    if (payload.role === "department-head" && visType === "global") {
      return NextResponse.json({ error: "HOD cannot post global announcements" }, { status: 403 });
    }

    const deptName = payload.department || "Administration";

    const { error: insertError } = await supabase.from("announcements").insert({
      id,
      title,
      description,
      department: deptName,
      category: category || "All",
      priority: priority || "Normal",
      target_roles: targetStr,
      created_by: payload.id,
      creator_role: payload.role,
      visibility_type: visType,
    });

    if (insertError) throw insertError;

    if (recipients && Array.isArray(recipients)) {
      for (const r of recipients) {
        const { error: rcptError } = await supabase.from("announcement_recipients").insert({
          id: generateId(),
          announcement_id: id,
          recipient_type: r.recipient_type,
          recipient_id: r.recipient_id || null,
        });
        if (rcptError) throw rcptError;
      }
    } else {
      if (visType === "global") {
        await supabase.from("announcement_recipients").insert({
          id: generateId(),
          announcement_id: id,
          recipient_type: "all",
          recipient_id: null,
        });
      } else if (visType === "department") {
        const { data: deptRow } = await supabase
          .from("departments")
          .select("id")
          .eq("name", deptName)
          .maybeSingle();
        if (deptRow) {
          await supabase.from("announcement_recipients").insert({
            id: generateId(),
            announcement_id: id,
            recipient_type: "department",
            recipient_id: deptRow.id,
          });
        }
      }
    }

    return NextResponse.json({
      announcement: {
        id, title, description, department: deptName,
        category: category || "All", priority: priority || "Normal",
        targetRoles: targetStr.split(","), createdBy: payload.id,
        creatorRole: payload.role, visibilityType: visType,
        recipients: recipients || [],
        date: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
