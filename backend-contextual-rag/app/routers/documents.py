from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import asyncio
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..services.document_processor import DocumentProcessor
import json

router = APIRouter()
document_processor = DocumentProcessor()

async def process_document(db: Session, document_id: int, file_content: bytes, filename: str):
    """Process document and create chunks with embeddings"""
    try:
        # Get the document
        document = db.query(models.Document).filter(models.Document.document_id == document_id).first()
        if not document:
            return

        # Process document and get chunks with embeddings
        processed_chunks = await document_processor.process_document(file_content, filename)
        
        # Save chunks to database
        for chunk_data in processed_chunks:
            chunk = models.DocumentChunk(
                document_id=document_id,
                chunk_content=chunk_data["content"],
                metadata=chunk_data["metadata"],
                vector=chunk_data["embedding"]
            )
            db.add(chunk)
        
        # Update document status
        document.status = "processed"
        db.commit()

    except Exception as e:
        document.status = "failed"
        document.metadata = {"error": str(e)}
        db.commit()
        raise

@router.post("/", response_model=schemas.Document)
async def create_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: int = None,
    db: Session = Depends(get_db)
):
    # Read file content
    content = await file.read()
    
    document = models.Document(
        user_id=user_id,
        file_name=file.filename,
        s3_url="local://" + file.filename,  # In production, use actual S3
        status="processing",
        metadata={
            "original_name": file.filename,
            "content_length": len(content)
        }
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Add document processing to background tasks
    background_tasks.add_task(
        process_document,
        db,
        document.document_id,
        content,
        file.filename
    )
    
    return document

@router.get("/", response_model=List[schemas.Document])
def read_documents(
    skip: int = 0,
    limit: int = 100,
    user_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Document)
    if user_id:
        query = query.filter(models.Document.user_id == user_id)
    documents = query.offset(skip).limit(limit).all()
    return documents

@router.get("/{document_id}", response_model=schemas.Document)
def read_document(document_id: int, db: Session = Depends(get_db)):
    document = db.query(models.Document).filter(models.Document.document_id == document_id).first()
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.get("/{document_id}/chunks", response_model=List[schemas.DocumentChunk])
def read_document_chunks(document_id: int, db: Session = Depends(get_db)):
    chunks = db.query(models.DocumentChunk).filter(
        models.DocumentChunk.document_id == document_id
    ).all()
    return chunks 