import asyncio
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.schemas.user import UserCreate
from app.services import user_service

def seed_users():
    db = SessionLocal()
    try:
        users_to_create = [
            UserCreate(
                email="nadeesha@flowora.lk",
                password="password",
                first_name="Operations",
                last_name="Manager"
            ),
            UserCreate(
                email="kavindu@flowora.lk",
                password="password",
                first_name="Team",
                last_name="Member"
            )
        ]

        for user_in in users_to_create:
            existing_user = user_service.get_user_by_email(db, email=user_in.email)
            if not existing_user:
                user_service.create_user(db, user=user_in)
                print(f"Created user: {user_in.email}")
            else:
                print(f"User already exists: {user_in.email}")
                
        print("Database seeding completed.")
    except Exception as e:
        print(f"Error seeding users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_users()
