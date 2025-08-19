from __future__ import annotations

from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field, HttpUrl, field_validator


Role = Literal["user", "assistant", "system"]


class Message(BaseModel):
    role: Role
    content: str


class LeadFields(BaseModel):
    full_name: Optional[str] = None
    business_type: Optional[Literal["company", "freelancer"]] = None
    website: Optional[str] = None
    pan: Optional[str] = None
    aadhaar: Optional[str] = None

    @field_validator("pan")
    @classmethod
    def validate_pan(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return v
        import re
        vv = v.strip().upper()
        if not re.fullmatch(r"[A-Z]{5}[0-9]{4}[A-Z]", vv):
            # Allow partial during collection; validation can be strict on submit
            return vv
        return vv

    @field_validator("aadhaar")
    @classmethod
    def validate_aadhaar(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return v
        import re
        vv = v.replace(" ", "").strip()
        if not re.fullmatch(r"\d{12}", vv):
            return vv
        return vv


class ChatRequest(BaseModel):
    session_id: str = Field(..., description="Client-generated session id")
    messages: List[Message]


class RetrievedContext(BaseModel):
    content_preview: str
    source: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    lead_fields: LeadFields
    completed: Dict[str, bool]
    contexts: List[RetrievedContext] = []
    auto_submitted: bool = False
    submission_id: Optional[str] = None


class LeadSubmitRequest(BaseModel):
    session_id: str
    lead: LeadFields


class UploadResponse(BaseModel):
    success: bool
    message: str
    files_indexed: int = 0
    errors: List[str] = []


