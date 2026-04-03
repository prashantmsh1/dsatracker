import {
    pgTable,
    serial,
    text,
    integer,
    timestamp,
    boolean,
    primaryKey,
    varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: text("id").primaryKey(), // Firebase Auth UID
    email: text("email").notNull(),
    cooldownDays: integer("cooldown_days").default(7).notNull(), // User's 'x' days setting
    createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
    id: serial("id").primaryKey(),
    userId: text("user_id")
        .references(() => users.id)
        .notNull(),
    leetcodeUrl: text("leetcode_url").notNull(),
    title: text("title"), // Fetched or manually entered
    description: text("description"),
    notes: text("notes"),
    lastShownAt: timestamp("last_shown_at"), // To track the 'x' days constraint
    createdAt: timestamp("created_at").defaultNow(),
});

export const playlists = pgTable("playlists", {
    id: serial("id").primaryKey(),
    userId: text("user_id")
        .references(() => users.id)
        .notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const playlistQuestions = pgTable(
    "playlist_questions",
    {
        playlistId: integer("playlist_id").references(() => playlists.id, { onDelete: "cascade" }),
        questionId: integer("question_id").references(() => questions.id, { onDelete: "cascade" }),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.playlistId, t.questionId] }),
    }),
);

// Optional: To keep a strict history of what was suggested and if they actually solved it
export const dailyHistory = pgTable("daily_history", {
    id: serial("id").primaryKey(),
    userId: text("user_id")
        .references(() => users.id)
        .notNull(),
    questionId: integer("question_id")
        .references(() => questions.id)
        .notNull(),
    suggestedAt: timestamp("suggested_at").defaultNow().notNull(),
    isCompleted: boolean("is_completed").default(false),
});



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
