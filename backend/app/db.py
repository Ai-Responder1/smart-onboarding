from __future__ import annotations

import os
from typing import Any, Dict
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError


def get_mongo_client() -> MongoClient:
    mongo_uri = os.environ.get("MONGODB_URI")
    if not mongo_uri:
        raise ValueError("MONGODB_URI environment variable is required for MongoDB Atlas connection")
    
    # MongoDB Atlas connection with proper timeout and retry settings
    client = MongoClient(
        mongo_uri,
        serverSelectionTimeoutMS=10000,  # 10 seconds for Atlas
        connectTimeoutMS=10000,
        socketTimeoutMS=10000,
        maxPoolSize=10,
        retryWrites=True,
        w="majority"
    )
    return client


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


