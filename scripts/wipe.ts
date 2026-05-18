import { supabase, generateId } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("=== WIPE ALL DATA (keep super admin) ===\n");

  const tables = [
    "announcement_recipients",
    "student_classes",
    "teacher_classes",
    "announcements",
    "chat_messages",
    "chat_sessions",
    "ai_documents",
    "attendance",
    "assignments",
    "courses",
    "complaints",
    "notifications",
    "classes",
    "departments",
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq("id", "none");
    if (error) {
      console.log(`  Error clearing ${table}: ${error.message}`);
    } else {
      console.log(`  Cleared: ${table}`);
    }
  }

  const adminEmails: string[] = [];
  const envEmail = process.env.SUPER_ADMIN_EMAIL;
  if (envEmail) adminEmails.push(envEmail);

  const { data: existingAdmins } = await supabase
    .from("users")
    .select("email")
    .eq("role", "admin");

  for (const a of existingAdmins || []) {
    if (!adminEmails.includes(a.email)) adminEmails.push(a.email);
  }

  if (adminEmails.length > 0) {
    const { data: keepUsers } = await supabase
      .from("users")
      .select("id")
      .in("email", adminEmails);
    const keepIds = (keepUsers || []).map((u) => u.id);
    if (keepIds.length > 0) {
      const { error } = await supabase
        .from("users")
        .delete()
        .not("id", "in", `(${keepIds.map((i) => `"${i}"`).join(",")})`);
      if (error) console.error("  Error deleting users:", error.message);
      else console.log(`  Kept admin(s): ${adminEmails.join(", ")}`);
    }
  } else {
    const { error } = await supabase.from("users").delete().neq("id", "none");
    if (error) console.error("  Error deleting users:", error.message);
    else console.log("  All users deleted");
  }

  const superEmail = process.env.SUPER_ADMIN_EMAIL || "super@admin.com";
  const superPassword = process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin@123";

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", superEmail)
    .maybeSingle();

  if (!existing) {
    const hash = await bcrypt.hash(superPassword, 12);
    const id = generateId();
    const { error } = await supabase.from("users").insert({
      id, name: "Super Admin", email: superEmail, password: hash, role: "admin", initials: "SA",
    });
    if (error) console.error(`  Error creating super admin: ${error.message}`);
    else console.log(`\n  Created super admin: ${superEmail}`);
  } else {
    console.log(`\n  Super admin exists: ${superEmail}`);
  }

  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  console.log(`\n=== WIPE COMPLETE — ${count || 0} user(s) remain (super admin only) ===`);
}

main().catch((e) => { console.error(e); process.exit(1); });
