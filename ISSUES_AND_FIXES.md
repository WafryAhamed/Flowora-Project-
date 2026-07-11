# FLOWORA - ISSUES FOUND & ACTION ITEMS

**QA Testing Date**: July 10, 2026  
**Total Issues Found**: 4  
**Critical**: 3  
**Warnings**: 1  

---

## ISSUES SUMMARY TABLE

| ID | Issue | Severity | Status | File | Action |
|----|-------|----------|--------|------|--------|
| #1 | Missing GET /reports/{id} | 🔴 CRITICAL | ❌ NOT FIXED | reports.py | Add endpoint |
| #2 | AI chat not implemented | 🔴 CRITICAL | ❌ NOT FIXED | ai.py | Implement or remove |
| #3 | Date format validation | 🔴 CRITICAL | ❌ NOT FIXED | report.py schema | Add validator |
| #4 | Rate limiting missing | 🟠 WARNING | ⚠️ INFO | main.py | Add middleware |

---

## DETAILED ISSUES & FIXES

---

## 🔴 ISSUE #1: Missing GET /reports/{id} Endpoint

### Problem
```
Test Result: FAIL
Endpoint: GET /api/v1/reports/{report_id}
Status: 405 Method Not Allowed
Expected: 200 with report data
```

### Current Code (MISSING)
```python
# File: backend/app/api/routes/reports.py
# Lines: After line 47 (after update_report)
# This endpoint is NOT IMPLEMENTED
```

### Fix Required
**File**: `backend/app/api/routes/reports.py`

**Add this code after the update_report function:**

```python
@router.get("/{report_id}", response_model=ReportSchema)
def read_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve a single report by ID."""
    report = report_service.get_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Authorization check - members see own, managers/admins see all
    if report.user_id != current_user.id and current_user.role not in ["MANAGER", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return report
```

### Expected Result After Fix
```
GET /api/v1/reports/c6dbf44d-6f32-4417-81f2-61f8aff8fef4
Status: 200
Body: {
    "id": "c6dbf44d-6f32-4417-81f2-61f8aff8fef4",
    "user_id": "...",
    "project_id": "...",
    "week_start": "2026-07-03",
    "tasks_completed": "...",
    ...
}
```

### Test Command
```bash
curl -X GET http://localhost:8000/api/v1/reports/c6dbf44d-6f32-4417-81f2-61f8aff8fef4 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔴 ISSUE #2: AI Chat Assistant Not Implemented

### Problem
```
Test Result: FAIL
Endpoint: POST /api/v1/ai/query
Status: 404 Not Found
Message: {"detail":"Not Found"}
```

### Current Code
**File**: `backend/app/api/routes/ai.py`

```python
router = APIRouter()

# Only helper functions defined, but no POST /query endpoint
def _build_db_context(db: Session) -> dict:
    # Context builder function exists
    # But no actual query endpoint
```

### Fix Options

**Option A: Complete Implementation** (Recommended)
```python
@router.post("/query", response_model=AIResponse)
async def ai_query(
    request: AIRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_manager)
):
    """Process AI query for manager insights."""
    try:
        context = _build_db_context(db)
        
        # Call AI service based on configuration
        from app.services.ai_service import ai_service
        response = await ai_service.query(request.prompt, context, request.context or "general")
        
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**Option B: Simple Placeholder** (Temporary)
```python
@router.post("/query", response_model=AIResponse)
async def ai_query(
    request: AIRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_manager)
):
    """AI Query endpoint - implementation pending."""
    return {
        "response": f"Thank you for your question: {request.prompt}\n\n"
                   "The AI assistant is currently in development. "
                   "Please check back soon."
    }
```

**Option C: Remove from API**
- Delete or disable the /ai route
- Update frontend to not call this endpoint
- Remove from API documentation

### Recommendation
**Option A**: Complete the implementation if AI is a core feature, otherwise use Option B as placeholder or Option C if not needed.

---

## 🔴 ISSUE #3: Date Format Validation Missing

### Problem
```
Test Input: week_start = "invalid-date"
Expected: 422 Unprocessable Entity
Actual: 200 OK (accepted)

Test Input: week_start = "2026/01/01"
Expected: 422 Unprocessable Entity
Actual: 200 OK (accepted)
```

### Current Code
**File**: `backend/app/schemas/report.py`

```python
class ReportBase(BaseModel):
    project_id: str
    week_start: str  # ❌ NO VALIDATION
    tasks_completed: str
    tasks_planned: str
    # ... more fields
```

### Fix Required

**File**: `backend/app/schemas/report.py`

**Update the class:**

```python
from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional

class ReportBase(BaseModel):
    project_id: str
    week_start: str
    tasks_completed: str
    tasks_planned: str
    blockers: Optional[str] = None
    hours_worked: int
    notes: Optional[str] = None
    links: Optional[str] = None
    status: Optional[str] = "Draft"
    
    @field_validator('week_start')
    @classmethod
    def validate_week_start(cls, v: str) -> str:
        """Validate week_start is in YYYY-MM-DD format."""
        try:
            datetime.strptime(v, '%Y-%m-%d')
        except ValueError:
            raise ValueError('week_start must be in YYYY-MM-DD format (e.g., 2026-07-08)')
        return v
```

