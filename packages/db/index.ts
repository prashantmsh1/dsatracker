import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// We can export the schema as well to use it in frontend and backend
export * from "./schema";

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
