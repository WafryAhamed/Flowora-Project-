from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import User as UserSchema, UserUpdate
from app.api.dependencies import get_current_user, get_current_active_manager

router = APIRouter()

@router.get("", response_model=List[UserSchema])
def read_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_manager)):
    """Retrieve all users. (Manager only)"""
    return db.query(User).all()

@router.patch("/{user_id}/role", response_model=UserSchema)
def update_user_role(
    user_id: str,
    role_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_manager)
):
    """Update a user's role. (Manager only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if role_update.role:
        user.role = role_update.role
        db.commit()
        db.refresh(user)
    return user

@router.put("/{user_id}", response_model=UserSchema)
def update_user_profile(
    user_id: str,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user profile."""
    if current_user.id != user_id and current_user.role not in ["MANAGER", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "password":
            from app.core.security import get_password_hash
            setattr(user, "hashed_password", get_password_hash(value))
        else:
            setattr(user, key, value)
            
    try:
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Update failed, possibly due to a duplicate email.")
    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_manager)
):
    """Delete a user. (Manager only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
