from __future__ import annotations

import os
from typing import Dict, List
from dotenv import load_dotenv
import pathlib
import os
import re

# Load environment variables from .env file
env_path = pathlib.Path(__file__).parent.parent / '.env'
load_dotenv(env_path)





from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .schemas import ChatRequest, ChatResponse, LeadFields, LeadSubmitRequest, UploadResponse, RetrievedContext
from .vectorstore import index_texts, similarity_search
from .pdf_processing import extract_text_from_pdf, validate_pdf, save_upload_to_disk
from .chat_logic import infer_lead_fields_from_message, completion_status
from .llm import generate_reply
from .security import encrypt_sensitive
from .db import insert_lead, test_connection


def is_likely_full_name(text: str) -> bool:
    """
    Determine if a text string is likely to be a real person's full name.
    """
    if not text or len(text.strip()) < 2:
        return False
    
    text = text.strip()
    words = text.split()
    
    # Names should be 1-4 words (first, middle, last names)
    if len(words) > 4:
        return False
    
    # Check for common request/command words that indicate it's not a name
    exclude_words = {
        'help', 'assist', 'support', 'onboard', 'onboarding', 'lead', 'leads',
        'please', 'can', 'could', 'would', 'will', 'want', 'need', 'like',
        'me', 'to', 'with', 'for', 'get', 'start', 'begin', 'show', 'tell',
        'guide', 'walk', 'through', 'process', 'form', 'fill', 'complete',
        'submit', 'send', 'provide', 'give', 'share', 'enter', 'input'
    }
    
    text_lower = text.lower()
    if any(word in text_lower for word in exclude_words):
        return False
    
    # Check if it's just a single word that's a common verb/command
    if len(words) == 1 and text_lower in ['help', 'start', 'begin', 'show', 'tell']:
        return False
    
    # Check if it contains only letters and spaces
    if not re.match(r'^[A-Za-z\s]+$', text):
        return False
    
    # Check if each word starts with a capital letter (proper name format)
    if not all(word[0].isupper() for word in words if word):
        return False
    
    # Additional validation: ensure it looks like a real name pattern
    # Most names have at least 2 words (first + last) or are single word names
    if len(words) == 1:
        # Single word names should be reasonable length
        return 2 <= len(words[0]) <= 15
    elif len(words) == 2:
        # First + Last name pattern
        return all(2 <= len(word) <= 15 for word in words)
    elif len(words) == 3:
        # First + Middle + Last name pattern
        return all(2 <= len(word) <= 15 for word in words)
    elif len(words) == 4:
        # First + Middle + Middle + Last or similar patterns
        return all(2 <= len(word) <= 15 for word in words)
    
    return True


app = FastAPI(title="AI Hackathon Backend", version="0.1.0")

origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


