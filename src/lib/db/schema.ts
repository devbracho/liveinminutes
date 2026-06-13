import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid().primaryKey(),
  email: text(),
  role: varchar({ length: 16 }).notNull().default("user"),
  isPremium: boolean().notNull().default(false),
  premiumSince: timestamp({ withTimezone: true }),
  premiumExpiresAt: timestamp({ withTimezone: true }),
  premiumSource: varchar({ length: 32 }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type Profile = typeof profiles.$inferSelect;

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

export const tasks = pgTable("tasks", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().notNull(),
  title: text().notNull(),
  completed: boolean().notNull().default(false),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type Task = typeof tasks.$inferSelect;

export const messages = pgTable("messages", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().notNull(),
  username: text().notNull(),
  content: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type Message = typeof messages.$inferSelect;

export const timeEntries = pgTable("time_entries", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().notNull(),
  clockIn: timestamp({ withTimezone: true }).notNull().defaultNow(),
  clockOut: timestamp({ withTimezone: true }),
  note: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type TimeEntry = typeof timeEntries.$inferSelect;

export const bookings = pgTable("bookings", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().notNull(),
  name: text().notNull(),
  startsAt: timestamp({ withTimezone: true }).notNull(),
  durationMinutes: integer().notNull().default(30),
  status: varchar({ length: 16 }).notNull().default("confirmed"),
  note: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type Booking = typeof bookings.$inferSelect;

export const waMessages = pgTable("wa_messages", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().notNull(),
  role: varchar({ length: 16 }).notNull(),
  content: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type WaMessage = typeof waMessages.$inferSelect;

export const waOrders = pgTable("wa_orders", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().notNull(),
  product: text().notNull(),
  quantity: integer().notNull().default(1),
  customerName: text().notNull(),
  status: varchar({ length: 16 }).notNull().default("pending"),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type WaOrder = typeof waOrders.$inferSelect;
