from __future__ import annotations

import os
from typing import Any, Dict
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv

# Load environment variables if not already loaded
if not os.environ.get("MONGODB_URI"):
    load_dotenv()


def get_mongo_client() -> MongoClient:
    mongo_uri = os.environ.get("MONGODB_URI")
    if not mongo_uri:
        raise ValueError("MONGODB_URI environment variable is required for MongoDB Atlas connection")
    
    # MongoDB Atlas connection with proper timeout and retry settings
    # Try to fix SSL issues on Windows
    try:
        client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=30000,  # 30 seconds for Atlas
            connectTimeoutMS=30000,
            socketTimeoutMS=30000,
            maxPoolSize=10,
            retryWrites=True,
            w="majority",
            tls=True,
            tlsAllowInvalidCertificates=False,
            tlsAllowInvalidHostnames=False
        )
        return client
    except Exception as e:
        print(f"First connection attempt failed: {e}")
        # Fallback: try without explicit TLS settings
        try:
            client = MongoClient(
                mongo_uri,
                serverSelectionTimeoutMS=30000,
                connectTimeoutMS=30000,
                socketTimeoutMS=30000,
                maxPoolSize=10,
                retryWrites=True,
                w="majority"
            )
            return client
        except Exception as e2:
            print(f"Fallback connection also failed: {e2}")
            raise e2


def get_db():
    client = get_mongo_client()
    db_name = os.environ.get("MONGODB_DB", "ai_hackathon")
    return client[db_name]


def test_connection() -> bool:
    """Test MongoDB Atlas connection"""
    try:
        client = get_mongo_client()
        # Test connection with a ping command
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB Atlas!")
        return True
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print(f"❌ MongoDB Atlas connection failed: {e}")
        return False
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


def insert_lead(lead_doc: Dict[str, Any]) -> str:
    """Insert lead document into MongoDB Atlas"""
    try:
        db = get_db()
        res = db.leads.insert_one(lead_doc)
        print(f"✅ Lead successfully saved to MongoDB Atlas with ID: {res.inserted_id}")
        return str(res.inserted_id)
    except Exception as e:
        print(f"❌ Failed to save lead to MongoDB Atlas: {e}")
        raise Exception(f"Database error: {e}")


