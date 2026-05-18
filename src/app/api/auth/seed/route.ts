import { NextResponse } from "next/server";
import { supabase, generateId } from "@/lib/db";
import { hashPassword, generateInitials } from "@/lib/auth";

const seedUsers = [
  { name: "Ali Khan", email: "ali@campus.edu", password: "password123", role: "student", studentId: "CS-001" },
  { name: "Prof. Usman", email: "usman@campus.edu", password: "password123", role: "teacher", department: "Computer Science" },
  { name: "Dr. Ayesha", email: "ayesha@campus.edu", password: "password123", role: "department-head", department: "Computer Science" },
  { name: "Fatima Zaidi", email: "fatima@campus.edu", password: "password123", role: "student", studentId: "CS-002" },
  { name: "Usman Rahim", email: "usman.r@campus.edu", password: "password123", role: "student", studentId: "CS-003" },
];

export async function POST() {
  try {
    const created: { id: string; name: string; email: string; role: string; initials: string }[] = [];

    for (const data of seedUsers) {
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", data.email)
        .maybeSingle();

      if (existing) continue;

      const hashedPassword = await hashPassword(data.password);
      const initials = generateInitials(data.name);
      const id = generateId();

      const { error } = await supabase.from("users").insert({
        id,
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        department: data.department || null,
        student_id: data.studentId || null,
        initials,
      });

      if (error) throw error;

      created.push({ id, name: data.name, email: data.email, role: data.role, initials });
    }

    return NextResponse.json({ message: `Seeded ${created.length} users`, users: created });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
