#!/usr/bin/env python3
"""
Test improved lead detection with case-insensitive input
"""
import sys
import os
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

# Import the app to load environment variables
from app.main import app
from app.chat_logic import infer_lead_fields_from_message, completion_status
from app.schemas import LeadFields

print("🔍 Testing improved lead detection with case-insensitive input...")

# Create a test lead
lead = LeadFields()

# Test messages with different case variations
test_messages = [
    "RAHUL",           # All caps
    "rahul",           # All lowercase
    "Rahul",           # Title case
    "FREELANCER",      # All caps business type
    "freelancer",      # All lowercase business type
    "yes i have: airesponder.xyz",  # Website
    "PAN NUMBER IS DFGTH3476H",     # All caps PAN
    "123456789012"     # Aadhaar
]

print("\n🔍 Processing test messages...")
for i, message in enumerate(test_messages, 1):
    print(f"Message {i}: {message}")
    lead = infer_lead_fields_from_message(message, lead)
    print(f"  -> Name: {lead.full_name}")
    print(f"  -> Business: {lead.business_type}")
    print(f"  -> Website: {lead.website}")
    print(f"  -> PAN: {lead.pan}")
    print(f"  -> Aadhaar: {lead.aadhaar}")

# Check completion status
completion = completion_status(lead)
print(f"\n🔍 Completion status: {completion}")

# Check if all required fields are complete
all_complete = all([completion["full_name"], completion["business_type"], 
                    completion["pan"], completion["aadhaar"]])

print(f"🔍 All required fields complete: {all_complete}")

if all_complete:
    print("✅ All required fields detected successfully!")
else:
    missing = [k for k, v in completion.items() if not v and k in ["full_name", "business_type", "pan", "aadhaar"]]
    print(f"❌ Missing fields: {missing}")
