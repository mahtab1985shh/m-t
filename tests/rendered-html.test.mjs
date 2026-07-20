import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("roadmap contains all thirteen founder phases", async () => {
  const data = await readFile(new URL("lib/roadmap-data.ts", root), "utf8");
  const phaseCalls = [...data.matchAll(/\bp\((\d+),/g)].map(match => Number(match[1]));
  assert.deepEqual(phaseCalls, Array.from({ length: 13 }, (_, index) => index));
  assert.match(data, /هم‌راستایی بنیان‌گذاران/);
  assert.match(data, /رشد بلندمدت/);
});

test("database supports durable progress and visual journals", async () => {
  const schema = await readFile(new URL("db/schema.ts", root), "utf8");
  assert.match(schema, /phase_checks/);
  assert.match(schema, /journal_entries/);
  assert.match(schema, /imageKey/);
  const hosting = JSON.parse(await readFile(new URL(".openai/hosting.json", root), "utf8"));
  assert.equal(hosting.d1, "DB");
  assert.equal(hosting.r2, "MEDIA");
});

test("finished interface has no starter-preview markers", async () => {
  const [page, layout] = await Promise.all([readFile(new URL("app/page.tsx", root), "utf8"), readFile(new URL("app/layout.tsx", root), "utf8")]);
  assert.doesNotMatch(page + layout, /SkeletonPreview|codex-preview|Starter Project/);
  assert.match(page, /RoadmapApp/);
  assert.match(layout, /lang="fa" dir="rtl"/);
});
