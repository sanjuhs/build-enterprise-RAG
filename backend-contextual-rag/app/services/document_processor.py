from docling.document_converter import DocumentConverter
from docling.chunking import HybridChunker
from docling.datamodel.pipeline_options import PdfPipelineOptions
from openai import OpenAI
import os
from typing import List, Dict

class DocumentProcessor:
    def __init__(self):
        self.converter = DocumentConverter()
        self.chunker = HybridChunker(max_tokens=500)  # Adjust token size as needed
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    async def process_document(self, file_content: bytes, filename: str) -> List[Dict]:
        # Convert document using Docling
        conv_result = self.converter.convert(file_content, filename=filename)
        document = conv_result.document

        # Generate chunks
        chunks = list(self.chunker.chunk(dl_doc=document))
        
        processed_chunks = []
        for chunk in chunks:
            # Get embeddings from OpenAI
            embedding = await self.get_embedding(chunk.text)
            
            processed_chunks.append({
                "content": chunk.text,
                "metadata": {
                    "headings": chunk.meta.headings,
                    "captions": chunk.meta.captions
                },
                "embedding": embedding
            })
        
        return processed_chunks

    async def get_embedding(self, text: str) -> List[float]:
        response = await self.client.embeddings.create(
            input=text,
            model="text-embedding-3-small"
        )
        return response.data[0].embedding 