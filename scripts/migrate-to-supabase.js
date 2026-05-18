const { createClient } = require('@supabase/supabase-js');
const Database = require('better-sqlite3');
const path = require('path');

const SUPABASE_URL = 'https://dazayalecwxzqwlbdcun.supabase.co';
const SUPABASE_KEY = 'sb_publishable_wOVI620DZNS4QWY_HCqYiA_SdNJbcRw';

const sqliteDb = new Database(path.join(__dirname, '..', 'campusos.db'));
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Only insert columns that exist in Supabase schema
const TABLE_COLUMNS = {
  users: ['id', 'name', 'email', 'password', 'role', 'department', 'student_id', 'initials', 'is_active', 'created_at', 'updated_at'],
  departments: ['id', 'name', 'created_at'],
  complaints: ['id', 'user_id', 'title', 'status', 'description', 'attachment', 'created_at', 'updated_at'],
  announcements: ['id', 'title', 'description', 'department', 'category', 'priority', 'target_roles', 'created_by', 'visibility_type', 'creator_role', 'created_at', 'updated_at'],
  ai_documents: ['id', 'file_name', 'file_url', 'file_size', 'extracted_text', 'status', 'uploaded_at'],
  chat_sessions: ['id', 'user_id', 'title', 'created_at', 'updated_at'],
  chat_messages: ['id', 'session_id', 'role', 'content', 'source_doc', 'created_at'],
  courses: ['id', 'name', 'code', 'teacher_id', 'department', 'semester', 'credits', 'schedule', 'room', 'color', 'created_at'],
  assignments: ['id', 'course_id', 'title', 'description', 'due_date', 'file_url', 'created_at'],
  attendance: ['id', 'course_id', 'student_id', 'date', 'status', 'marked_by', 'created_at'],
  notifications: ['id', 'user_id', 'title', 'message', 'type', 'is_read', 'link', 'created_at'],
  classes: ['id', 'name', 'department_id', 'semester', 'created_at'],
  teacher_classes: ['teacher_id', 'class_id'],
  student_classes: ['student_id', 'class_id'],
  announcement_recipients: ['id', 'announcement_id', 'recipient_type', 'recipient_id', 'created_at'],
};

const BATCH_SIZE = 20;

async function migrateTable(table, orderBy = 'created_at ASC') {
  const columns = TABLE_COLUMNS[table];
  if (!columns) { console.log(`  ${table}: no column config, skipping`); return; }

  const colList = columns.join(', ');
  const rows = sqliteDb.prepare(`SELECT ${colList} FROM ${table} ORDER BY ${orderBy}`).all();
  if (rows.length === 0) { console.log(`  ${table}: 0 rows, skipping`); return; }

  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from(table).insert(batch);
    if (error) {
      process.stdout.write(`x`);
      failed += batch.length;
    } else {
      process.stdout.write(`.`);
      inserted += batch.length;
    }
  }
  console.log(`  ${table}: ${inserted} inserted, ${failed} failed`);
}

async function main() {
  const order = [
    ['users', 'created_at ASC'],
    ['departments', 'created_at ASC'],
    ['complaints', 'created_at ASC'],
    ['announcements', 'created_at ASC'],
    ['ai_documents', 'uploaded_at ASC'],
    ['chat_sessions', 'created_at ASC'],
    ['chat_messages', 'created_at ASC'],
    ['courses', 'created_at ASC'],
    ['assignments', 'created_at ASC'],
    ['attendance', 'created_at ASC'],
    ['notifications', 'created_at ASC'],
    ['classes', 'created_at ASC'],
    ['teacher_classes', 'teacher_id ASC'],
    ['student_classes', 'student_id ASC'],
    ['announcement_recipients', 'created_at ASC'],
  ];

  for (const [table, orderBy] of order) {
    try {
      console.log(`Migrating ${table}...`);
      await migrateTable(table, orderBy);
    } catch (e) {
      console.error(`  ${table}: FAILED - ${e.message}`);
    }
  }

  sqliteDb.close();
  console.log('\nMigration complete!');
}

main().catch(console.error);
