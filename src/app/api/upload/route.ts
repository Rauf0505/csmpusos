import { NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "bin";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const response = await imagekit.files.upload({
      file,
      fileName,
      folder: "/complaints",
      useUniqueFileName: false,
    });

    return NextResponse.json({ url: response.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("ImageKit upload error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
