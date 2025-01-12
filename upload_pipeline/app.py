# app.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
import psycopg
import os
import asyncio
import time
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

# Record server startup time
SERVER_START_TIME = time.time()
STARTUP_COMPLETE_TIME = None

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global STARTUP_COMPLETE_TIME
    try:
        # Startup code
        startup_duration = time.time() - SERVER_START_TIME
        STARTUP_COMPLETE_TIME = time.time()
        print(f"\n{'='*50}")
        print(f"Server startup completed in {startup_duration:.3f} seconds")
        print(f"Startup time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*50}\n")
        
        # Start the DB warm-up task
        warm_up_task = asyncio.create_task(keep_db_warm())
        
        yield  # Server is running
        
    except Exception as e:
        print(f"Startup error: {e}")
        raise
    finally:
        # Shutdown
        try:
            warm_up_task.cancel()  # Cancel the warm-up task
            try:
                await warm_up_task  # Wait for task to complete cancellation
            except asyncio.CancelledError:
                pass  # Expected cancellation
                
            shutdown_time = time.time()
            total_uptime = shutdown_time - SERVER_START_TIME
            print(f"\n{'='*50}")
            print(f"Server shutting down after running for {total_uptime:.3f} seconds")
            print(f"Shutdown time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"{'='*50}\n")
        except Exception as e:
            print(f"Shutdown error: {e}")

# Define the warm-up function
async def keep_db_warm():
    while True:
        try:
            print("Keeping database connection warm...")
            async with timeout_context(20):
                with psycopg.connect(DATABASE_URL) as conn:
                    with conn.cursor() as cur:
                        cur.execute("SELECT 1")
            await asyncio.sleep(45)
        except Exception as e:
            print(f"Warm-up error: {e}")
            await asyncio.sleep(5)

# Get database URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Server starting up at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
# print(f"Using DATABASE_URL: {DATABASE_URL}")

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@asynccontextmanager
async def timeout_context(seconds):
    try:
        yield await asyncio.wait_for(asyncio.sleep(0), timeout=seconds)
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail=f"Database connection timed out after {seconds} seconds")

@app.get("/", response_class=HTMLResponse)
async def main():
    uptime = time.time() - SERVER_START_TIME
    return f"""
    <html>
        <body>
            <h1>Upload File</h1>
            <form action="/upload" enctype="multipart/form-data" method="post">
                <input name="file" type="file">
                <input type="submit">
            </form>
            <br>
            <a href="/test-db">Test Database Connection</a>
            <p>Server uptime: {uptime:.2f} seconds</p>
        </body>
    </html>
    """

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    return {"filename": file.filename}

@app.get("/test-db")
async def test_db():
    connection_start_time = time.time()
    print(f"Starting database connection test at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Testing database connection: {DATABASE_URL}")
    
    async with timeout_context(20):  # Increased timeout to 20 seconds for cold starts
        try:
            # Test the connection by making a simple query
            conn_params = psycopg.conninfo.conninfo_to_dict(DATABASE_URL)
            conn_params['connect_timeout'] = 20  # PostgreSQL native timeout
            
            with psycopg.connect(**conn_params) as conn:
                connection_time = time.time() - connection_start_time
                print(f"Connected to database after {connection_time:.2f} seconds")
                
                query_start_time = time.time()
                with conn.cursor() as cur:
                    cur.execute("SELECT 1")
                    result = cur.fetchone()
                    query_time = time.time() - query_start_time
                    
                    print(f"Query result: {result}")
                    print(f"Query executed in {query_time:.2f} seconds")
                    
                    total_time = time.time() - connection_start_time
                    return {
                        "status": "success",
                        "message": "Database connection successful!",
                        "timing": {
                            "connection_time": f"{connection_time:.2f}s",
                            "query_time": f"{query_time:.2f}s",
                            "total_time": f"{total_time:.2f}s"
                        }
                    }
        except Exception as e:
            error_time = time.time() - connection_start_time
            print(f"Error occurred after {error_time:.2f} seconds: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail={
                    "error": f"Database connection failed: {str(e)}",
                    "time_elapsed": f"{error_time:.2f}s"
                }
            )

