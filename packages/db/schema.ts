import { pgTable, serial, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const problems = pgTable("problems", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  url: text("url").notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(), // Easy, Medium, Hard
  category: varchar("category", { length: 100 }),
  completed: boolean("completed").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  problemId: serial("problem_id").references(() => problems.id),
  status: varchar("status", { length: 50 }),
  submittedAt: timestamp("submitted_at").defaultNow(),
});
