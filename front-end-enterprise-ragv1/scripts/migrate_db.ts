import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.NEON_DOCSDB_URL) {
  throw new Error("NEON_DOCSDB_URL env variable is not defined");
}

const sql = neon(process.env.NEON_DOCSDB_URL!);

async function migrateDatabase() {
  try {
    console.log("Starting database migration...");

    // Execute queries sequentially without transaction
    await sql`
      ALTER TABLE documents
      ADD COLUMN IF NOT EXISTS document_metadata JSONB DEFAULT '{}'::jsonb
    `;

    // await sql`
    //   ALTER TABLE chat_messages
    //   ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb
    // `;

    // await sql`
    //   ALTER TABLE users
    //   ALTER COLUMN settings_config SET DEFAULT '{}'::jsonb
    // `;

    // await sql`
    //   CREATE INDEX IF NOT EXISTS idx_documents_user_id
    //   ON documents(user_id)
    // `;

    console.log("Database migration completed successfully");
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
}

// Run the migration
migrateDatabase()
  .then(() => {
    console.log("Migration script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
