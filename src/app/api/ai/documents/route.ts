import { NextResponse } from "next/server";
import { supabase, generateId } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";

export async function GET() {
  try {
    const { data: docs } = await supabase
      .from("ai_documents")
      .select("*")
      .order("uploaded_at", { ascending: false });

    return NextResponse.json({
      documents: (docs || []).map((d) => ({
        id: d.id,
        fileName: d.file_name,
        fileSize: d.file_size || "0 KB",
        uploadDate: d.uploaded_at,
        status: d.status as "indexed" | "processing",
      })),
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

async function extractText(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === "docx") {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  return await file.text();
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const payload = verifyToken(authHeader.slice(7));
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const id = generateId();
    const fileName = file.name;
    const fileSize = `${(file.size / 1024).toFixed(0)} KB`;
    const text = await extractText(file);

    await supabase.from("ai_documents").insert({
      id,
      file_name: fileName,
      file_size: fileSize,
      extracted_text: text,
      status: "indexed",
    });

    return NextResponse.json({
      document: { id, fileName, fileSize, status: "indexed", uploadDate: new Date().toISOString() },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
