import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local file
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

if (!process.env.NEON_DOCSDB_URL) {
  throw new Error("NEON_DOCSDB_URL env variable is not defined");
}

export const sql = neon(process.env.NEON_DOCSDB_URL);
