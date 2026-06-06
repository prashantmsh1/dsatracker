// Make sure to install the 'pg' package
import { drizzle } from "drizzle-orm/node-postgres";
export { type InferSelectModel } from "drizzle-orm";

export * from "drizzle-orm";
export * from "./schema";
export const db = drizzle(process.env.DATABASE_URL!);

export async function checkConnection() {
	const result = await db.execute("select 1");
	console.log("done");
	return result;
}
