# Database Schema for RAG Application

## List of Tables

1. **Users** - Stores user information and configuration settings.
2. **Documents** - Handles document storage and upload statuses.
3. **Chat Sessions** - Tracks metadata about chat sessions.
4. **Chat Messages** - Records all chat messages exchanged during sessions.
5. **Feedback** - Records user feedback.
6. **Notifications** - Stores user notifications.
7. **Logs** - Logs system events for monitoring purposes.
8. **Document Chunks** - Stores processed chunks of documents for vectorization.

---

## Table Definitions

### 1. Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    settings_config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- **Primary Key**: `id`

### 2. Documents Table

```sql
CREATE TABLE documents (
    document_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    s3_url VARCHAR(2083) NOT NULL,
    status VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    visibility VARCHAR(20) DEFAULT 'private',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- **Primary Key**: `document_id`
- **Foreign Key**: `user_id` references `users.id`

### 3. Chat Sessions Table

```sql
CREATE TABLE chat_sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_name VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- **Primary Key**: `session_id`
- **Foreign Key**: `user_id` references `users.id`

### 4. Chat Messages Table

```sql
CREATE TABLE chat_messages (
    message_id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'user',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- **Primary Key**: `message_id`
- **Foreign Keys**:
  - `session_id` references `chat_sessions.session_id`
  - `user_id` references `users.id`

### 5. Feedback Table

```sql
CREATE TABLE feedback (
    feedback_id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES chat_messages(message_id) ON DELETE CASCADE,
    feedback_text TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- **Primary Key**: `feedback_id`
- **Foreign Key**: `message_id` references `chat_messages.message_id`

### 6. Notifications Table

```sql
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unread',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- **Primary Key**: `notification_id`
- **Foreign Key**: `user_id` references `users.id`

### 7. Logs Table

```sql
CREATE TABLE logs (
    log_id SERIAL PRIMARY KEY,
    event_type VARCHAR(100),
    event_details TEXT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- **Primary Key**: `log_id`
- **Foreign Key**: `user_id` references `users.id`

### 8. Document Chunks Table

```sql
CREATE TABLE document_chunks (
    chunk_id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(document_id) ON DELETE CASCADE,
    chunk_content TEXT NOT NULL,
    vector vector(1536),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- **Primary Key**: `chunk_id`
- **Foreign Key**: `document_id` references `documents.document_id`
- **Notes**:
  - Requires the `vector` extension for PostgreSQL
  - Vector dimension is set to 1536 for OpenAI's text-embedding-3-small model
  - Uses IVF (Inverted File) index for efficient similarity search

---

## Notes

- **Database**: This schema is specifically for PostgreSQL
- **Extensions Required**:
  - `pgcrypto` for password hashing
  - `vector` for document embeddings (1536-dimensional vectors)
- **JSON Storage**: Uses JSONB for better performance and functionality with JSON data
- **Timestamps**: Uses PostgreSQL TIMESTAMP type for temporal data
- **Primary Keys**: Uses SERIAL for auto-incrementing primary keys
- **Referential Integrity**: Implements CASCADE or SET NULL delete behaviors as appropriate
- **Vector Search**: Implements IVF (Inverted File) indexing with 100 lists for efficient similarity search

---

Future plans:

- **Billing Table**: This table is not implemented yet, and is optional for the current architecture.

### 9. Billing Table

```sql
CREATE TABLE billing (
    billing_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    plan_type ENUM('free', 'pro', 'enterprise') DEFAULT 'free',
    subscription_start DATE,
    subscription_end DATE,
    amount DECIMAL(10, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
);
```

- **Primary Key**: `billing_id`
- **Foreign Key**: `user_id` references `users.user_id`

---

### 9. Billing Table

```sql
CREATE TABLE billing (
    billing_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    plan_type VARCHAR(20) DEFAULT 'free',
    subscription_start DATE,
    subscription_end DATE,
    amount DECIMAL(10, 2),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- **Primary Key**: `billing_id`
- **Foreign Key**: `user_id` references `users.id`

---

## Recommended Indexes

### Performance Critical Indexes

1. **Chat Messages Table**

```sql
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
```

- Improves performance for message retrieval within sessions
- Helps with user message history queries
- Optimizes time-based message queries

2. **Document Chunks Table**

```sql
CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_document_chunks_vector ON document_chunks USING ivfflat (vector vector_cosine_ops) WITH (lists = 100);
```

- Speeds up document chunk retrieval
- Enables efficient vector similarity search using IVF index
- IVF index is configured with 100 lists for optimal performance

3. **Documents Table**

```sql
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_visibility ON documents(visibility);
```

- Optimizes user's document listing
- Helps with document status filtering
- Improves visibility-based queries

4. **Chat Sessions Table**

```sql
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
```

- Improves user's session history retrieval
- Optimizes recent sessions queries

5. **Notifications Table**

```sql
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

- Speeds up unread notifications queries
- Optimizes recent notifications retrieval

6. **Billing Table**

```sql
CREATE INDEX idx_billing_user_id ON billing(user_id);
CREATE INDEX idx_billing_subscription_end ON billing(subscription_end);
```

- Improves subscription lookup performance
- Helps identify expiring subscriptions

### Additional Index Considerations

1. **Composite Indexes**

   - Consider creating composite indexes for frequently combined filters
   - Example: `CREATE INDEX idx_docs_user_status ON documents(user_id, status)`

2. **Partial Indexes**

   - For status-based queries on active records
   - Example: `CREATE INDEX idx_active_documents ON documents(user_id) WHERE status = 'active'`

3. **Text Search Indexes**
   - If implementing full-text search:
   ```sql
   CREATE INDEX idx_messages_text_search ON chat_messages USING GIN (to_tsvector('english', message_text));
   CREATE INDEX idx_docs_chunks_text_search ON document_chunks USING GIN (to_tsvector('english', chunk_content));
   ```

### Index Maintenance Notes

1. **Monitor Index Usage**

   - Regularly check index usage statistics
   - Remove unused indexes
   - `SELECT * FROM pg_stat_user_indexes;`

2. **Reindex Periodically**

   - Schedule maintenance windows for reindexing
   - `REINDEX TABLE table_name;`

3. **Update Statistics**
   - Keep statistics up to date for query optimizer
   - `ANALYZE table_name;`

---
