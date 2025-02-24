import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from environment.");
}
const db = postgres(process.env.DATABASE_URL);
export { db };
