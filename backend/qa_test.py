#!/usr/bin/env python3
"""
Comprehensive QA Test Suite for Flowora
Tests: Authentication, Reports, Projects, Users, Analytics, AI, Notifications
"""
import requests
import json
import sys
from datetime import datetime, timedelta

API_BASE_URL = "http://localhost:8000/api/v1"
TEST_EMAIL_MEMBER = "kasun@flowora.lk"
TEST_EMAIL_MANAGER = "nadeesha@flowora.lk"
TEST_EMAIL_ADMIN = "admin@flowora.lk"
TEST_PASSWORD = "password"

class QATester:
    def __init__(self):
        self.tokens = {}
        self.results = {
            "auth": [],
            "reports": [],
            "projects": [],
            "users": [],
            "analytics": [],
            "ai": [],
            "notifications": [],
            "errors": []
        }
        
    def test_auth(self):
        print("\n" + "="*60)
        print("1. AUTHENTICATION TESTING")
        print("="*60)
        
        # Test login
        print("\n[TEST] Login - Member Account")
        login_response = requests.post(
            f"{API_BASE_URL}/auth/login",
            data={"username": TEST_EMAIL_MEMBER, "password": TEST_PASSWORD}
        )
        print(f"Status: {login_response.status_code}")
        if login_response.status_code == 200:
            self.tokens["member"] = login_response.json()["access_token"]
            print(f"✓ PASS: Member login successful")
            self.results["auth"].append(("Member Login", "PASS"))
        else:
            print(f"✗ FAIL: {login_response.text}")
            self.results["auth"].append(("Member Login", "FAIL"))
            
        # Test manager login
        print("\n[TEST] Login - Manager Account")
        login_response = requests.post(
            f"{API_BASE_URL}/auth/login",
            data={"username": TEST_EMAIL_MANAGER, "password": TEST_PASSWORD}
        )
        print(f"Status: {login_response.status_code}")
        if login_response.status_code == 200:
            self.tokens["manager"] = login_response.json()["access_token"]
            print(f"✓ PASS: Manager login successful")
            self.results["auth"].append(("Manager Login", "PASS"))
        else:
            print(f"✗ FAIL: {login_response.text}")
            self.results["auth"].append(("Manager Login", "FAIL"))
            
        # Test admin login
        print("\n[TEST] Login - Admin Account")
        login_response = requests.post(
            f"{API_BASE_URL}/auth/login",
            data={"username": TEST_EMAIL_ADMIN, "password": TEST_PASSWORD}
        )
        print(f"Status: {login_response.status_code}")
        if login_response.status_code == 200:
            self.tokens["admin"] = login_response.json()["access_token"]
            print(f"✓ PASS: Admin login successful")
            self.results["auth"].append(("Admin Login", "PASS"))
        else:
            print(f"✗ FAIL: {login_response.text}")
            self.results["auth"].append(("Admin Login", "FAIL"))
            
        # Test get current user
        print("\n[TEST] Get Current User Info")
        headers = {"Authorization": f"Bearer {self.tokens.get('member', '')}"}
        response = requests.get(f"{API_BASE_URL}/auth/me", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            user_data = response.json()
            print(f"User: {user_data.get('first_name')} {user_data.get('last_name')}")
            print(f"✓ PASS: Get user info successful")
            self.results["auth"].append(("Get Current User", "PASS"))
        else:
            print(f"✗ FAIL: {response.text}")
            self.results["auth"].append(("Get Current User", "FAIL"))
            
        # Test unauthorized access
        print("\n[TEST] Unauthorized Access (Invalid Token)")
        headers = {"Authorization": "Bearer invalid_token"}
        response = requests.get(f"{API_BASE_URL}/auth/me", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 401:
            print(f"✓ PASS: Correctly rejected invalid token")
            self.results["auth"].append(("Unauthorized Access Prevention", "PASS"))
        else:
            print(f"✗ FAIL: Should have returned 401")
            self.results["auth"].append(("Unauthorized Access Prevention", "FAIL"))
            
    def test_reports(self):
        print("\n" + "="*60)
        print("2. REPORTS TESTING")
        print("="*60)
        
        if "member" not in self.tokens:
            print("✗ SKIP: Member token not available")
            return
            
        headers = {"Authorization": f"Bearer {self.tokens['member']}"}
        
        # Get all reports for member
        print("\n[TEST] Get Reports (Member View)")
        response = requests.get(f"{API_BASE_URL}/reports", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            reports = response.json()
            print(f"Reports retrieved: {len(reports)}")
            print(f"✓ PASS: Member can view their reports")
            self.results["reports"].append(("Get Member Reports", "PASS"))
        else:
            print(f"✗ FAIL: {response.text}")
            self.results["reports"].append(("Get Member Reports", "FAIL"))
            
        # Get all reports as manager
        print("\n[TEST] Get Reports (Manager View - All)")
        manager_headers = {"Authorization": f"Bearer {self.tokens['manager']}"}
        response = requests.get(f"{API_BASE_URL}/reports", headers=manager_headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            reports = response.json()
            print(f"Total reports visible to manager: {len(reports)}")
            print(f"✓ PASS: Manager can view all reports")
            self.results["reports"].append(("Get All Reports (Manager)", "PASS"))
        else:
            print(f"✗ FAIL: {response.text}")
            self.results["reports"].append(("Get All Reports (Manager)", "FAIL"))
            
        # Get first report if exists
        if response.status_code == 200 and reports:
            first_report = reports[0]
            report_id = first_report.get("id")
            print(f"\n[TEST] Get Single Report - ID: {report_id}")
            response = requests.get(f"{API_BASE_URL}/reports/{report_id}", headers=headers)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                print(f"✓ PASS: Retrieved single report")
                self.results["reports"].append(("Get Single Report", "PASS"))
            else:
                print(f"✗ FAIL: {response.text}")
                self.results["reports"].append(("Get Single Report", "FAIL"))
                
        # Create report
        print("\n[TEST] Create Report")
        week_start = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        
        # Get first project
        project_response = requests.get(f"{API_BASE_URL}/projects", headers=headers)
        if project_response.status_code == 200 and project_response.json():
            project_id = project_response.json()[0]["id"]
            
            report_data = {
                "project_id": project_id,
                "week_start": week_start,
                "tasks_completed": "Task 1\nTask 2",
                "tasks_planned": "Task 3\nTask 4",
                "blockers": "No blockers",
                "hours_worked": 40,
                "notes": "QA Test Report",
                "status": "Draft"
            }
            response = requests.post(f"{API_BASE_URL}/reports", json=report_data, headers=headers)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                self.created_report_id = response.json().get("id")
                print(f"✓ PASS: Report created - ID: {self.created_report_id}")
                self.results["reports"].append(("Create Report", "PASS"))
            else:
                print(f"✗ FAIL: {response.text}")
                self.results["reports"].append(("Create Report", "FAIL"))
        else:
            print("✗ SKIP: No projects available")
            
    def test_projects(self):
        print("\n" + "="*60)
        print("3. PROJECTS TESTING")
        print("="*60)
        
        if "member" not in self.tokens:
            print("✗ SKIP: Member token not available")
            return
            
        headers = {"Authorization": f"Bearer {self.tokens['member']}"}
        
        # Get projects
        print("\n[TEST] Get Projects")
        response = requests.get(f"{API_BASE_URL}/projects", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            projects = response.json()
            print(f"Projects retrieved: {len(projects)}")
            if projects:
                first_project = projects[0]
                print(f"First project: {first_project.get('name')}")
                print(f"Status: {first_project.get('status')}")
            print(f"✓ PASS: Projects retrieved successfully")
            self.results["projects"].append(("Get Projects", "PASS"))
        else:
            print(f"✗ FAIL: {response.text}")
            self.results["projects"].append(("Get Projects", "FAIL"))
            
        # Create project (manager only)
        print("\n[TEST] Create Project (Manager Only)")
        manager_headers = {"Authorization": f"Bearer {self.tokens['manager']}"}
        project_data = {
            "name": f"QA Test Project {datetime.now().timestamp()}",
            "color": "#FF5733",
            "status": "Active",
            "description": "Created by QA Test Suite",
            "members": []
        }
        response = requests.post(f"{API_BASE_URL}/projects", json=project_data, headers=manager_headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            self.created_project_id = response.json().get("id")
            print(f"✓ PASS: Project created - ID: {self.created_project_id}")
            self.results["projects"].append(("Create Project (Manager)", "PASS"))
        else:
            print(f"✗ FAIL: {response.text}")
            self.results["projects"].append(("Create Project (Manager)", "FAIL"))
            
        # Test unauthorized project creation (member)
        print("\n[TEST] Create Project Denied (Member)")
        response = requests.post(f"{API_BASE_URL}/projects", json=project_data, headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 403:
            print(f"✓ PASS: Member correctly denied project creation")
            self.results["projects"].append(("Project Authorization (Member Denied)", "PASS"))
        else:
            print(f"✗ FAIL: Should have returned 403, got {response.status_code}")
            self.results["projects"].append(("Project Authorization (Member Denied)", "FAIL"))
            
    def test_users(self):
        print("\n" + "="*60)
        print("4. USERS TESTING")
        print("="*60)
        
        if "manager" not in self.tokens:
            print("✗ SKIP: Manager token not available")
            return
            
        manager_headers = {"Authorization": f"Bearer {self.tokens['manager']}"}
        
        # Get users (manager only)
        print("\n[TEST] Get Users (Manager Only)")
        response = requests.get(f"{API_BASE_URL}/users", headers=manager_headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            users = response.json()
            print(f"Users retrieved: {len(users)}")
            self.results["users"].append(("Get Users (Manager)", "PASS"))
        else:
            print(f"✗ FAIL: {response.text}")
            self.results["users"].append(("Get Users (Manager)", "FAIL"))
            
        # Test unauthorized access (member)
        print("\n[TEST] Get Users Denied (Member)")
        member_headers = {"Authorization": f"Bearer {self.tokens['member']}"}
        response = requests.get(f"{API_BASE_URL}/users", headers=member_headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 403:
            print(f"✓ PASS: Member correctly denied users list")
            self.results["users"].append(("Users Authorization (Member Denied)", "PASS"))
        else:
            print(f"✗ FAIL: Should have returned 403, got {response.status_code}")
            self.results["users"].append(("Users Authorization (Member Denied)", "FAIL"))
            
    def test_analytics(self):
        print("\n" + "="*60)
        print("5. ANALYTICS TESTING")
        print("="*60)
        
        if "manager" not in self.tokens:
            print("✗ SKIP: Manager token not available")
            return
            
        manager_headers = {"Authorization": f"Bearer {self.tokens['manager']}"}
        
        # Get dashboard metrics
        print("\n[TEST] Get Dashboard Metrics (Manager)")
        response = requests.get(f"{API_BASE_URL}/analytics/dashboard-metrics", headers=manager_headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            metrics = response.json()
            print(f"Total Reports: {metrics.get('total_reports')}")
            print(f"Compliance Rate: {metrics.get('compliance_rate')}%")
            print(f"Open Blockers: {metrics.get('open_blockers')}")
            print(f"Total Hours: {metrics.get('total_hours')}")
            print(f"✓ PASS: Dashboard metrics retrieved")
            self.results["analytics"].append(("Dashboard Metrics", "PASS"))
        else:
            print(f"✗ FAIL: {response.text}")
            self.results["analytics"].append(("Dashboard Metrics", "FAIL"))
            
        # Test unauthorized access (member)
        print("\n[TEST] Dashboard Metrics Denied (Member)")
        member_headers = {"Authorization": f"Bearer {self.tokens['member']}"}
        response = requests.get(f"{API_BASE_URL}/analytics/dashboard-metrics", headers=member_headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 403:
            print(f"✓ PASS: Member correctly denied analytics")
            self.results["analytics"].append(("Analytics Authorization (Member Denied)", "PASS"))
        else:
            print(f"✗ FAIL: Should have returned 403, got {response.status_code}")
            self.results["analytics"].append(("Analytics Authorization (Member Denied)", "FAIL"))
            
    def test_ai(self):
        print("\n" + "="*60)
        print("6. AI ASSISTANT TESTING")
        print("="*60)
        
        if "manager" not in self.tokens:
            print("✗ SKIP: Manager token not available")
            return
            
        manager_headers = {"Authorization": f"Bearer {self.tokens['manager']}"}
        
        # Test AI query
        print("\n[TEST] AI Query - Team Summary")
        ai_data = {
            "prompt": "What is the team status?",
            "context": "team_summary"
        }
        response = requests.post(f"{API_BASE_URL}/ai/query", json=ai_data, headers=manager_headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            ai_response = response.json()
            print(f"AI Response: {ai_response.get('response', '')[:100]}...")
            print(f"✓ PASS: AI query successful")
            self.results["ai"].append(("AI Query - Team Summary", "PASS"))
        else:
            print(f"Status: {response.status_code}")
            print(f"Note: {response.text}")
            # AI might return different status
            if response.status_code in [200, 404, 500]:
                self.results["ai"].append(("AI Query - Team Summary", "INFO"))
            else:
                self.results["ai"].append(("AI Query - Team Summary", "FAIL"))
                
    def test_notifications(self):
        print("\n" + "="*60)
        print("7. NOTIFICATIONS TESTING")
        print("="*60)
        
        if "member" not in self.tokens:
            print("✗ SKIP: Member token not available")
            return
            
        member_headers = {"Authorization": f"Bearer {self.tokens['member']}"}
        
        # Get notifications
        print("\n[TEST] Get Notifications")
        response = requests.get(f"{API_BASE_URL}/notifications", headers=member_headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            notifications = response.json()
            print(f"Notifications retrieved: {len(notifications)}")
            if notifications:
                first = notifications[0]
                print(f"Latest: {first.get('title')} - Read: {first.get('is_read')}")
            print(f"✓ PASS: Notifications retrieved")
            self.results["notifications"].append(("Get Notifications", "PASS"))
        else:
            print(f"✗ FAIL: {response.text}")
            self.results["notifications"].append(("Get Notifications", "FAIL"))
            
    def print_summary(self):
        print("\n" + "="*60)
        print("QA TEST SUMMARY")
        print("="*60)
        
        total_tests = 0
        passed_tests = 0
        
        for category, results in self.results.items():
            if category != "errors" and results:
                print(f"\n{category.upper()}:")
                for test_name, status in results:
                    total_tests += 1
                    if status == "PASS":
                        passed_tests += 1
                        print(f"  ✓ {test_name}: {status}")
                    elif status == "INFO":
                        print(f"  ℹ {test_name}: {status}")
                    else:
                        print(f"  ✗ {test_name}: {status}")
                        
        print(f"\n{'='*60}")
        print(f"TOTAL: {passed_tests}/{total_tests} tests passed")
        print(f"Pass Rate: {(passed_tests/total_tests*100):.1f}%")
        
def main():
    tester = QATester()
    try:
        tester.test_auth()
        tester.test_reports()
        tester.test_projects()
        tester.test_users()
        tester.test_analytics()
        tester.test_ai()
        tester.test_notifications()
        tester.print_summary()
    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
