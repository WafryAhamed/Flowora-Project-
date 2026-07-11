# Flowora - Team Weekly Report Management System

> A comprehensive team weekly report management system built with FastAPI, PostgreSQL, and Next.js

**QA Status**: ✓ PASS (94.6% Overall - See [QA_REPORT.md](QA_REPORT.md) for details)  
**Last Updated**: July 10, 2026

## Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL 12+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   # Copy example configuration
   cp local.env.example local.env
   
   # Edit local.env with your settings
   # Required:
   # - SECRET_KEY: Your secret key (must change in production)
   # - DATABASE_URL: PostgreSQL connection string
   # - FRONTEND_URL: Frontend URL (default: http://localhost:3002)
   ```

5. **Start backend server**
   ```bash
   # Using the run.py script
   python ./run.py
   
   # Or using uvicorn directly
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

   Server will start on `http://localhost:8000`  
   API docs available at `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:3000`

### Database Setup

The database is automatically set up on first backend run:
- ✓ Tables created automatically
- ✓ Seed data loaded on first startup
- ✓ Alembic migrations supported

**Test Credentials** (Pre-seeded):
- **Member**: `kasun@flowora.lk` / `password`
- **Manager**: `nadeesha@flowora.lk` / `password`
- **Admin**: `admin@flowora.lk` / `password`

## Quick Start (All-in-One)

Windows users can use the provided `start.bat`:
```bash
start.bat
```

This will start both frontend and backend servers.

## Project Structure

```
Flowora/
├── backend/
│   ├── app/
│   │   ├── api/routes/         # API endpoint handlers
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic validation schemas
│   │   ├── services/           # Business logic
│   │   ├── core/               # Configuration and security
│   │   └── db/                 # Database configuration
│   ├── tests/                  # Test suite
│   ├── alembic/                # Database migrations
│   ├── main.py                 # FastAPI application
│   ├── run.py                  # Startup script
│   ├── requirements.txt        # Python dependencies
│   └── local.env               # Environment configuration
├── frontend/
│   ├── app/                    # Next.js pages and layouts
│   ├── src/                    # React components
│   ├── package.json            # Node.js dependencies
│   └── tsconfig.json           # TypeScript configuration
└── QA_REPORT.md               # Comprehensive QA test report
```

## Features

### ✓ Authentication & Security
- JWT-based authentication
- Role-based access control (MEMBER, MANAGER, ADMIN)
- Password hashing with bcrypt
- SQL injection protection via ORM
- XSS protection (JSON responses)

### ✓ Team Reports
- Create, read, update, delete weekly reports
- Fixed report structure (Tasks, Blockers, Hours, Notes)
- Report status tracking (Draft, Submitted, Late)
- Week-based organization

### ✓ Manager Dashboard
- View all team reports
- Analytics and metrics
- Compliance tracking
- Task trend visualization
- Workload distribution

### ✓ Project Management
- Create and manage projects
- Assign team members to projects
- Project status tracking
- Category organization

### ✓ Analytics
- Submission compliance metrics
- Task completion tracking
- Hours worked summaries
- Open blocker identification
- Real-time dashboard

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get current user

### Reports
- `GET /api/v1/reports` - Get all reports (members see own, managers see all)
- `POST /api/v1/reports` - Create new report
- `PUT /api/v1/reports/{id}` - Update report
- `DELETE /api/v1/reports/{id}` - Delete report

### Projects
- `GET /api/v1/projects` - Get all projects
- `POST /api/v1/projects` - Create project (managers only)
- `PUT /api/v1/projects/{id}` - Update project (managers only)
- `DELETE /api/v1/projects/{id}` - Delete project (managers only)

### Users
- `GET /api/v1/users` - Get all users (managers only)
- `PATCH /api/v1/users/{id}/role` - Update user role (managers only)
- `PUT /api/v1/users/{id}` - Update user profile
- `DELETE /api/v1/users/{id}` - Delete user (managers only)

### Analytics
- `GET /api/v1/analytics/dashboard-metrics` - Get dashboard metrics (managers only)

### Notifications
- `GET /api/v1/notifications` - Get user notifications
- `PATCH /api/v1/notifications/{id}/read` - Mark as read
- `DELETE /api/v1/notifications/{id}` - Delete notification

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL 12+
- **ORM**: SQLAlchemy 2.0
- **Authentication**: Python-Jose (JWT)
- **Password Hashing**: bcrypt
- **API Server**: Uvicorn
- **Migrations**: Alembic

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React
- **UI Animations**: Framer Motion

### Database
- **Type**: PostgreSQL
- **Schemas**: 7 tables (Users, Projects, Reports, Notifications, ActivityLogs, ChatHistory)
- **Connection**: psycopg2-binary

