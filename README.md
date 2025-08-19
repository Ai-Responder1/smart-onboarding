## AI Hackathon App

FastAPI backend (Python) + Vite React frontend. Features:

- Chatbot with onboarding form sync
- RAG over local FAISS vector DB with OpenAI embeddings
- PDF upload + parsing + indexing
- Lead storage in MongoDB with PAN/Aadhaar encryption

### Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB running locally or in the cloud
- OpenAI API key

### 🚀 Quick Start

#### 1. Environment Setup

**Option A: Automated Setup (Recommended)**
```bash
python setup_env.py
```

**Option B: Manual Setup**
```bash
# Backend
cd backend
cp env.example .env
# Edit .env with your OpenAI API key

# Frontend
cd frontend
cp env.example .env
# Edit .env with your backend URL
```

#### 2. Install Dependencies

```bash
# Backend
cd backend
python -m venv .venv
. .venv/Scripts/Activate.ps1  # PowerShell on Windows
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

#### 3. Run the Application

```bash
# Backend (Terminal 1)
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (Terminal 2)
cd frontend
npm run dev
```

Open http://localhost:5173

### 🔧 Environment Configuration

See `ENVIRONMENT_SETUP.md` for detailed configuration options.

**Required Variables:**
- `OPENAI_API_KEY` - Your OpenAI API key
- `VITE_API_BASE` - Backend API URL (frontend)

**Optional Variables:**
- `MONGODB_URI` - MongoDB connection string
- `VECTOR_DB_DIR` - Vector database storage location
- `UPLOAD_DIR` - PDF upload storage location
- `PAN_AADHAAR_ENC_KEY` - Encryption key (auto-generated)

### 🔍 Validation

```bash
# Test backend
python test_backend.py

# Test frontend
cd frontend
npm run build
```

### Security Notes

- PAN and Aadhaar values are encrypted at rest via Fernet key `PAN_AADHAAR_ENC_KEY`
- Do not log sensitive data
- For production, use KMS-managed keys, HTTPS, strict CORS, auth


