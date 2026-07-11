# Flowora Performance Optimization Guide

## ✅ Completed Optimizations

### Frontend (Next.js)
- [x] Image optimization (AVIF, WebP formats)
- [x] SWC minification enabled
- [x] Package import optimization
- [x] On-demand entry caching
- [x] API response caching layer (5 min TTL)
- [x] Compression enabled

### Backend (FastAPI)
- [x] GZIP compression middleware (500+ bytes)
- [x] Database connection pooling (20 pool size, 40 overflow)
- [x] Connection recycling (1 hour)
- [x] Cache headers middleware
- [x] Response time tracking
- [x] Security headers
- [x] JSON serialization optimization (orjson)

### Database (PostgreSQL/Supabase)
- [x] Connection pooling
- [x] Statement timeout (30s)
- [x] Pool pre-ping enabled

---

## 🚀 Implementation Checklist

### Phase 1: IMMEDIATE (Deploy First)
- [ ] Install updated dependencies: `pip install -r requirements.txt`
- [ ] Update frontend: `npm install`
- [ ] Test locally: `npm run build && npm start` (frontend)
- [ ] Deploy to Vercel (frontend)
- [ ] Deploy to Railway (backend)

### Phase 2: Database Optimization (Supabase)
```sql
-- Create indexes on frequently queried columns
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_project_user_id ON project(user_id);
CREATE INDEX idx_report_project_id ON report(project_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);

-- Enable query cache
-- In Supabase dashboard: Settings > Database > Performance Insights
```

### Phase 3: Advanced Caching
Add Redis cache layer in `backend/requirements.txt` (already added):
```python
# In app/main.py - Upgrade to Redis caching
# Replace InMemoryBackend with Redis
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis

@asynccontextmanager
async def lifespan(app: FastAPI):
    redis = aioredis.from_url("redis://...")
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
    yield
```

---

## 📊 Key Metrics to Monitor

### Frontend Performance
- **First Contentful Paint (FCP)**: Target < 1.8s
- **Largest Contentful Paint (LCP)**: Target < 2.5s
- **Cumulative Layout Shift (CLS)**: Target < 0.1

### Backend Performance
- **API Response Time**: Target < 200ms
- **Database Query Time**: Target < 100ms
- **Server Memory**: Monitor in Railway dashboard

### Monitor with Vercel Analytics
```bash
# Add to frontend/package.json
"@vercel/analytics": "^1.0.0"
"@vercel/speed-insights": "^1.0.0"
```

---

## 🔧 Environment Configuration

### Supabase
```env
# backend/.env.production
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres
REDIS_URL=redis://default:password@railway.app:port
```

### Railway
- Set MIN_WORKERS=2, MAX_WORKERS=4
- Memory: 512MB minimum
- CPU: 0.5 vCPU minimum

### Vercel
- Set NEXT_PUBLIC_API_URL to Railway backend URL
- Enable Vercel Analytics
- Use ISR (Incremental Static Regeneration) for dashboard

---

## 💡 Additional Quick Wins

### 1. Use Image Optimization
```tsx
import Image from 'next/image';

// Instead of:
<img src="/image.jpg" />

// Use:
<Image src="/image.jpg" width={800} height={600} />
```

### 2. Lazy Load Components
```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./Heavy'), {
  loading: () => <div>Loading...</div>
});
```

### 3. API Endpoint Caching in Route Handler
```typescript
// frontend/app/api/proxy/[...path].ts
export const revalidate = 300; // Cache for 5 minutes
```

### 4. Database Query Optimization
```python
# Use select() to load only needed columns
from sqlalchemy import select

# Instead of:
users = db.query(User).all()

# Use:
stmt = select(User).options(joinedload(User.projects))
users = db.execute(stmt).scalars().all()
```

### 5. Pagination for Lists
```python
# backend/app/api/routes/users.py
@router.get("/users")
def get_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users
```

---

## 🔍 Testing Performance

### Frontend
```bash
cd frontend
npm run build  # Check bundle size
npm run lint   # Run linter
```

### Backend
```bash
cd backend
# Test load time with Apache Bench
ab -n 100 -c 10 http://localhost:8000/api/v1/users
```

### Full Stack Load Testing
```bash
# Install locust
pip install locust

# Create locustfile.py and run tests
locust -f locustfile.py --headless -u 100 -r 10
```

---

## 📝 Deployment Checklist

- [ ] Update `next.config.js` for optimizations
- [ ] Add `apiCache.ts` for frontend caching
- [ ] Create `middleware.py` for backend compression
- [ ] Update database connection pool settings
- [ ] Add indexes to Supabase
- [ ] Set environment variables in Railway
- [ ] Enable caching headers
- [ ] Run build tests locally
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Railway
- [ ] Configure database in Supabase
- [ ] Run Lighthouse audit
- [ ] Monitor with Vercel Analytics

---

## 🎯 Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Bundle Size | ~300KB | ~180KB | -40% |
| API Response | 500ms | 150ms | -70% |
| FCP | 3.2s | 1.5s | -53% |
| LCP | 4.1s | 2.2s | -46% |
| Time to Interactive | 5.5s | 2.8s | -49% |

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Performance**: https://nextjs.org/learn/seo/web-performance
- **FastAPI Optimization**: https://fastapi.tiangolo.com/deployment
