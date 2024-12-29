import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

// use this if you want to load the env variables from the .env.local file
// import path from "path";
// // Load environment variables from .env.local file
// const envPath = path.resolve(__dirname, "../../../.env.local"); // Adjust the path as needed
// console.log("Loading .env.local file from:", envPath);
// dotenv.config({ path: envPath });

dotenv.config();

// to debug and check if the env variables are loaded correctly
// console.log("hey guyss NEON_DOCSDB_URL", process.env.NEON_DOCSDB_URL);

// also we will be using text-embedding-3-small
// this means that the vector dimension is 1536

if (!process.env.NEON_DOCSDB_URL) {
  throw new Error("NEON_DOCSDB_URL env variable is not defined");
}

const sql = neon(process.env.NEON_DOCSDB_URL!);

export async function setupDatabase() {
  try {
    // Enable required extensions
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;
    await sql`CREATE EXTENSION IF NOT EXISTS vector`;

    // First drop the existing index and table if they exist
    await sql`DROP INDEX IF EXISTS idx_document_chunks_vector`;
    await sql`DROP TABLE IF EXISTS document_chunks`;

    // Create users table : 1
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        role VARCHAR(20) DEFAULT 'user',
        settings_config JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create documents table : 2
    await sql`
      CREATE TABLE IF NOT EXISTS documents (
        document_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        s3_url VARCHAR(2083) NOT NULL,
        status VARCHAR(255) NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        visibility VARCHAR(20) DEFAULT 'private',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create chat_sessions table : 3
    await sql`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        session_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        session_name VARCHAR(255),
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create chat_messages table : 4
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        message_id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message_text TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'user',
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create feedback table : 5
    await sql`
      CREATE TABLE IF NOT EXISTS feedback (
        feedback_id SERIAL PRIMARY KEY,
        message_id INTEGER REFERENCES chat_messages(message_id) ON DELETE CASCADE,
        feedback_text TEXT NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create notifications table : 6
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'unread',
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    // Create logs table : 7
    await sql`
      CREATE TABLE IF NOT EXISTS logs (
        log_id SERIAL PRIMARY KEY,
        event_type VARCHAR(100),
        event_details TEXT,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    // Create document_chunks table with vector support
    await sql`
      CREATE TABLE document_chunks (
        chunk_id SERIAL PRIMARY KEY,
        document_id INTEGER REFERENCES documents(document_id) ON DELETE CASCADE,
        chunk_content TEXT NOT NULL,
        vector vector(1536),
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create critical indexes for performance
    console.log("Setting up indexes...");

    // Chat Messages indexes - Execute separately
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at)`;

    // Documents indexes - Execute separately
    await sql`CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_documents_visibility ON documents(visibility)`;

    // Chat Sessions indexes - Execute separately
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC)`;

    // Notifications indexes - Execute separately
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC)`;

    // Add vector indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id)`;
    await sql`CREATE INDEX idx_document_chunks_vector ON document_chunks USING ivfflat (vector vector_cosine_ops) WITH (lists = 100)`;

    console.log("Database setup completed successfully");
  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  }
}
