import requests
import os
from pathlib import Path

def test_document_upload():
    # API endpoint
    API_URL = "http://localhost:8000"
    
    # Test with a PDF file
    test_file_path = Path("test.pdf")  # Replace with your test PDF path
    
    if not test_file_path.exists():
        raise FileNotFoundError(f"Test file not found: {test_file_path}")
    
    # Prepare the file upload
    files = {
        'file': (test_file_path.name, open(test_file_path, 'rb'), 'application/pdf')
    }
    
    # Add user_id as form field
    data = {
        'user_id': 1  # Make sure this user exists in your database
    }
    
    # Make the request
    response = requests.post(
        f"{API_URL}/api/documents/",
        files=files,
        data=data
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        document_id = response.json()['document_id']
        
        # Check document status
        status_response = requests.get(f"{API_URL}/api/documents/{document_id}")
        print(f"\nDocument Status: {status_response.json()['status']}")
        
        # Check chunks
        chunks_response = requests.get(f"{API_URL}/api/documents/{document_id}/chunks")
        print(f"\nDocument Chunks: {len(chunks_response.json())} chunks found")

if __name__ == "__main__":
    test_document_upload() 