### Expected Result After Fix
```python
# This will be rejected:
POST /api/v1/reports
{
    "project_id": "abc123",
    "week_start": "invalid-date",  # ❌ Rejected
    "tasks_completed": "test",
    "tasks_planned": "test",
    "hours_worked": 8
}

# Response:
Status: 422 Unprocessable Entity
{
    "detail": [
        {
            "loc": ["body", "week_start"],
            "msg": "week_start must be in YYYY-MM-DD format (e.g., 2026-07-08)",
            "type": "value_error"
        }
    ]
}

# This will be accepted:
POST /api/v1/reports
{
    "project_id": "abc123",
    "week_start": "2026-07-08",  # ✅ Accepted
    "tasks_completed": "test",
    "tasks_planned": "test",
    "hours_worked": 8
}
```

### Test Command
```bash
# This should fail (422):
curl -X POST http://localhost:8000/api/v1/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "project_id": "abc123",
    "week_start": "invalid-date",
    "tasks_completed": "test",
    "tasks_planned": "test",
    "hours_worked": 8
  }'

# This should pass (200):
curl -X POST http://localhost:8000/api/v1/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "project_id": "abc123",
    "week_start": "2026-07-10",
    "tasks_completed": "test",
    "tasks_planned": "test",
    "hours_worked": 8
  }'
```

---

## 🟠 WARNING #4: Rate Limiting Not Implemented

### Problem
```
Risk: API endpoints can be called unlimited times
Impact: Potential DoS/brute force attacks
Current: No rate limiting middleware
```

### Affected Endpoints
- ALL endpoints (especially /auth/login)

### Fix Recommended
**File**: `backend/app/main.py`

**Add rate limiting:**

```python
# At top of main.py, add imports:
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Create limiter
limiter = Limiter(key_func=get_remote_address)

# Add to app before routes:
app.state.limiter = limiter

# Add exception handler:
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please try again later."}
    )

# Then apply to specific endpoints:
# In backend/app/api/routes/auth.py:

@router.post("/login")
@limiter.limit("5/minute")  # 5 attempts per minute
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    # ... existing code
```

### Installation
```bash
pip install slowapi
```

### Recommended Rate Limits
```python
# Authentication endpoints
@limiter.limit("5/minute")  # Login: 5 attempts/min
@limiter.limit("3/minute")  # Register: 3 attempts/min

# General API endpoints
@limiter.limit("60/minute")  # Read: 60 requests/min
@limiter.limit("30/minute")  # Write: 30 requests/min

# Analytics endpoints (heavy queries)
@limiter.limit("10/minute")  # Dashboard: 10 requests/min
```

---

## ✅ ISSUES ALREADY FIXED DURING QA

### Fixed #1: Missing `app/__init__.py`
**Status**: ✅ FIXED  
**File**: `backend/app/__init__.py`  
**Action**: Created empty init file  

### Fixed #2: Database Constraints Test Error
**Status**: ✅ FIXED  
**File**: `backend/db_test.py`  
**Action**: Fixed SQLAlchemy `func` import  

### Fixed #3: Backend Module Path Issue
**Status**: ✅ FIXED  
**File**: `backend/run.py`  
**Action**: Created startup script with proper path handling  

---

## PRIORITY FIX TIMELINE

### 🟢 TODAY (Immediate - 1-2 hours)
1. [ ] Fix Issue #1: Add GET /reports/{id}
2. [ ] Fix Issue #2: Implement/remove AI endpoint
3. [ ] Fix Issue #3: Add date validation
4. [ ] Re-run tests - should show 100%

### 🟡 THIS WEEK (Before Release)
1. [ ] Add rate limiting (Issue #4)
2. [ ] Complete frontend testing
3. [ ] Run full regression test suite
4. [ ] Update documentation

### 🔵 NEXT WEEK (Before Production)
1. [ ] Security penetration testing
2. [ ] Load/stress testing
3. [ ] Database backup/recovery testing
4. [ ] Production deployment checklist

---

## VERIFICATION CHECKLIST

After applying fixes, verify with:

```bash
# 1. Single report retrieval
curl -X GET http://localhost:8000/api/v1/reports/REPORT_ID \
  -H "Authorization: Bearer TOKEN"

# 2. Invalid date rejection
curl -X POST http://localhost:8000/api/v1/reports \
  -H "Content-Type: application/json" \
  -d '{"week_start": "invalid"}' ...
# Should return 422

# 3. Valid date acceptance
curl -X POST http://localhost:8000/api/v1/reports \
  -H "Content-Type: application/json" \
  -d '{"week_start": "2026-07-10"}' ...
# Should return 200

# 4. AI endpoint
curl -X POST http://localhost:8000/api/v1/ai/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}' ...
# Should NOT return 404

# 5. Run test suite
cd backend
python qa_test.py
python qa_advanced.py
python db_test.py
```

---

## DOCUMENTATION FILES CREATED

1. **QA_REPORT.md** - Comprehensive 16-section QA report
2. **QA_SUMMARY.md** - Executive summary and action items
3. **README.md** - Updated with setup instructions
4. **This file** - Issues and fixes reference

---

## CONTACTS & SUPPORT

For questions about these issues:
- **QA Lead**: Automated QA Test Suite
- **Backend**: FastAPI documentation at http://localhost:8000/docs
- **Test Reports**: See QA_REPORT.md
- **Database**: PostgreSQL 12+ documentation

---

**Report Generated**: July 10, 2026  
**Next QA Run**: After all critical issues are fixed  
**Expected Result**: 100% PASS (56/56 tests)
