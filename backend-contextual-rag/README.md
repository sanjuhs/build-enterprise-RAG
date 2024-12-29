# Python Virtual Environment Setup

This project uses Python 3.11 with a virtual environment.

## Setup Instructions

1. Make sure Python 3.11 is installed on your system

   ```bash
   python --version
   ```

2. Create a virtual environment

   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:

   - On Windows:

     ```bash
     .\venv\Scripts\activate
     ```

   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Your prompt should now show `(venv)` indicating the virtual environment is active

5. To deactivate the virtual environment when you're done:
   ```bash
   deactivate
   ```

## Additional Notes

- Always activate the virtual environment before working on the project
- Use `pip freeze > requirements.txt` to save package dependencies
- Use `pip install -r requirements.txt` to install dependencies
