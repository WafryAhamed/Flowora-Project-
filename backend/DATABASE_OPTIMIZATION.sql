-- Supabase Database Optimization Script
-- Run these queries in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ===== INDEXES =====
-- Create indexes on frequently queried columns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_created_at ON "user"(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_user_id ON project(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_created_at ON project(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_report_project_id ON report(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_report_user_id ON report(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_report_created_at ON report(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_user_id ON notification(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_read ON notification(read_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- ===== MATERIALIZED VIEWS (for common queries) =====
-- Dashboard statistics view
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM "user") as total_users,
    (SELECT COUNT(*) FROM project) as total_projects,
    (SELECT COUNT(*) FROM report) as total_reports,
    (SELECT COUNT(*) FROM notification WHERE read_at IS NULL) as unread_notifications,
    NOW() as last_updated;

-- Refresh materialized views periodically
-- REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;

-- ===== QUERY OPTIMIZATION =====
-- Enable query result caching (via application level)
-- See app/middleware.py for caching headers

-- ===== PARTITIONING (if table gets very large) =====
-- Partition activity_log by month
-- ALTER TABLE activity_log 
-- PARTITION BY RANGE (date_trunc('month', created_at));

-- ===== STATISTICS =====
-- Analyze tables for query planning
ANALYZE "user";
ANALYZE project;
ANALYZE report;
ANALYZE notification;
ANALYZE activity_log;
ANALYZE chat_history;

-- ===== VACUUM =====
-- Clean up dead tuples (run periodically)
VACUUM ANALYZE "user";
VACUUM ANALYZE project;
VACUUM ANALYZE report;

-- ===== CONNECTION POOLING =====
-- Enable in Supabase: Settings > Database > Connection Pooling
-- Recommended mode: Transaction

-- ===== MONITORING QUERIES =====
-- Check slow queries:
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Check index usage:
SELECT schemaname, tablename, indexname, idx_scan 
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- Check table sizes:
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ===== BACKUP SETTINGS =====
-- Supabase handles backups automatically
-- Check backup schedule: Settings > Backups

-- ===== PERFORMANCE SETTINGS =====
-- Configure connection limits
-- ALTER DATABASE your_db SET max_connections = 100;

-- Statement timeout (already set in backend connection)
-- ALTER DATABASE your_db SET statement_timeout = '30s';
