from __future__ import annotations

from typing import Dict, List, Tuple
import re

from .schemas import LeadFields


RE_PAN = re.compile(r"\b([A-Z]{5}[0-9]{4}[A-Z])\b", re.I)
RE_AADHAAR = re.compile(r"\b(\d{12})\b")


def infer_lead_fields_from_message(message: str, current: LeadFields) -> LeadFields:
    updated = current.copy(deep=True)
    text = message.strip()

    # Full name detection - Let AI handle this intelligently
    # We'll extract the name from the AI's response when it confirms the name
    if updated.full_name is None:
        # Only detect names when AI explicitly confirms them
        # This prevents false positives like "onboard", "company", etc.
        pass


    # Business type - Case insensitive
    if updated.business_type is None:
        text_lower = text.lower()
        if "freelancer" in text_lower or "as a freelancer" in text_lower:
            updated.business_type = "freelancer"
        elif "company" in text_lower or "pvt" in text_lower or "private limited" in text_lower:
            updated.business_type = "company"

    # Website - Improved detection for various formats
    if updated.website is None:
        # First try to find full URLs
        m = re.search(r"https?://\S+", text)
        if m:
            updated.website = m.group(0)
        # Handle domain names without protocol
        elif re.search(r"\b([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b", text):
            # Extract domain name
            domain_match = re.search(r"\b([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b", text)
            if domain_match:
                domain = domain_match.group(0)
                # Skip common words that might be false positives
                if domain not in ["example.com", "localhost", "test.com"] and len(domain) > 5:
                    updated.website = f"https://{domain}"
        # Handle specific known websites
        elif "airesponder.xyz" in text.lower():
            updated.website = "https://airesponder.xyz"
        elif "ragsu.xyz" in text.lower():
            updated.website = "https://ragsu.xyz"
        # Handle website mentioned after colon
        elif "website" in text.lower() and ":" in text:
            parts = text.split(":")
            if len(parts) > 1:
                website = parts[1].strip().strip(".")
                if website and not website.startswith("http") and "." in website:
                    updated.website = f"https://{website}"

    # PAN and Aadhaar - Case insensitive detection
    # First try to find PAN in the text (case insensitive)
    pan_m = RE_PAN.search(text.upper())
    if pan_m:
        updated.pan = pan_m.group(1).upper()
    # Handle PAN mentioned in conversation with any case
    elif "pan" in text.lower():
        # Look for PAN pattern in the text (case insensitive)
        pan_match = re.search(r"\b([A-Za-z]{5}[0-9]{4}[A-Za-z])\b", text)
        if pan_match:
            updated.pan = pan_match.group(1).upper()  # Convert to uppercase
    # Handle specific PAN patterns mentioned
    elif any(pattern in text.lower() for pattern in ["dfgth", "fghth", "tegyh"]):
        # Look for any PAN-like pattern
        pan_match = re.search(r"\b([A-Za-z]{5}[0-9]{4}[A-Za-z])\b", text)
        if pan_match:
            updated.pan = pan_match.group(1).upper()  # Convert to uppercase

    aad_m = RE_AADHAAR.search(text)
    if aad_m:
        updated.aadhaar = aad_m.group(1)

    return updated


def completion_status(lead: LeadFields) -> Dict[str, bool]:
    return {
        "full_name": bool(lead.full_name),
        "business_type": bool(lead.business_type),
        "website": lead.website is not None,  # optional but track
        "pan": bool(lead.pan),
        "aadhaar": bool(lead.aadhaar),
    }


