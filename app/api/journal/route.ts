import { desc } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { journalEntries } from "../../../db/schema";

export async function GET() {
  try {
    const entries = await getDb().select().from(journalEntries).orderBy(desc(journalEntries.happenedAt), desc(journalEntries.id));
    return Response.json({ entries: entries.map((entry) => ({ ...entry, imageUrl: entry.imageKey ? `/api/journal/${entry.id}/image` : null })) });
  } catch (error) {
    return Response.json({ entries: [], warning: error instanceof Error ? error.message : "Database unavailable" });
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const title = String(form.get("title") || "").trim();
    const story = String(form.get("story") || "").trim();
    const lesson = String(form.get("lesson") || "").trim();
    const author = String(form.get("author") || "Mahtab & Tom").trim();
    const happenedAt = String(form.get("happenedAt") || new Date().toISOString().slice(0, 10));
    const phaseId = Number(form.get("phaseId"));
    if (!title || !story || !Number.isInteger(phaseId)) return Response.json({ error: "عنوان، متن و فاز الزامی است" }, { status: 400 });

    const image = form.get("image");
    let imageKey: string | null = null;
    let imageType: string | null = null;
    if (image instanceof File && image.size) {
      if (image.size > 8 * 1024 * 1024) return Response.json({ error: "حداکثر حجم عکس ۸ مگابایت است" }, { status: 400 });
      if (!image.type.startsWith("image/")) return Response.json({ error: "فایل باید تصویر باشد" }, { status: 400 });
      imageKey = `journal/${crypto.randomUUID()}-${image.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      imageType = image.type;
      await env.MEDIA.put(imageKey, image.stream(), { httpMetadata: { contentType: image.type } });
    }
    const [entry] = await getDb().insert(journalEntries).values({ phaseId, title, story, lesson, author, happenedAt, imageKey, imageType }).returning();
    return Response.json({ entry: { ...entry, imageUrl: imageKey ? `/api/journal/${entry.id}/image` : null } }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "ثبت خاطره انجام نشد" }, { status: 500 });
  }
}
