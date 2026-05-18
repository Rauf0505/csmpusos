import { supabase, generateId } from "../src/lib/db";
import bcrypt from "bcryptjs";

function generateInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const seedUsers = [
  { name: "Ali Khan", email: "ali@campus.edu", password: "password123", role: "student", studentId: "CS-001" },
  { name: "Dr. S. Ahmed", email: "s.ahmed@campus.edu", password: "password123", role: "admin" },
  { name: "Prof. Usman", email: "usman@campus.edu", password: "password123", role: "teacher", department: "Computer Science" },
  { name: "Dr. Ayesha", email: "ayesha@campus.edu", password: "password123", role: "department-head", department: "Computer Science" },
  { name: "Fatima Zaidi", email: "fatima@campus.edu", password: "password123", role: "student", studentId: "CS-002" },
  { name: "Usman Rahim", email: "usman.r@campus.edu", password: "password123", role: "student", studentId: "CS-003" },
];

async function main() {
  console.log("Seeding users...");
  for (const data of seedUsers) {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", data.email)
      .maybeSingle();
    if (existing) {
      console.log(`  Skipped ${data.email} (already exists)`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const initials = generateInitials(data.name);

    const { error } = await supabase.from("users").insert({
      id: generateId(),
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      department: data.department || null,
      student_id: data.studentId || null,
      initials,
    });

    if (error) {
      console.error(`  Failed ${data.email}: ${error.message}`);
    } else {
      console.log(`  Created ${data.email} (${data.role})`);
    }
  }

  console.log("Seeding announcements...");
  const seedAnnouncements = [
    { title: "Final Exam Schedule Released — Summer 2025", description: "All CS students must check their exam date and time.", department: "Exam Cell", category: "Exams", priority: "Urgent", target_roles: "student", created_by: "admin" },
    { title: "Exam Form Submission Deadline — 20 May", description: "Submit your exam form before the deadline.", department: "Exam Cell", category: "Exams", priority: "Exam", target_roles: "student", created_by: "admin" },
    { title: "Annual Tech Fest Registration Open", description: "Register your team for competitions.", department: "Student Affairs", category: "Events", priority: "Event", target_roles: "student", created_by: "admin" },
  ];

  for (const a of seedAnnouncements) {
    const { error } = await supabase.from("announcements").insert({
      id: generateId(),
      title: a.title,
      description: a.description,
      department: a.department,
      category: a.category,
      priority: a.priority,
      target_roles: a.target_roles,
      created_by: a.created_by,
    });
    if (error) {
      console.error(`  Failed announcement: ${error.message}`);
    } else {
      console.log(`  Created announcement: ${a.title}`);
    }
  }

  console.log("Seeding complaints...");
  const { data: studentIds } = await supabase
    .from("users")
    .select("id")
    .eq("role", "student")
    .limit(2);

  const seedComplaints = [
    { title: "WiFi down in Hostel Block B", status: "in-review", description: "WiFi not working for 3 days." },
    { title: "Cafeteria food quality issue", status: "resolved", description: "Food quality has declined." },
    { title: "Transport bus route change", status: "pending", description: "New bus route skips hostel stop." },
  ];

  for (let i = 0; i < seedComplaints.length; i++) {
    const c = seedComplaints[i];
    const uid = (studentIds || [])[i % ((studentIds || []).length || 1)]?.id;
    if (uid) {
      const { error } = await supabase.from("complaints").insert({
        id: generateId(),
        user_id: uid,
        title: c.title,
        status: c.status,
        description: c.description,
      });
      if (error) {
        console.error(`  Failed complaint: ${error.message}`);
      } else {
        console.log(`  Created complaint: ${c.title}`);
      }
    }
  }

  console.log("Seed complete!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
