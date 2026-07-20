import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const phaseChecks = sqliteTable("phase_checks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phaseId: integer("phase_id").notNull(),
  itemKey: text("item_key").notNull(),
  checked: integer("checked", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("phase_check_unique").on(table.phaseId, table.itemKey)]);

export const journalEntries = sqliteTable("journal_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phaseId: integer("phase_id").notNull(),
  title: text("title").notNull(),
  story: text("story").notNull(),
  lesson: text("lesson").notNull().default(""),
  author: text("author").notNull().default("Mahtab & Tom"),
  happenedAt: text("happened_at").notNull(),
  imageKey: text("image_key"),
  imageType: text("image_type"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
