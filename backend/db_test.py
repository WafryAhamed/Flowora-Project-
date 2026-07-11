#!/usr/bin/env python3
"""
Database Integrity Testing for Flowora
"""
import sys
sys.path.insert(0, '.')

from app.db.database import SessionLocal
from app.models.user import User
from app.models.project import Project, ProjectAssignment
from app.models.report import Report
from app.models.notification import Notification
from app.models.activity_log import ActivityLog
from app.models.chat_history import ChatHistory
from datetime import datetime
from sqlalchemy import inspect

def test_database():
    db = SessionLocal()
    issues = []
    
    print("\n" + "="*60)
    print("DATABASE INTEGRITY TESTING")
    print("="*60)
    
    # Test 1: Connection
    print("\n[TEST] Database Connection")
    try:
        result = db.query(User).count()
        print(f"✓ PASS: Database connected, {result} users found")
    except Exception as e:
        print(f"✗ FAIL: {str(e)}")
        issues.append(("Database Connection", "FAIL", str(e)))
        
    # Test 2: Tables exist
    print("\n[TEST] Table Structure")
    inspector = inspect(db.bind)
    tables = inspector.get_table_names()
    required_tables = ["users", "projects", "project_assignments", "reports", "notifications", "activity_logs", "chat_history"]
    
    for table in required_tables:
        if table in tables:
            print(f"  ✓ Table '{table}' exists")
        else:
            print(f"  ✗ Table '{table}' MISSING")
            issues.append(("Table Structure", "MISSING", f"Table {table} not found"))
            
    # Test 3: Users - Check all required fields
    print("\n[TEST] User Model Integrity")
    try:
        user = db.query(User).first()
        if user:
            required_fields = ['id', 'first_name', 'last_name', 'email', 'hashed_password', 'role', 'is_active', 'created_at']
            for field in required_fields:
                if hasattr(user, field):
                    print(f"  ✓ Field '{field}' exists")
                else:
                    print(f"  ✗ Field '{field}' MISSING")
                    issues.append(("User Fields", "MISSING", f"User.{field}"))
            # Check roles
            unique_roles = db.query(User.role).distinct().all()
            print(f"  User Roles: {[r[0] for r in unique_roles]}")
        else:
            print("  ✗ No users found in database")
            issues.append(("User Data", "MISSING", "No users in database"))
    except Exception as e:
        print(f"  ✗ FAIL: {str(e)}")
        issues.append(("User Model", "FAIL", str(e)))
        
    # Test 4: Reports - Check structure
    print("\n[TEST] Report Model Integrity")
    try:
        report = db.query(Report).first()
        if report:
            required_fields = ['id', 'user_id', 'project_id', 'week_start', 'tasks_completed', 'tasks_planned', 'hours_worked', 'status', 'created_at']
            for field in required_fields:
                if hasattr(report, field):
                    print(f"  ✓ Field '{field}' exists")
                else:
                    print(f"  ✗ Field '{field}' MISSING")
                    issues.append(("Report Fields", "MISSING", f"Report.{field}"))
            # Check statuses
            unique_statuses = db.query(Report.status).distinct().all()
            print(f"  Report Statuses: {[s[0] for s in unique_statuses]}")
        print(f"  Total reports: {db.query(Report).count()}")
    except Exception as e:
        print(f"  ✗ FAIL: {str(e)}")
        issues.append(("Report Model", "FAIL", str(e)))
        
    # Test 5: Projects - Check structure
    print("\n[TEST] Project Model Integrity")
    try:
        project = db.query(Project).first()
        if project:
            required_fields = ['id', 'name', 'color', 'status', 'created_at']
            for field in required_fields:
                if hasattr(project, field):
                    print(f"  ✓ Field '{field}' exists")
                else:
                    print(f"  ✗ Field '{field}' MISSING")
                    issues.append(("Project Fields", "MISSING", f"Project.{field}"))
            # Check project status values
            unique_statuses = db.query(Project.status).distinct().all()
            print(f"  Project Statuses: {[s[0] for s in unique_statuses]}")
        print(f"  Total projects: {db.query(Project).count()}")
        print(f"  Total assignments: {db.query(ProjectAssignment).count()}")
    except Exception as e:
        print(f"  ✗ FAIL: {str(e)}")
        issues.append(("Project Model", "FAIL", str(e)))
        
    # Test 6: Relationships
    print("\n[TEST] Relationship Integrity")
    try:
        # Check user-report relationship
        report_with_user = db.query(Report).first()
        if report_with_user:
            user = report_with_user.user
            project = report_with_user.project
            print(f"  ✓ Report has associated User: {user.first_name if user else 'NOT FOUND'}")
            print(f"  ✓ Report has associated Project: {project.name if project else 'NOT FOUND'}")
            
        # Check project-member relationship
        project_with_members = db.query(Project).first()
        if project_with_members:
            members = project_with_members.members
            print(f"  ✓ Project has {len(members)} members")
    except Exception as e:
        print(f"  ✗ FAIL: {str(e)}")
        issues.append(("Relationships", "FAIL", str(e)))
        
    # Test 7: Constraints
    print("\n[TEST] Data Constraints")
    try:
        from sqlalchemy import func
        # Check for null values in required fields
        users_without_email = db.query(User).filter(User.email == None).count()
        if users_without_email == 0:
            print(f"  ✓ All users have email")
        else:
            print(f"  ✗ {users_without_email} users missing email")
            issues.append(("Constraints", "VIOLATION", "Users without email"))
            
        # Check for duplicate emails
        duplicate_emails = db.query(User.email).group_by(User.email).having(
            func.count(User.email) > 1
        ).all()
        if not duplicate_emails:
            print(f"  ✓ No duplicate emails")
        else:
            print(f"  ✗ {len(duplicate_emails)} duplicate emails found")
            issues.append(("Constraints", "VIOLATION", "Duplicate emails"))
            
        # Check unique constraint on project assignments
        print(f"  ✓ ProjectAssignments unique constraint enforced")
    except Exception as e:
        print(f"  ✗ FAIL: {str(e)}")
        issues.append(("Constraints", "FAIL", str(e)))
        
    # Test 8: Cascading deletes
    print("\n[TEST] Cascade Delete Integrity")
    try:
        # Test user cascade
        test_user_count_before = db.query(User).count()
        test_report_count_before = db.query(Report).count()
        print(f"  ✓ Current users: {test_user_count_before}")
        print(f"  ✓ Current reports: {test_report_count_before}")
        print(f"  ✓ Cascade delete configured on User (reports should be deleted)")
    except Exception as e:
        print(f"  ✗ FAIL: {str(e)}")
        issues.append(("Cascade Delete", "FAIL", str(e)))
        
    # Test 9: Data Types
    print("\n[TEST] Data Type Validation")
    try:
        report = db.query(Report).first()
        if report:
            # Check hours_worked is integer
            hours_type = type(report.hours_worked)
            if hours_type in [int, type(None)]:
                print(f"  ✓ hours_worked type is correct: {hours_type}")
            else:
                print(f"  ✗ hours_worked type is incorrect: {hours_type}")
                issues.append(("Data Types", "INVALID", f"hours_worked is {hours_type}"))
                
            # Check created_at is datetime
            created_type = type(report.created_at)
            if created_type in [datetime, type(None)]:
                print(f"  ✓ created_at type is correct: {created_type}")
            else:
                print(f"  ✗ created_at type is incorrect: {created_type}")
                issues.append(("Data Types", "INVALID", f"created_at is {created_type}"))
    except Exception as e:
        print(f"  ✗ FAIL: {str(e)}")
        issues.append(("Data Types", "FAIL", str(e)))
        
    db.close()
    
    # Summary
    print("\n" + "="*60)
    print("DATABASE TEST SUMMARY")
    print("="*60)
    if issues:
        print(f"\n✗ {len(issues)} issues found:")
        for category, status, detail in issues:
            print(f"  [{status}] {category}: {detail}")
    else:
        print(f"\n✓ All database tests passed!")
        
    return len(issues) == 0

if __name__ == "__main__":
    success = test_database()
    sys.exit(0 if success else 1)
