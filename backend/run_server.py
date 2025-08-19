#!/usr/bin/env python3
"""
Simple server runner for debugging
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    try:
        print("Starting server...")
        print("Importing uvicorn...")
        import uvicorn
        
        print("Importing app...")
        from app.main import app
        
        print("Starting uvicorn server...")
        uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
