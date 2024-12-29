import requests
import os

# API endpoint
API_URL = "http://localhost:8000"  # Change if your server is running elsewhere

def test_upload():
    # Test file (create a small text file for testing)
    with open("test.txt", "w") as f:
        f.write("This is a test document for RAG processing.")
    
    # Open the test file
    files = {
        'file': ('test.txt', open('test.txt', 'rb'), 'text/plain')
    }
    
    # Add user_id as a form field
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

if __name__ == "__main__":
    test_upload() 