"""
Database Connection Manager.
Supports MongoDB Atlas via Motor, with automated fallback to MockDatabase for zero-config startup.
"""
import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.database.memory_store import MockDatabase

logger = logging.getLogger("ecobuild.database")

_DB_INSTANCE = None
_CLIENT = None

async def connect_to_database():
    global _DB_INSTANCE, _CLIENT
    mongo_uri = os.getenv("MONGODB_URI", "").strip()
    db_name = os.getenv("MONGODB_DB_NAME", "ecobuild_ai")

    if mongo_uri:
        try:
            logger.info("Attempting connection to MongoDB Atlas at %s...", mongo_uri.split("@")[-1] if "@" in mongo_uri else "local")
            _CLIENT = AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=3000)
            # Verify connectivity
            await _CLIENT.admin.command('ping')
            _DB_INSTANCE = _CLIENT[db_name]
            logger.info("Successfully connected to MongoDB Atlas database: %s", db_name)
            return _DB_INSTANCE
        except Exception as e:
            logger.warning("Could not connect to MongoDB Atlas (%s). Falling back to resilient in-memory document engine.", str(e))
    else:
        logger.info("No MONGODB_URI specified in environment. Initializing local in-memory document engine.")

    _DB_INSTANCE = MockDatabase(db_name)
    return _DB_INSTANCE

def get_database():
    global _DB_INSTANCE
    if _DB_INSTANCE is None:
        # Synchronous fallback before async lifespan runs
        _DB_INSTANCE = MockDatabase("ecobuild_ai")
    return _DB_INSTANCE

async def close_database_connection():
    global _CLIENT
    if _CLIENT is not None:
        _CLIENT.close()
        logger.info("Closed MongoDB connection.")
