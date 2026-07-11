#!/usr/bin/env bash
set -e

cd backend

if [ -n "$PORT" ]; then
  exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --workers 4 --loop uvloop
else
  exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 --loop uvloop
fi
