import { and, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { phaseChecks } from "../../../db/schema";

export async function GET() {
  try {
    return Response.json({ checks: await getDb().select().from(phaseChecks) });
  } catch (error) {
    return Response.json({ checks: [], warning: error instanceof Error ? error.message : "Database unavailable" });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json() as { phaseId?: number; itemKey?: string; checked?: boolean };
    if (!Number.isInteger(body.phaseId) || !body.itemKey) return Response.json({ error: "اطلاعات ناقص است" }, { status: 400 });
    const db = getDb();
    const existing = await db.select().from(phaseChecks).where(and(eq(phaseChecks.phaseId, body.phaseId!), eq(phaseChecks.itemKey, body.itemKey))).limit(1);
    if (existing.length) {
      await db.update(phaseChecks).set({ checked: Boolean(body.checked), updatedAt: new Date().toISOString() }).where(eq(phaseChecks.id, existing[0].id));
    } else {
      await db.insert(phaseChecks).values({ phaseId: body.phaseId!, itemKey: body.itemKey, checked: Boolean(body.checked) });
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "ذخیره انجام نشد" }, { status: 500 });
  }
}
