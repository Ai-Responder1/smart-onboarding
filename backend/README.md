### Backend (FastAPI)

Run locally:

```bash
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt

setx OPENAI_API_KEY "YOUR_KEY"  # or use a .env file
setx MONGODB_URI "mongodb://localhost:27017"
setx PAN_AADHAAR_ENC_KEY "$(python -c "from cryptography.fernet import Fernet;print(Fernet.generate_key().decode())")"

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Environment variables:

- `OPENAI_API_KEY` (required)
- `OPENAI_MODEL` (default: gpt-4.1)
- `OPENAI_EMBEDDINGS_MODEL` (default: text-embedding-3-small)
- `MONGODB_URI` (default: mongodb://localhost:27017)
- `MONGODB_DB` (default: ai_hackathon)
- `VECTOR_DB_DIR` (default: ./storage/vector_db)
- `UPLOAD_DIR` (default: ./storage/uploads)
- `PAN_AADHAAR_ENC_KEY` (Fernet key, base64)

Endpoints:

- POST `/api/chat`
- POST `/api/upload`
- POST `/api/submit`
- GET `/health`


