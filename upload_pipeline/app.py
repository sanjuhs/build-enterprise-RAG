# app.py
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.get("/", response_class=HTMLResponse)
async def main():
    return """
    <html>
        <body>
            <h1>Upload File</h1>
            <form action="/upload" enctype="multipart/form-data" method="post">
                <input name="file" type="file">
                <input type="submit">
            </form>
        </body>
    </html>
    """

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    return {"filename": file.filename}