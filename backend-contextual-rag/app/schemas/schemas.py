from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    role: str
    created_at: datetime
    settings_config: Dict = {}

    class Config:
        from_attributes = True

# Document schemas
class DocumentBase(BaseModel):
    file_name: str
    visibility: str = 'private'
    metadata: Dict = {}

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    document_id: int
    user_id: int
    s3_url: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Document Chunk schemas
class DocumentChunkBase(BaseModel):
    chunk_content: str
    metadata: Dict = {}

class DocumentChunkCreate(DocumentChunkBase):
    document_id: int

class DocumentChunk(DocumentChunkBase):
    chunk_id: int
    document_id: int
    created_at: datetime

    class Config:
        from_attributes = True 