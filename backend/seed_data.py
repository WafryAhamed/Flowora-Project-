"""
Flowora Database Seed Script
Seeds ~20 users, 8 projects, 30+ reports, 20+ notifications, 20+ activity logs
All users have password: password
"""
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.project import Project, ProjectAssignment
from app.models.report import Report
from app.models.notification import Notification
from app.models.activity_log import ActivityLog
from app.core.security import get_password_hash
from datetime import datetime, timedelta
import random
import uuid


def generate_uuid():
    return str(uuid.uuid4())


def seed_database():
    db = SessionLocal()
    try:
        # ===========================================
        # 1. USERS (20 total: 1 admin, 3 managers, 16 members)
        # All passwords: password
        # ===========================================
        departments = ["Engineering", "Design", "Marketing", "HR", "Sales"]

        users_data = [
            # Admin
            {"email": "admin@flowora.lk", "first_name": "System", "last_name": "Admin", "role": "ADMIN", "dept": "IT"},
            # Managers
            {"email": "nadeesha@flowora.lk", "first_name": "Nadeesha", "last_name": "Perera", "role": "MANAGER", "dept": "Engineering"},
            {"email": "kavindu@flowora.lk", "first_name": "Kavindu", "last_name": "Jayasinghe", "role": "MEMBER", "dept": "Engineering"},
            {"email": "kamal@flowora.lk", "first_name": "Kamal", "last_name": "Fernando", "role": "MANAGER", "dept": "Design"},
            {"email": "sarah@flowora.lk", "first_name": "Sarah", "last_name": "Silva", "role": "MANAGER", "dept": "Marketing"},
            # Members
            {"email": "kasun@flowora.lk", "first_name": "Kasun", "last_name": "Bandara", "role": "MEMBER", "dept": "Engineering"},
            {"email": "ruwan@flowora.lk", "first_name": "Ruwan", "last_name": "Rajapaksha", "role": "MEMBER", "dept": "Engineering"},
            {"email": "dilini@flowora.lk", "first_name": "Dilini", "last_name": "Jayasinghe", "role": "MEMBER", "dept": "Design"},
            {"email": "amila@flowora.lk", "first_name": "Amila", "last_name": "Sampath", "role": "MEMBER", "dept": "Engineering"},
            {"email": "nuwan@flowora.lk", "first_name": "Nuwan", "last_name": "Rathnayake", "role": "MEMBER", "dept": "Marketing"},
            {"email": "sanduni@flowora.lk", "first_name": "Sanduni", "last_name": "Wickramasinghe", "role": "MEMBER", "dept": "HR"},
            {"email": "chamara@flowora.lk", "first_name": "Chamara", "last_name": "Kumara", "role": "MEMBER", "dept": "Sales"},
            {"email": "gayan@flowora.lk", "first_name": "Gayan", "last_name": "Pradeep", "role": "MEMBER", "dept": "Engineering"},
            {"email": "hasini@flowora.lk", "first_name": "Hasini", "last_name": "Weerasinghe", "role": "MEMBER", "dept": "Design"},
            {"email": "lakmal@flowora.lk", "first_name": "Lakmal", "last_name": "Dissanayake", "role": "MEMBER", "dept": "Marketing"},
            {"email": "tharushi@flowora.lk", "first_name": "Tharushi", "last_name": "Gunawardena", "role": "MEMBER", "dept": "HR"},
            {"email": "dinusha@flowora.lk", "first_name": "Dinusha", "last_name": "Fernando", "role": "MEMBER", "dept": "Sales"},
            {"email": "saman@flowora.lk", "first_name": "Saman", "last_name": "Kumara", "role": "MEMBER", "dept": "Engineering"},
            {"email": "chinthaka@flowora.lk", "first_name": "Chinthaka", "last_name": "Senanayake", "role": "MEMBER", "dept": "Design"},
            {"email": "malithi@flowora.lk", "first_name": "Malithi", "last_name": "Perera", "role": "MEMBER", "dept": "Marketing"},
            {"email": "prabath@flowora.lk", "first_name": "Prabath", "last_name": "Jayawardena", "role": "MEMBER", "dept": "Engineering"},
        ]

        hashed_pw = get_password_hash("password")

        db_users = []
        for u_data in users_data:
            existing = db.query(User).filter(User.email == u_data["email"]).first()
            if not existing:
                user = User(
                    id=generate_uuid(),
                    email=u_data["email"],
                    first_name=u_data["first_name"],
                    last_name=u_data["last_name"],
                    hashed_password=hashed_pw,
                    role=u_data["role"],
                    department=u_data["dept"],
                    is_active=True,
                )
                db.add(user)
                db_users.append(user)
            else:
                db_users.append(existing)

        db.commit()
        print(f"[OK] Seeded {len(users_data)} users.")

        # ===========================================
        # 2. PROJECTS (8 projects with various statuses)
        # ===========================================
        projects_data = [
            {"name": "Website Redesign", "color": "#FF5733", "desc": "Complete redesign of corporate website with modern UI/UX.", "status": "Active"},
            {"name": "Mobile App V2", "color": "#33FF57", "desc": "Next major version of our mobile application with new features.", "status": "Active"},
            {"name": "Marketing Campaign Q3", "color": "#3357FF", "desc": "Q3 social media campaigns and digital advertising strategy.", "status": "Active"},
            {"name": "Cloud Migration", "color": "#F333FF", "desc": "Migrating on-premise servers to AWS cloud infrastructure.", "status": "Active"},
            {"name": "Customer Portal", "color": "#33FFF5", "desc": "Self-service portal for clients to manage their accounts.", "status": "Completed"},
            {"name": "Internal Dashboard", "color": "#FFC300", "desc": "Analytics dashboard for managers to track team performance.", "status": "Active"},
            {"name": "HR System Update", "color": "#C70039", "desc": "Updating the payroll and leave management system.", "status": "On Hold"},
            {"name": "Brand Identity", "color": "#900C3F", "desc": "New company logo, brand guidelines, and visual identity.", "status": "Completed"},
        ]

        db_projects = []
        for p_data in projects_data:
            existing = db.query(Project).filter(Project.name == p_data["name"]).first()
            if not existing:
                project = Project(
                    id=generate_uuid(),
                    name=p_data["name"],
                    color=p_data["color"],
                    description=p_data["desc"],
                    status=p_data["status"],
                )
                db.add(project)
                db_projects.append(project)
            else:
                db_projects.append(existing)

        db.commit()
        print(f"[OK] Seeded {len(projects_data)} projects.")

        # ===========================================
        # 3. PROJECT ASSIGNMENTS (3-5 members per project)
        # ===========================================
        members = [u for u in db_users if u.role == "MEMBER"]
        assignment_count = 0
        for project in db_projects:
            assigned_members = random.sample(members, min(random.randint(3, 5), len(members)))
            for member in assigned_members:
                existing_assignment = (
                    db.query(ProjectAssignment)
                    .filter(
                        ProjectAssignment.user_id == member.id,
                        ProjectAssignment.project_id == project.id,
                    )
                    .first()
                )
                if not existing_assignment:
                    assignment = ProjectAssignment(
                        id=generate_uuid(),
                        user_id=member.id,
                        project_id=project.id,
                    )
                    db.add(assignment)
                    assignment_count += 1

        db.commit()
        print(f"[OK] Seeded {assignment_count} project assignments.")

        # ===========================================
        # 4. REPORTS (~30-40 reports across members)
        # ===========================================
        statuses = ["Draft", "Submitted", "Late"]
        weeks = [
            "2026-06-02", "2026-06-09", "2026-06-16", "2026-06-23",
            "2026-06-30", "2026-07-07",
        ]

        tasks_completed_options = [
            "Completed frontend layout for dashboard\nIntegrated API for user authentication\nFixed critical bugs #12 and #14",
            "Deployed staging environment\nWritten unit tests for auth module\nReviewed 3 pull requests",
            "Designed wireframes for mobile app\nCreated component library documentation\nConducted user testing sessions",
            "Set up CI/CD pipeline with GitHub Actions\nMigrated database schema to v2\nOptimized SQL queries (30% improvement)",
            "Prepared marketing materials for launch\nCreated social media content calendar\nAnalyzed competitor campaigns",
            "Onboarded 2 new team members\nUpdated HR policies document\nCompleted payroll processing",
        ]

        tasks_planned_options = [
            "Write integration tests for payment module\nDeploy to production environment\nReview outstanding PRs",
            "Implement real-time notifications\nRefactor authentication service\nSet up monitoring dashboards",
            "Create high-fidelity mockups\nConduct A/B testing on landing page\nPrepare design review presentation",
            "Migrate remaining microservices\nImplement auto-scaling policies\nSet up disaster recovery",
            "Launch email campaign\nCreate blog content for SEO\nSchedule stakeholder meetings",
            "Process leave applications\nUpdate employee handbook\nOrganize team building event",
        ]

        blocker_options = [
            "Waiting on design assets from the design team",
            "API dependency from third-party service is down",
            "Need access credentials for production database",
            "Blocked by pending code review from team lead",
            None,
            None,
            None,
        ]

        reports_count = 0
        for member in members:
            member_assignments = (
                db.query(ProjectAssignment)
                .filter(ProjectAssignment.user_id == member.id)
                .all()
            )
            if not member_assignments:
                continue

            for _ in range(random.randint(1, 3)):
                project_id = random.choice(member_assignments).project_id
                status = random.choice(statuses)

                report = Report(
                    id=generate_uuid(),
                    user_id=member.id,
                    project_id=project_id,
                    week_start=random.choice(weeks),
                    tasks_completed=random.choice(tasks_completed_options),
                    tasks_planned=random.choice(tasks_planned_options),
                    blockers=random.choice(blocker_options),
                    hours_worked=random.randint(20, 45),
                    notes="Productive week overall." if random.choice([True, False]) else None,
                    status=status,
                    submitted_at=datetime.utcnow() if status == "Submitted" else None,
                )
                db.add(report)
                reports_count += 1

        db.commit()
        print(f"[OK] Seeded {reports_count} reports.")

        # ===========================================
        # 5. NOTIFICATIONS (~20+ across users)
        # ===========================================
        notification_templates = [
            {"title": "Welcome to Flowora!", "message": "Your account has been created successfully. Start by exploring your dashboard.", "type": "success"},
            {"title": "Weekly Report Reminder", "message": "Don't forget to submit your weekly report before Friday 5 PM.", "type": "warning"},
            {"title": "Report Submitted", "message": "Your weekly report has been submitted successfully.", "type": "success"},
            {"title": "New Project Assignment", "message": "You have been assigned to a new project. Check your projects page.", "type": "info"},
            {"title": "Report Overdue", "message": "Your weekly report for last week is overdue. Please submit immediately.", "type": "error"},
            {"title": "Profile Updated", "message": "Your profile information has been updated successfully.", "type": "success"},
            {"title": "System Maintenance", "message": "Scheduled maintenance on Saturday 2 AM - 4 AM. The system may be unavailable.", "type": "warning"},
            {"title": "New Team Member", "message": "A new team member has joined your project. Welcome them!", "type": "info"},
            {"title": "Report Approved", "message": "Your weekly report has been reviewed and approved by your manager.", "type": "success"},
            {"title": "Password Change Recommended", "message": "It's been 90 days since your last password change. Consider updating it.", "type": "warning"},
        ]

        notif_count = 0
        for user in db_users:
            # Each user gets 1-3 random notifications
            num_notifs = random.randint(1, 3)
            selected_notifs = random.sample(
                notification_templates, min(num_notifs, len(notification_templates))
            )
            for notif_data in selected_notifs:
                notification = Notification(
                    id=generate_uuid(),
                    user_id=user.id,
                    title=notif_data["title"],
                    message=notif_data["message"],
                    type=notif_data["type"],
                    is_read=random.choice([True, False]),
                    created_at=datetime.utcnow() - timedelta(days=random.randint(0, 14)),
                )
                db.add(notification)
                notif_count += 1

        db.commit()
        print(f"[OK] Seeded {notif_count} notifications.")

        # ===========================================
        # 6. ACTIVITY LOGS (~20+ across users)
        # ===========================================
        activity_templates = [
            {"action": "created", "entity_type": "Report", "details": "Created a new weekly report"},
            {"action": "submitted", "entity_type": "Report", "details": "Submitted weekly report for review"},
            {"action": "updated", "entity_type": "Report", "details": "Updated draft report with new tasks"},
            {"action": "created", "entity_type": "Project", "details": "Created a new project"},
            {"action": "updated", "entity_type": "Project", "details": "Updated project status"},
            {"action": "login", "entity_type": "User", "details": "User logged in to the system"},
            {"action": "updated", "entity_type": "User", "details": "Updated user profile information"},
            {"action": "assigned", "entity_type": "Project", "details": "Assigned a member to the project"},
            {"action": "deleted", "entity_type": "Report", "details": "Deleted a draft report"},
            {"action": "reviewed", "entity_type": "Report", "details": "Manager reviewed the weekly report"},
        ]

        activity_count = 0
        for user in db_users:
            # Each user gets 1-2 activity logs
            num_activities = random.randint(1, 2)
            selected_activities = random.sample(
                activity_templates, min(num_activities, len(activity_templates))
            )
            for act_data in selected_activities:
                activity = ActivityLog(
                    id=generate_uuid(),
                    user_id=user.id,
                    action=act_data["action"],
                    entity_type=act_data["entity_type"],
                    entity_id=generate_uuid(),
                    details=act_data["details"],
                    created_at=datetime.utcnow() - timedelta(days=random.randint(0, 14)),
                )
                db.add(activity)
                activity_count += 1

        db.commit()
        print(f"[OK] Seeded {activity_count} activity logs.")

        print("\n===========================================")
        print("  DATABASE SEEDING COMPLETE!")
        print("===========================================")
        print(f"  Users:        {len(users_data)}")
        print(f"  Projects:     {len(projects_data)}")
        print(f"  Assignments:  {assignment_count}")
        print(f"  Reports:      {reports_count}")
        print(f"  Notifications:{notif_count}")
        print(f"  Activities:   {activity_count}")
        print("===========================================")
        print("\n  Login credentials (all users):")
        print("  Password: password")
        print("  Admin:    admin@flowora.lk")
        print("  Manager:  nadeesha@flowora.lk")
        print("  Member:   kasun@flowora.lk / kavindu@flowora.lk")
        print("===========================================")

    except Exception as e:
        print(f"[ERROR] Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
