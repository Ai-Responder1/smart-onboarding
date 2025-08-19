# Environment Setup Guide

This guide explains how to set up environment variables for the AI Hackathon application.

## 📁 File Structure

```
AI Hackathon/
├── backend/
│   ├── env.example          # Backend environment template
│   └── .env                 # Backend environment (create this)
├── frontend/
│   ├── env.example          # Frontend environment template
│   └── .env                 # Frontend environment (create this)
└── ENVIRONMENT_SETUP.md     # This guide
```

## 🚀 Quick Setup

### 1. Backend Setup

```bash
cd backend
cp env.example .env
# Edit .env with your actual values
```

### 2. Frontend Setup

```bash
cd frontend
cp env.example .env
# Edit .env with your actual values
```

## 🔑 Required Environment Variables

### Backend (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-...` |

### Frontend (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE` | Backend API URL | `http://localhost:8000` |

## ⚙️ Optional Environment Variables

### Backend (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_MODEL` | `gpt-4.1` | LLM model to use |
| `OPENAI_EMBEDDINGS_MODEL` | `text-embedding-3-small` | Embeddings model |
| `LLM_TEMPERATURE` | `0.2` | Response creativity (0-1) |
| `MONGODB_URI` | `mongodb://localhost:27017` | MongoDB connection |
| `MONGODB_DB` | `ai_hackathon` | Database name |
| `PAN_AADHAAR_ENC_KEY` | Auto-generated | Encryption key |
| `VECTOR_DB_DIR` | `./storage/vector_db` | Vector store location |
| `UPLOAD_DIR` | `./storage/uploads` | PDF upload location |
| `CORS_ORIGINS` | Local dev URLs | Allowed origins |
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `8000` | Server port |

### Frontend (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_DEV_MODE` | `true` | Development features |
| `VITE_DEBUG` | `false` | Debug logging |
| `VITE_DEFAULT_THEME` | `light` | UI theme |
| `VITE_DARK_MODE_ENABLED` | `true` | Dark mode support |

## 🔐 Security Considerations

### 1. API Keys
- **Never commit** `.env` files to version control
- Use strong, unique API keys
- Rotate keys regularly
- Store production keys securely (e.g., AWS Secrets Manager)

### 2. Encryption Keys
- `PAN_AADHAAR_ENC_KEY` is auto-generated if not provided
- For production, generate and store securely
- Use different keys for different environments

### 3. Database Security
- Use strong MongoDB passwords
- Enable authentication
- Use SSL/TLS connections in production
- Restrict network access

## 🌍 Environment-Specific Configurations

### Development

```bash
# backend/.env
OPENAI_API_KEY=your_dev_key
MONGODB_URI=mongodb://localhost:27017
DEBUG=True
AUTO_RELOAD=True

# frontend/.env
VITE_API_BASE=http://localhost:8000
VITE_DEV_MODE=true
VITE_DEBUG=true
```

### Staging

```bash
# backend/.env
OPENAI_API_KEY=your_staging_key
MONGODB_URI=mongodb://staging-db:27017
DEBUG=False
AUTO_RELOAD=False

# frontend/.env
VITE_API_BASE=https://staging-api.example.com
VITE_DEV_MODE=false
VITE_DEBUG=false
```

### Production

```bash
# backend/.env
OPENAI_API_KEY=your_production_key
MONGODB_URI=mongodb://prod-db:27017
DEBUG=False
AUTO_RELOAD=False
LOG_LEVEL=WARNING

# frontend/.env
VITE_API_BASE=https://api.example.com
VITE_DEV_MODE=false
VITE_DEBUG=false
VITE_ANALYTICS_ENABLED=true
```

## 🛠️ Setup Commands

### Windows PowerShell

```powershell
# Backend
cd backend
Copy-Item env.example .env
notepad .env  # Edit with your values

# Frontend
cd frontend
Copy-Item env.example .env
notepad .env  # Edit with your values
```

### Windows Command Prompt

```cmd
# Backend
cd backend
copy env.example .env
notepad .env

# Frontend
cd frontend
copy env.example .env
notepad .env
```

### Linux/macOS

```bash
# Backend
cd backend
cp env.example .env
nano .env  # or vim .env

# Frontend
cd frontend
cp env.example .env
nano .env  # or vim .env
```

## 🔍 Validation

### Backend Validation

```bash
cd backend
python test_backend.py
```

Expected output:
```
AI Hackathon Backend Test
========================================
Testing backend imports...
✓ Schemas imported successfully
✓ Security module imported successfully
✓ Database module imported successfully
✓ Vector store module imported successfully
✓ PDF processing module imported successfully
✓ LLM module imported successfully
✓ Chat logic module imported successfully
✓ Main FastAPI app imported successfully

✅ All backend modules imported successfully!

Testing basic functionality...
✓ LeadFields creation works
✓ PDF validation works
✓ Completion status works

✅ Basic functionality tests passed!

🎉 All tests passed! Backend is ready to run.
```

### Frontend Validation

```bash
cd frontend
npm run build
```

Expected output:
```
✓ 82 modules transformed.
dist/index.html                  0.34 kB │ gzip:  0.24 kB
dist/assets/index-DnGUqgEr.js  188.48 kB │ gzip: 62.98 kB
✓ built in 776ms
```

## 🚨 Troubleshooting

### Common Issues

1. **Missing OpenAI API Key**
   - Error: `OPENAI_API_KEY environment variable is required`
   - Solution: Add your API key to `backend/.env`

2. **MongoDB Connection Failed**
   - Error: `MongoDB connection failed`
   - Solution: Check MongoDB is running and `MONGODB_URI` is correct

3. **Frontend Build Fails**
   - Error: TypeScript compilation errors
   - Solution: Check all types are properly defined

4. **CORS Errors**
   - Error: `Access to fetch at '...' from origin '...' has been blocked`
   - Solution: Add your frontend URL to `CORS_ORIGINS`

### Environment Variable Debugging

```bash
# Backend
cd backend
python -c "import os; print('OPENAI_API_KEY:', os.environ.get('OPENAI_API_KEY', 'NOT SET'))"

# Frontend
cd frontend
node -e "console.log('VITE_API_BASE:', process.env.VITE_API_BASE || 'NOT SET')"
```

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [MongoDB Connection String](https://docs.mongodb.com/manual/reference/connection-string/)
- [FastAPI Environment Variables](https://fastapi.tiangolo.com/advanced/settings/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
