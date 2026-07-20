import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../../../db";
import { journalEntries } from "../../../../../db/schema";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const [entry] = await getDb().select().from(journalEntries).where(eq(journalEntries.id, Number(id))).limit(1);
  if (!entry?.imageKey) return new Response("Not found", { status: 404 });
  const object = await env.MEDIA.get(entry.imageKey);
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.body, { headers: { "Content-Type": entry.imageType || "image/jpeg", "Cache-Control": "public, max-age=86400" } });
}
