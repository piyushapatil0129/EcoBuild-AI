"""
Authentication endpoints: register, login, current user profile.
"""
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, status
from app.database.connection import get_database
from app.models.user import UserRegister, UserLogin, UserResponse, TokenResponse
from app.services.auth_service import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(req: UserRegister):
    db = get_database()
    users = db["users"]
    
    existing = await users.find_one({"email": req.email.lower().strip()})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
        
    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "name": req.name.strip(),
        "email": req.email.lower().strip(),
        "passwordHash": hash_password(req.password),
        "role": req.role,
        "createdAt": datetime.utcnow().isoformat()
    }
    
    await users.insert_one(user_doc)
    
    token = create_access_token({"sub": user_id, "email": user_doc["email"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": user_doc["name"],
            "email": user_doc["email"],
            "role": user_doc["role"],
            "createdAt": user_doc["createdAt"]
        }
    }

@router.post("/login", response_model=TokenResponse)
async def login(req: UserLogin):
    db = get_database()
    users = db["users"]
    
    user = await users.find_one({"email": req.email.lower().strip()})
    if not user or not verify_password(req.password, user.get("passwordHash", "")):
        raise HTTPException(status_code=400, detail="Invalid email or password.")
        
    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id, "email": user["email"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "Architect"),
            "createdAt": user.get("createdAt")
        }
    }

@router.get("/me", response_model=UserResponse)
async def get_profile(user: dict = Depends(get_current_user)):
    return {
        "id": str(user["_id"]),
        "name": user.get("name", "User"),
        "email": user.get("email", ""),
        "role": user.get("role", "Architect"),
        "createdAt": user.get("createdAt")
    }