@app.get("/server-info")
async def server_info():
    current_time = time.time()
    startup_duration = STARTUP_COMPLETE_TIME - SERVER_START_TIME if STARTUP_COMPLETE_TIME else None
    return {
        "server_metrics": {
            "startup_duration": f"{startup_duration:.3f}s" if startup_duration else "N/A",
            "server_start_time": time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(SERVER_START_TIME)),
            "startup_complete_time": time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(STARTUP_COMPLETE_TIME)) if STARTUP_COMPLETE_TIME else "N/A",
            "current_time": time.strftime('%Y-%m-%d %H:%M:%S'),
            "uptime_seconds": f"{current_time - SERVER_START_TIME:.3f}",
            "uptime_since_ready": f"{current_time - STARTUP_COMPLETE_TIME:.3f}" if STARTUP_COMPLETE_TIME else "N/A"
        }
    }

@app.get("/db-schema")
async def get_db_schema():
    connection_start_time = time.time()
    print(f"Starting schema inspection at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    async with timeout_context(20):
        try:
            conn_params = psycopg.conninfo.conninfo_to_dict(DATABASE_URL)
            conn_params['connect_timeout'] = 20
            
            with psycopg.connect(**conn_params) as conn:
                with conn.cursor() as cur:
                    # Get all tables
                    cur.execute("""
                        SELECT 
                            t.table_name,
                            t.table_type
                        FROM information_schema.tables t
                        WHERE t.table_schema = 'public'
                        ORDER BY t.table_name;
                    """)
                    tables = cur.fetchall()
                    
                    schema_info = {}
                    
                    # For each table, get its columns and constraints
                    for table_name, table_type in tables:
                        # Get columns
                        cur.execute("""
                            SELECT 
                                column_name,
                                data_type,
                                is_nullable,
                                column_default
                            FROM information_schema.columns
                            WHERE table_schema = 'public'
                                AND table_name = %s
                            ORDER BY ordinal_position;
                        """, (table_name,))
                        columns = cur.fetchall()
                        
                        # Get primary keys
                        cur.execute("""
                            SELECT
                                kcu.column_name
                            FROM information_schema.table_constraints tc
                            JOIN information_schema.key_column_usage kcu
                                ON tc.constraint_name = kcu.constraint_name
                            WHERE tc.table_schema = 'public'
                                AND tc.table_name = %s
                                AND tc.constraint_type = 'PRIMARY KEY';
                        """, (table_name,))
                        primary_keys = [pk[0] for pk in cur.fetchall()]
                        
                        # Get foreign keys
                        cur.execute("""
                            SELECT
                                kcu.column_name,
                                ccu.table_name AS foreign_table_name,
                                ccu.column_name AS foreign_column_name
                            FROM information_schema.table_constraints tc
                            JOIN information_schema.key_column_usage kcu
                                ON tc.constraint_name = kcu.constraint_name
                            JOIN information_schema.constraint_column_usage ccu
                                ON ccu.constraint_name = tc.constraint_name
                            WHERE tc.table_schema = 'public'
                                AND tc.table_name = %s
                                AND tc.constraint_type = 'FOREIGN KEY';
                        """, (table_name,))
                        foreign_keys = cur.fetchall()
                        
                        # Structure the information
                        schema_info[table_name] = {
                            "type": table_type,
                            "columns": [
                                {
                                    "name": col[0],
                                    "data_type": col[1],
                                    "is_nullable": col[2],
                                    "default": col[3],
                                    "is_primary_key": col[0] in primary_keys
                                }
                                for col in columns
                            ],
                            "primary_keys": primary_keys,
                            "foreign_keys": [
                                {
                                    "column": fk[0],
                                    "references_table": fk[1],
                                    "references_column": fk[2]
                                }
                                for fk in foreign_keys
                            ]
                        }
                    
                    total_time = time.time() - connection_start_time
                    return {
                        "status": "success",
                        "execution_time": f"{total_time:.2f}s",
                        "schema": schema_info
                    }
                    
        except Exception as e:
            error_time = time.time() - connection_start_time
            print(f"Schema inspection error after {error_time:.2f} seconds: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail={
                    "error": f"Schema inspection failed: {str(e)}",
                    "time_elapsed": f"{error_time:.2f}s"
                }
            )
