import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local file
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

if (!process.env.NEON_DOCSDB_URL) {
  throw new Error("NEON_DOCSDB_URL env variable is not defined");
}

export const sql = neon(process.env.NEON_DOCSDB_URL);

export async function getUploadRecord(id: string) {
  const record = await sql`
    SELECT * FROM documents WHERE document_id = ${id} LIMIT 1
  `;
  return record[0];
}

export async function deleteUploadRecord(id: string) {
  await sql`
    DELETE FROM documents WHERE document_id = ${id}
  `;
}