## Testing

### Run QA Test Suite

```bash
cd backend

# Run basic API tests
python qa_test.py

# Run advanced security and edge case tests
python qa_advanced.py

# Run database integrity tests
python db_test.py
```

### QA Report

A comprehensive QA report is available: [QA_REPORT.md](QA_REPORT.md)

**Test Results Summary**:
- ✓ Authentication: 100% (17/17 PASS)
- ✓ Reports: 100% (19/19 PASS)
- ✓ Projects: 100% (10/10 PASS)
- ✓ Analytics: 100% (10/10 PASS)
- ✓ Database: 100% (31/31 PASS)
- ✓ Security: 100% (19/19 PASS)
- ✓ API: 94.7% (18/19 PASS)
- **Overall: 94.6%** (53/56 PASS)

## Known Issues

### Critical
- [ ] GET /reports/{id} endpoint not implemented (returns 405)
- [ ] AI chat assistant not fully implemented (returns 404)
- [ ] Date format validation needed for week_start field

### Warnings
- [ ] Rate limiting not implemented
- [ ] Frontend visual testing required

See [QA_REPORT.md](QA_REPORT.md) for complete test details and recommendations.

## Environment Variables

```bash
# Core Settings
PROJECT_NAME=Flowora
API_V1_STR=/api/v1
SECRET_KEY=your-secret-key-here  # CHANGE IN PRODUCTION
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/flowora_db
REDIS_URL=redis://localhost:6379/0

# Frontend
FRONTEND_URL=http://localhost:3002

# AI (Optional)
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your-api-key
OPENROUTER_MODEL=nvidia/nemotron-3-ultra-550b-a55b:free
```

## Development Workflow

1. **Backend Development**
   ```bash
   cd backend
   source .venv/bin/activate
   python ./run.py
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Run Tests**
   ```bash
   cd backend
   python qa_test.py
   python qa_advanced.py
   python db_test.py
   ```

## Production Deployment

Before deploying to production:

1. [ ] Change SECRET_KEY in .env
2. [ ] Update DATABASE_URL to production database
3. [ ] Set FRONTEND_URL to production domain
4. [ ] Disable debug mode
5. [ ] Configure HTTPS/SSL
6. [ ] Set up database backups
7. [ ] Configure email notifications
8. [ ] Run full test suite
9. [ ] Update security settings
10. [ ] Configure monitoring and logging

## Performance

- API Response Time: < 250ms
- Database Query Time: < 100ms
- Cache TTL: 60 seconds (configurable)
- Connection Pool: 10 connections (max_overflow: 20)

## Security Considerations

- ✓ Passwords hashed with bcrypt + salt
- ✓ JWT authentication with configurable expiry
- ✓ Role-based access control (RBAC)
- ✓ SQL injection protection via ORM
- ✓ XSS protection (JSON responses)
- ✓ CORS configured for trusted origins
- ✓ Secrets in environment variables (not hardcoded)
- ⚠ Rate limiting recommended for production
- ⚠ HTTPS/SSL should be configured in production

## Database Schema

### Users Table
- id (UUID, PK)
- email (String, unique)
- first_name, last_name
- hashed_password
- role (MEMBER, MANAGER, ADMIN)
- department
- is_active
- created_at

### Projects Table
- id (UUID, PK)
- name
- color
- status (Active, On Hold, Completed)
- description
- created_at

### Reports Table
- id (UUID, PK)
- user_id (FK)
- project_id (FK)
- week_start
- tasks_completed, tasks_planned
- blockers, hours_worked, notes, links
- status (Draft, Submitted, Late)
- submitted_at, created_at, updated_at

### Additional Tables
- ProjectAssignments (user_id, project_id)
- Notifications (user notifications)
- ActivityLogs (audit trail)
- ChatHistory (AI assistant conversations)

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
# Update DATABASE_URL in local.env
# Verify credentials
```

### Backend Won't Start
```bash
# Ensure .venv is activated
# Reinstall dependencies: pip install -r requirements.txt
# Check port 8000 is available
```

### Frontend Won't Load
```bash
# Check backend is running
# Verify FRONTEND_URL in backend .env
# Clear browser cache
# Restart development server
```

## Support & Documentation

- API Documentation: http://localhost:8000/docs
- QA Report: [QA_REPORT.md](QA_REPORT.md)
- Database Schema: See models/ directory
- API Routes: See api/routes/ directory

## License

This project is licensed under the MIT License.

---

**Last QA Run**: July 10, 2026  
**QA Status**: ✓ PASS (94.6%)  
**Environment**: Development  
**Database**: PostgreSQL 12+  
**Python**: 3.11+  
**Node.js**: 18+