import { NextResponse } from "next/server";
import { apiUser, apiError, sameOrigin } from "@/lib/api";
import { randomUUID } from "node:crypto";
const allowed: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "text/plain": "txt",
  "text/csv": "csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const { db, user } = await apiUser();
    const form = await request.formData();
    const bucket =
      form.get("bucket") === "portfolio" ? "portfolio" : "business-files";
    const { data: can } = await db.rpc("has_permission", {
      requested: bucket === "portfolio" ? "portfolio.write" : "files.write",
    });
    if (!can) throw new Error("PERMISSION_DENIED");
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0 || file.size > 10485760)
      throw new Error("Choose a non-empty file up to 10 MB.");
    const ext = allowed[file.type];
    if (!ext || (bucket === "portfolio" && !file.type.startsWith("image/")))
      throw new Error("This file type is not supported.");
    const buffer = Buffer.from(await file.arrayBuffer());
    const valid =
      file.type === "image/jpeg"
        ? buffer[0] === 255 && buffer[1] === 216
        : file.type === "image/png"
          ? buffer
              .subarray(0, 8)
              .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          : file.type === "image/webp"
            ? buffer.toString("ascii", 0, 4) === "RIFF" &&
              buffer.toString("ascii", 8, 12) === "WEBP"
            : file.type === "application/pdf"
              ? buffer.toString("ascii", 0, 5) === "%PDF-"
              : ext === "docx" || ext === "xlsx"
                ? buffer[0] === 80 && buffer[1] === 75
                : !buffer.includes(0);
    if (!valid) throw new Error("The file contents do not match its type.");
    const path = user.id + "/" + randomUUID() + "." + ext;
    const { error } = await db.storage
      .from(bucket)
      .upload(path, buffer, { contentType: file.type, upsert: false });
    if (error) throw new Error(error.message);
    if (bucket === "portfolio") {
      const { data } = db.storage.from(bucket).getPublicUrl(path);
      return NextResponse.json(
        { mediaUrl: data.publicUrl, path },
        { status: 201 },
      );
    }
    const name = String(form.get("name") || file.name)
      .trim()
      .slice(0, 200);
    const { data, error: e } = await db
      .from("files")
      .insert({
        name,
        folder: String(form.get("folder") || "").slice(0, 200) || null,
        storage_path: path,
        mime_type: file.type,
        size_bytes: file.size,
        client_id: form.get("client_id") || null,
        project_id: form.get("project_id") || null,
      })
      .select("id")
      .single();
    if (e) {
      await db.storage.from(bucket).remove([path]);
      throw new Error(e.message);
    }
    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
