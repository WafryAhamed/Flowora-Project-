# Flowora Deployment Guide

## Quick Setup for Vercel, Railway & Supabase

### Step 1: Supabase Database Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In SQL Editor, run migrations:
   ```bash
   # Run your alembic migrations
   alembic upgrade head
   ```
3. Get your connection string from Settings > Database > Connection string
4. Format: `postgresql://postgres:password@db.supabase.co:5432/postgres`

### Step 2: Railway Backend Deployment

1. **Create Railway Account** at [railway.app](https://railway.app)

2. **Connect GitHub Repository**
   - Click "New Project" → "Deploy from GitHub"
   - Select your Flowora repo
   - Choose `backend` directory as root

3. **Set Environment Variables** in Railway Dashboard:
   ```
   DATABASE_URL = [from Supabase]
   SECRET_KEY = [generate secure key]
   FRONTEND_URL = [your Vercel domain]
   REDIS_URL = [Redis URL from Railway Redis plugin]
   ```

4. **Add Redis Plugin**
   - In Railway: Settings → Add Plugin → Redis
   - Copy Redis URL to environment variables

5. **Deploy**
   ```bash
   # Railway auto-deploys from git push
   git push origin main
   ```

6. **Get Backend URL** from Railway Dashboard (preview domain)

### Step 3: Vercel Frontend Deployment

1. **Create Vercel Account** at [vercel.com](https://vercel.com)

2. **Import Project**
   - Click "New Project" → "Import Git Repository"
   - Select your Flowora repo
   - Framework: Next.js
   - Root Directory: `frontend`

3. **Set Environment Variables**
   - In Vercel: Settings → Environment Variables
   ```
   NEXT_PUBLIC_API_URL = https://your-railway-app.up.railway.app
   ```

4. **Deploy**
   - Vercel auto-deploys on git push
   - Your domain: `flowora-[random].vercel.app`

### Step 4: Connect Everything

1. **Update Railway Backend** with Vercel URL:
   ```
   FRONTEND_URL = https://flowora-[random].vercel.app
   ```
   Redeploy

2. **Verify Connection**
   ```bash
   # Test API
   curl https://your-railway-app.up.railway.app/api/v1/
   
   # Check frontend loads
   curl https://flowora-[random].vercel.app
   ```

---

## Performance Tuning After Deployment

### 1. Enable Caching in Supabase
```sql
-- Login to Supabase Dashboard > SQL Editor > Run:
CREATE INDEX CONCURRENTLY idx_user_email ON "user"(email);
CREATE INDEX CONCURRENTLY idx_project_user_id ON project(user_id);
CREATE INDEX CONCURRENTLY idx_activity_log_user_id ON activity_log(user_id);
```

### 2. Configure Railway Resources
- Memory: Minimum 512MB
- CPU: 0.5 vCPU
- Restart policy: On failure
- Max replicas: 2 (for high traffic)

### 3. Monitor Performance
- **Vercel Analytics**: Automatically enabled
  - View at Vercel Dashboard → Analytics
- **Railway Logs**: View in Railway Dashboard
- **Supabase Metrics**: View in Supabase Dashboard

### 4. Enable CDN
- Vercel: Automatic for all deployments
- Custom domain: Set up with Vercel DNS

---

## Scaling for Production

### When Traffic Increases

1. **Backend (Railway)**
   - Increase memory to 1GB+
   - Enable replica scaling (2-4 instances)
   - Monitor CPU usage in Railway dashboard

2. **Database (Supabase)**
   - Upgrade plan for higher compute
   - Enable connection pooling
   - Archive old logs periodically

3. **Frontend (Vercel)**
   - Automatic scaling (no action needed)
   - Use Image Optimization API
   - Monitor bandwidth usage

---

## Monitoring & Logging

### Railway Logs
```bash
railway logs --service backend
```

### Vercel Logs
- Dashboard → Deployments → Select deployment → Logs

### Database Logs
- Supabase Dashboard → Logs → Database

### Error Tracking (Optional)
Add to `backend/requirements.txt`:
```
sentry-sdk==1.40.0
```

---

## Troubleshooting

### Frontend can't reach backend
- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify backend is running: `curl https://your-backend.up.railway.app/`
- Check CORS settings in backend

### Database connection issues
- Verify `DATABASE_URL` format
- Check connection limit in Railway dashboard
- Ensure IP whitelist includes Railway servers

### Slow performance
- Check network waterfall in browser DevTools
- Monitor backend CPU/memory in Railway
- Check query performance in Supabase
- Enable Redis caching (in `requirements.txt`)

---

## Post-Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Database configured in Supabase
- [ ] Environment variables set in all services
- [ ] Redis cache connected
- [ ] Domain configured (optional)
- [ ] HTTPS enabled (automatic)
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Performance optimizations applied

---

## Useful Links

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Deployment**: https://nextjs.org/learn/basics/deploying-nextjs-app
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/concepts/
