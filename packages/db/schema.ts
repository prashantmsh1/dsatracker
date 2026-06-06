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
    displayName: text("display_name"),
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
    difficultyLevel: text("difficulty_level"),
    category: text("category"), // Added back from problems model
    completed: boolean("completed").default(false), // Added back from problems model
    lastShownAt: timestamp("last_shown_at"), // To track the 'x' days constraint
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const playlists = pgTable("playlists", {
    id: serial("id").primaryKey(),
    userId: text("user_id")
        .references(() => users.id)
        .notNull(),
    name: text("name").notNull(),
    theory: text("theory"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const playlistQuestions = pgTable(
    "playlist_questions",
    {
        playlistId: integer("playlist_id").references(() => playlists.id, { onDelete: "cascade" }).notNull(),
        questionId: integer("question_id").references(() => questions.id, { onDelete: "cascade" }).notNull(),
    },
    (t) => [primaryKey({ columns: [t.playlistId, t.questionId] })],
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

export const centralProblems = pgTable("central_problems", {
    id: serial("id").primaryKey(),
    leetcodeUrl: text("leetcode_url").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    difficultyLevel: text("difficulty_level").notNull(), // Easy, Medium, Hard
    category: text("category").default("General"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const centralPlaylists = pgTable("central_playlists", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    theory: text("theory"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const centralPlaylistProblems = pgTable(
    "central_playlist_problems",
    {
        playlistId: integer("playlist_id").references(() => centralPlaylists.id, { onDelete: "cascade" }).notNull(),
        problemId: integer("problem_id").references(() => centralProblems.id, { onDelete: "cascade" }).notNull(),
    },
    (t) => [primaryKey({ columns: [t.playlistId, t.problemId] })],
);

export const userCentralProblems = pgTable(
    "user_central_problems",
    {
        id: serial("id").primaryKey(),
        userId: text("user_id").references(() => users.id).notNull(),
        centralProblemId: integer("central_problem_id").references(() => centralProblems.id, { onDelete: "cascade" }).notNull(),
        completed: boolean("completed").default(false).notNull(),
        notes: text("notes").default("").notNull(),
        lastShownAt: timestamp("last_shown_at"),
        createdAt: timestamp("created_at").defaultNow(),
        updatedAt: timestamp("updated_at").defaultNow(),
    }
);

export const solvedHistory = pgTable("solved_history", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id).notNull(),
    problemType: text("problem_type").notNull(), // 'user' or 'central'
    questionId: integer("question_id").references(() => questions.id, { onDelete: "cascade" }), // if problem_type is 'user'
    centralProblemId: integer("central_problem_id").references(() => centralProblems.id, { onDelete: "cascade" }), // if problem_type is 'central'
    solvedAt: timestamp("solved_at").defaultNow().notNull(),
});

export const dailyRecommendations = pgTable(
    "daily_recommendations",
    {
        date: varchar("date", { length: 10 }).notNull(), // "YYYY-MM-DD"
        centralProblemId: integer("central_problem_id").references(() => centralProblems.id, { onDelete: "cascade" }).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (t) => [primaryKey({ columns: [t.date, t.centralProblemId] })],
);