SESSION_STATE: Dict[str, LeadFields] = {}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    try:
        # Retrieve current lead state
        lead = SESSION_STATE.get(req.session_id, LeadFields())

        # Update with any implicit info from latest user message
        if req.messages:
            try:
                lead = infer_lead_fields_from_message(req.messages[-1].content, lead)
            except Exception as e:
                print(f"Error inferring lead fields: {e}")
                # Continue with existing lead state

        # Retrieve RAG contexts
        query_text = req.messages[-1].content if req.messages else ""
        try:
            retrieved_pairs = similarity_search(query_text, k=4)
            contexts = [c for c, _m in retrieved_pairs]
            ctx_models = [RetrievedContext(content_preview=c[:200], source=_m.get("source")) for c, _m in retrieved_pairs]
        except Exception as e:
            print(f"Error retrieving contexts: {e}")
            contexts = []
            ctx_models = []

        # Generate LLM reply
        try:
            messages_dicts = [m.dict() for m in req.messages]
            reply = generate_reply(messages_dicts, contexts)
            
            # Extract name from AI's response when it confirms the name
            # Look for patterns like "Thanks [Full Name]!" or "Great [Full Name]!"
            if not lead.full_name and ("Thanks" in reply or "Great" in reply):
                import re
                # More flexible pattern to capture full names
                # This handles various AI response formats
                name_match = re.search(r'(?:Thanks|Great)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', reply)
                if name_match:
                    detected_name = name_match.group(1)
                    lead.full_name = detected_name
                    print(f"🔍 AI confirmed full name: '{detected_name}'")
                else:
                    # Fallback: try to capture name after "Thanks" or "Great" until punctuation
                    fallback_match = re.search(r'(?:Thanks|Great)\s+([^!.,?]+)', reply)
                    if fallback_match:
                        potential_name = fallback_match.group(1).strip()
                        # Check if it looks like a name (contains letters and spaces)
                        if re.match(r'^[A-Za-z\s]+$', potential_name) and len(potential_name.split()) >= 1:
                            lead.full_name = potential_name.title()
                            print(f"🔍 Fallback name extraction: '{potential_name.title()}'")
                    
                    # Additional fallback: extract name from user's message if AI didn't confirm
                    if not lead.full_name and req.messages:
                        user_message = req.messages[-1].content.strip()
                        # Check if user message looks like a full name using our validation function
                        if is_likely_full_name(user_message):
                            lead.full_name = user_message.title()
                            print(f"🔍 User message full name extraction: '{user_message.title()}'")
                        else:
                            print(f"⚠️ Skipping user message '{user_message}' - doesn't look like a full name")
        except Exception as e:
            print(f"Error generating reply: {e}")
            # Provide a fallback response
            if "onboard" in query_text.lower() or "lead" in query_text.lower():
                reply = "I'd be happy to help you with lead onboarding! Let me collect your details. What's your **full name** (first, middle, and last name)?"
            elif "help" in query_text.lower() or "assist" in query_text.lower():
                reply = "I'm here to help! What would you like assistance with today?"
            else:
                reply = "I'm here to help you with lead onboarding or general assistance. What would you like to do?"
    except Exception as e:
        print(f"Unexpected error in chat endpoint: {e}")
        # Return a basic response if everything fails
        return ChatResponse(
            reply="I'm experiencing some technical difficulties. Please try again in a moment.",
            lead_fields=LeadFields(),
            completed={},
            contexts=[],
            auto_submitted=False,
            submission_id=None,
        )

    # Save updated state
    SESSION_STATE[req.session_id] = lead
    
    # Check if all required fields are complete and auto-submit
    completion = completion_status(lead)
    auto_submitted = False
    submission_id = None
    
    if all([completion["full_name"], completion["business_type"], 
            completion["pan"], completion["aadhaar"]]):
        try:
            # Auto-submit the lead
            doc = {
                "session_id": req.session_id,
                "full_name": lead.full_name,
                "business_type": lead.business_type,
                "website": lead.website,
                "pan": encrypt_sensitive(lead.pan),
                "aadhaar": encrypt_sensitive(lead.aadhaar),
            }
            submission_id = insert_lead(doc)
            auto_submitted = True
            # Add a confirmation message to the reply
            reply += f"\n\n✅ Perfect! I've automatically saved your details with ID: {submission_id}. Thank you for completing the onboarding process!"
        except Exception as e:
            # If auto-submission fails, just continue normally
            print(f"Auto-submission failed: {e}")

    return ChatResponse(
        reply=reply,
        lead_fields=lead,
        completed=completion,
        contexts=ctx_models,
        auto_submitted=auto_submitted,
        submission_id=submission_id,
    )


@app.post("/api/submit", response_model=Dict[str, str])
async def submit_lead(req: LeadSubmitRequest):
    lead = req.lead
    # Basic validation: PAN and Aadhaar presence
    if not (lead.full_name and lead.business_type and lead.pan and lead.aadhaar):
        raise HTTPException(status_code=400, detail="Missing required fields")

    try:
        doc = {
            "session_id": req.session_id,
            "full_name": lead.full_name,
            "business_type": lead.business_type,
            "website": lead.website,
            "pan": encrypt_sensitive(lead.pan),
            "aadhaar": encrypt_sensitive(lead.aadhaar),
        }
        inserted_id = insert_lead(doc)
        return {"id": inserted_id, "status": "ok"}
    except ConnectionError as e:
        raise HTTPException(status_code=503, detail=f"Database connection failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save lead: {str(e)}")


@app.post("/api/upload", response_model=UploadResponse)
async def upload(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    upload_dir = os.environ.get("UPLOAD_DIR", "./storage/uploads")
    texts: List[str] = []
    metas: List[dict] = []
    errors: List[str] = []
    count = 0

    for f in files:
        # Starlette UploadFile does not always expose size; validate after read
        data = await f.read()
        ok, err = validate_pdf(f.filename, len(data))
        if not ok:
            errors.append(f"{f.filename}: {err}")
            continue
        try:
            save_path = save_upload_to_disk(upload_dir, f.filename, data)
            text = extract_text_from_pdf(save_path)
            if text.strip():
                texts.append(text)
                metas.append({"source": f.filename})
                count += 1
            else:
                errors.append(f"{f.filename}: No extractable text")
        except Exception as e:
            errors.append(f"{f.filename}: {e}")

    if texts:
        try:
            chunks = index_texts(texts, metas)
        except Exception as e:
            return UploadResponse(success=False, message=str(e), files_indexed=0, errors=errors)
        return UploadResponse(success=True, message="Indexed", files_indexed=chunks, errors=errors)
    else:
        return UploadResponse(success=False, message="No valid files", files_indexed=0, errors=errors)


@app.get("/health")
async def health():
    mongo_status = "ok" if test_connection() else "failed"
    return {
        "status": "ok",
        "mongodb": mongo_status,
        "vector_db": "ok"  # FAISS is local, so always available
    }


