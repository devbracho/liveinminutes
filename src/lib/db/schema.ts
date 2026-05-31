import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const guides = pgTable("guides", {
  id: uuid().primaryKey().defaultRandom(),
  slug: varchar({ length: 128 }).notNull().unique(),
  title: text().notNull(),
  description: text(),
  category: varchar({ length: 64 }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const guideProgress = pgTable("guide_progress", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().notNull(),
  guideId: uuid()
    .notNull()
    .references(() => guides.id, { onDelete: "cascade" }),
  completedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type Guide = typeof guides.$inferSelect;
export type NewGuide = typeof guides.$inferInsert;
