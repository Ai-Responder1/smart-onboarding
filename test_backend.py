#!/usr/bin/env python3
"""
Test script to verify backend imports and basic functionality
"""

import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def test_imports():
    """Test that all backend modules can be imported without errors"""
    try:
        print("Testing backend imports...")
        
        # Test basic imports
        from app.schemas import LeadFields, ChatRequest, ChatResponse
        print("✓ Schemas imported successfully")
        
        from app.security import encrypt_sensitive, decrypt_sensitive
        print("✓ Security module imported successfully")
        
        from app.db import get_mongo_client, test_connection
        print("✓ Database module imported successfully")
        
        from app.vectorstore import get_embeddings, get_faiss_path
        print("✓ Vector store module imported successfully")
        
        from app.pdf_processing import validate_pdf, extract_text_from_pdf
        print("✓ PDF processing module imported successfully")
        
        from app.llm import get_llm, build_prompt
        print("✓ LLM module imported successfully")
        
        from app.chat_logic import infer_lead_fields_from_message, completion_status
        print("✓ Chat logic module imported successfully")
        
        from app.main import app
        print("✓ Main FastAPI app imported successfully")
        
        print("\n✅ All backend modules imported successfully!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_basic_functionality():
    """Test basic functionality of key components"""
    try:
        print("\nTesting basic functionality...")
        
        # Test LeadFields creation
        from app.schemas import LeadFields
        lead = LeadFields(full_name="Test User", business_type="company")
        print("✓ LeadFields creation works")
        
        # Test validation
        from app.pdf_processing import validate_pdf
        is_valid, error = validate_pdf("test.pdf", 1024)
        print("✓ PDF validation works")
        
        # Test completion status
        from app.chat_logic import completion_status
        status = completion_status(lead)
        print("✓ Completion status works")
        
        print("\n✅ Basic functionality tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Functionality test error: {e}")
        return False

if __name__ == "__main__":
    print("AI Hackathon Backend Test")
    print("=" * 40)
    
    imports_ok = test_imports()
    
    if imports_ok:
        functionality_ok = test_basic_functionality()
        if functionality_ok:
            print("\n🎉 All tests passed! Backend is ready to run.")
            sys.exit(0)
        else:
            print("\n❌ Functionality tests failed.")
            sys.exit(1)
    else:
        print("\n❌ Import tests failed.")
        sys.exit(1)
