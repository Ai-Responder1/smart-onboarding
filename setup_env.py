#!/usr/bin/env python3
"""
Environment Setup Script for AI Hackathon
This script helps you quickly set up your environment variables.
"""

import os
import sys
from pathlib import Path

def create_env_file(env_type, source_file, target_file):
    """Create .env file from example template"""
    source_path = Path(source_file)
    target_path = Path(target_file)
    
    if not source_path.exists():
        print(f"❌ Source file {source_file} not found!")
        return False
    
    if target_path.exists():
        print(f"⚠️  {target_file} already exists. Skipping...")
        return True
    
    try:
        with open(source_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        with open(target_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Created {env_type} environment file: {target_file}")
        return True
    except Exception as e:
        print(f"❌ Failed to create {target_file}: {e}")
        return False

def get_user_input(prompt, default=""):
    """Get user input with default value"""
    if default:
        user_input = input(f"{prompt} [{default}]: ").strip()
        return user_input if user_input else default
    else:
        return input(f"{prompt}: ").strip()

def setup_backend_env():
    """Set up backend environment variables"""
    print("\n🔧 Setting up Backend Environment")
    print("=" * 40)
    
    # Create .env file from template
    if not create_env_file("Backend", "backend/env.example", "backend/.env"):
        return False
    
    # Get OpenAI API key
    print("\n📝 Required Configuration:")
    openai_key = get_user_input("Enter your OpenAI API key")
    
    if not openai_key or openai_key == "your_openai_api_key_here":
        print("⚠️  Please update your OpenAI API key in backend/.env")
        print("   Get your key from: https://platform.openai.com/api-keys")
    else:
        # Update the .env file with the actual key
        try:
            with open("backend/.env", "r", encoding="utf-8") as f:
                content = f.read()
            
            content = content.replace("your_openai_api_key_here", openai_key)
            
            with open("backend/.env", "w", encoding="utf-8") as f:
                f.write(content)
            
            print("✅ OpenAI API key updated in backend/.env")
        except Exception as e:
            print(f"⚠️  Could not update API key automatically: {e}")
            print("   Please manually update backend/.env")
    
    print("\n📋 Optional Backend Configuration:")
    print("   - MongoDB URI (default: mongodb://localhost:27017)")
    print("   - Vector DB directory (default: ./storage/vector_db)")
    print("   - Upload directory (default: ./storage/uploads)")
    print("   - CORS origins (default: localhost URLs)")
    print("   - Server host/port (default: 0.0.0.0:8000)")
    
    return True

def setup_frontend_env():
    """Set up frontend environment variables"""
    print("\n🎨 Setting up Frontend Environment")
    print("=" * 40)
    
    # Create .env file from template
    if not create_env_file("Frontend", "frontend/env.example", "frontend/.env"):
        return False
    
    # Get backend URL
    print("\n📝 Required Configuration:")
    backend_url = get_user_input("Enter backend API URL", "http://localhost:8000")
    
    if backend_url and backend_url != "http://localhost:8000":
        # Update the .env file with the actual backend URL
        try:
            with open("frontend/.env", "r", encoding="utf-8") as f:
                content = f.read()
            
            content = content.replace("http://localhost:8000", backend_url)
            
            with open("frontend/.env", "w", encoding="utf-8") as f:
                f.write(content)
            
            print("✅ Backend API URL updated in frontend/.env")
        except Exception as e:
            print(f"⚠️  Could not update backend URL automatically: {e}")
            print("   Please manually update frontend/.env")
    
    print("\n📋 Optional Frontend Configuration:")
    print("   - Development mode (default: true)")
    print("   - Debug logging (default: false)")
    print("   - Theme settings (default: light)")
    print("   - Performance features (default: disabled)")
    
    return True

def generate_fernet_key():
    """Generate a Fernet encryption key"""
    try:
        from cryptography.fernet import Fernet
        key = Fernet.generate_key()
        return key.decode()
    except ImportError:
        print("⚠️  cryptography package not available")
        return None

def main():
    """Main setup function"""
    print("🚀 AI Hackathon Environment Setup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not (Path("backend").exists() and Path("frontend").exists()):
        print("❌ Please run this script from the AI Hackathon root directory")
        print("   Expected structure:")
        print("   AI Hackathon/")
        print("   ├── backend/")
        print("   ├── frontend/")
        print("   └── setup_env.py")
        sys.exit(1)
    
    # Setup backend
    backend_ok = setup_backend_env()
    
    # Setup frontend
    frontend_ok = setup_frontend_env()
    
    # Generate encryption key
    print("\n🔐 Security Configuration")
    print("=" * 40)
    fernet_key = generate_fernet_key()
    if fernet_key:
        print(f"✅ Generated Fernet encryption key")
        print(f"   Add this to backend/.env:")
        print(f"   PAN_AADHAAR_ENC_KEY={fernet_key}")
    else:
        print("⚠️  Could not generate encryption key")
        print("   Install cryptography: pip install cryptography")
    
    # Summary
    print("\n📊 Setup Summary")
    print("=" * 40)
    print(f"Backend: {'✅ Ready' if backend_ok else '❌ Failed'}")
    print(f"Frontend: {'✅ Ready' if frontend_ok else '❌ Failed'}")
    print(f"Encryption: {'✅ Generated' if fernet_key else '⚠️  Manual setup needed'}")
    
    if backend_ok and frontend_ok:
        print("\n🎉 Environment setup completed!")
        print("\n📋 Next steps:")
        print("1. Review and edit backend/.env if needed")
        print("2. Review and edit frontend/.env if needed")
        print("3. Install backend dependencies: cd backend && pip install -r requirements.txt")
        print("4. Install frontend dependencies: cd frontend && npm install")
        print("5. Start MongoDB service")
        print("6. Run backend: cd backend && uvicorn app.main:app --reload")
        print("7. Run frontend: cd frontend && npm run dev")
        
        print("\n🔍 Validation:")
        print("- Backend: python test_backend.py")
        print("- Frontend: npm run build")
    else:
        print("\n❌ Setup incomplete. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
