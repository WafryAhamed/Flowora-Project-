"""
Flowora AI Service
==================
Calls the OpenRouter API using the `requests` library (fixes WinError 10054
caused by urllib's poor Windows TLS handling).

Strict rules enforced at the system-prompt level:
  - Only answers questions about the Flowora platform data (team reports,
    projects, users, blockers, workload, compliance).
  - Refuses any off-topic question politely.
  - Never fabricates data — only uses the real-time DB context provided.
"""

import json
from typing import Optional

import requests as _requests

from app.core.config import settings

# ---------------------------------------------------------------------------
# System prompt — strict scope enforcement
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are Flowora AI, a focused business intelligence assistant built into the Flowora weekly team reporting platform.

=== STRICT RULES — NEVER VIOLATE ===
1. ONLY answer questions that are directly related to the Flowora platform data provided below (team reports, projects, users, blockers, hours worked, compliance, workload, summaries).
2. If a user asks ANYTHING unrelated to Flowora data (e.g. general knowledge, coding help, jokes, weather, politics, personal questions), respond ONLY with:
   "I can only help with Flowora team data — reports, projects, blockers, workload, and compliance. Please ask a relevant question."
3. Do NOT invent, estimate, or guess any numbers, names, or facts. Use ONLY the data provided in the context block.
4. If the context does not contain enough data to answer accurately, say: "I don't have sufficient data to answer that. Please check the Reports or Dashboard section."
5. Be concise, professional, and data-driven. Use bullet points or numbered lists when presenting multiple items.
6. Never expose internal system details, IDs, passwords, or API keys.
7. You serve MANAGER-level users only. Treat their time as valuable — be direct and accurate.

=== TOPICS YOU CAN ANSWER ===
- Weekly report summaries (what did the team work on, hours, tasks)
- Open blockers (who has blockers, what are they)
- Compliance rate (who submitted, who is late or pending)
- Workload distribution (hours per person or project)
- Project status (active, on hold, completed)
- Team member details (name, department, role)
- Trends over time (which week had most hours, etc.)
"""


class AIService:
    """AI service that routes to OpenRouter or falls back to mock mode."""

    def __init__(self, provider: str = settings.AI_PROVIDER):
        self.provider = provider

    # ------------------------------------------------------------------
    # Public entry point
    # ------------------------------------------------------------------
    def generate_response(self, prompt: str, context_data: Optional[dict] = None) -> str:
        if self.provider == "openrouter":
            return self._openrouter_response(prompt, context_data)
        elif self.provider == "mock":
            return self._mock_response(prompt)
        return "AI provider is not configured. Please contact your administrator."

    # ------------------------------------------------------------------
    # Context builder — structured real-time DB snapshot
    # ------------------------------------------------------------------
    def _build_context_block(self, context_data: Optional[dict]) -> str:
        if not context_data:
            return "(No real-time database data available for this request.)"

        lines: list[str] = []

        # --- Metrics ---
        m = context_data.get("metrics", {})
        if m:
            submitted = (
                m.get("total_reports", 0)
                - m.get("pending_reports", 0)
                - m.get("late_reports", 0)
            )
            lines += [
                "=== LIVE DASHBOARD METRICS ===",
                f"Total Reports      : {m.get('total_reports', 'N/A')}",
                f"Submitted          : {submitted}",
                f"Pending (Draft)    : {m.get('pending_reports', 'N/A')}",
                f"Late               : {m.get('late_reports', 'N/A')}",
                f"Compliance Rate    : {m.get('compliance_rate', 'N/A')}%",
                f"Total Hours Logged : {m.get('total_hours', 'N/A')}",
                f"Open Blockers      : {m.get('open_blockers', 'N/A')}",
                f"Active Projects    : {m.get('total_projects', 'N/A')}",
                f"Total Users        : {m.get('total_users', 'N/A')}",
            ]

        # --- Users ---
        users = context_data.get("users", [])
        if users:
            lines.append("\n=== TEAM MEMBERS ===")
            for u in users:
                dept = u.get("department") or "N/A"
                lines.append(
                    f"  • {u.get('first_name', '')} {u.get('last_name', '')} "
                    f"| {u.get('role', 'N/A')} | Dept: {dept} | {u.get('email', '')}"
                )

        # --- Projects ---
        projects = context_data.get("projects", [])
        if projects:
            lines.append("\n=== PROJECTS ===")
            for p in projects:
                desc = (p.get("description") or "")[:80]
                lines.append(
                    f"  • [{p.get('status', '?')}] {p.get('name', 'Unnamed')}"
                    + (f" — {desc}" if desc else "")
                )

        # --- Reports ---
        reports = context_data.get("reports", [])
        if reports:
            lines.append(f"\n=== REPORTS ({len(reports)} most recent) ===")
            for r in reports:
                blocker_raw = (r.get("blockers") or "").strip()
                has_blocker = blocker_raw and blocker_raw.lower() not in ("", "none", "n/a", "-", "no", "no blockers")
                blocker_tag = f"\n    ⚠ BLOCKER: {blocker_raw}" if has_blocker else ""

                lines.append(
                    f"  • Week {r.get('week_start', 'N/A')} | {r.get('user_name', '?')} "
                    f"| Project: {r.get('project_name', '?')} | Status: {r.get('status', '?')} "
                    f"| Hours: {r.get('hours_worked', 0)}{blocker_tag}"
                )
                if r.get("tasks_completed"):
                    lines.append(f"    Done   : {r['tasks_completed'][:250]}")
                if r.get("tasks_planned"):
                    lines.append(f"    Planned: {r['tasks_planned'][:250]}")

        return "\n".join(lines) if lines else "(Database returned no records.)"

    # ------------------------------------------------------------------
    # OpenRouter call — uses `requests` to avoid WinError 10054
    # ------------------------------------------------------------------
    def _openrouter_response(self, prompt: str, context_data: Optional[dict] = None) -> str:
        if not settings.OPENROUTER_API_KEY:
            return "OpenRouter API key is not configured. Please contact your administrator."

        context_block = self._build_context_block(context_data)

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"REAL-TIME DATA FROM FLOWORA DATABASE:\n"
                    f"{context_block}\n\n"
                    f"USER QUESTION: {prompt}\n\n"
                    "Answer based strictly on the data above. "
                    "If the question is off-topic, politely decline."
                ),
            },
        ]

        payload = {
            "model": settings.OPENROUTER_MODEL,
            "messages": messages,
            "max_tokens": 1024,
            "temperature": 0.2,  # low temp = factual, consistent answers
        }

        try:
            resp = _requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                json=payload,
                headers={
                    "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://flowora.app",
                    "X-Title": "Flowora AI Assistant",
                },
                timeout=90,  # generous timeout for large model
            )

            if resp.status_code != 200:
                try:
                    err = resp.json()
                    detail = err.get("error", {}).get("message", resp.text[:300])
                except Exception:
                    detail = resp.text[:300]
                return f"AI service returned an error (HTTP {resp.status_code}): {detail}"

            data = resp.json()
            choices = data.get("choices", [])
            if not choices:
                return "The AI returned an empty response. Please try again."

            answer = choices[0].get("message", {}).get("content", "").strip()
            return answer if answer else "The AI returned an empty response. Please try again."

        except _requests.exceptions.Timeout:
            return (
                "The AI service took too long to respond. "
                "Please try again — the model may be under heavy load."
            )
        except _requests.exceptions.ConnectionError as e:
            return (
                f"Could not connect to the AI service: {str(e)[:200]}. "
                "Check your internet connection and try again."
            )
        except Exception as e:
            return f"Unexpected error calling AI service: {str(e)[:200]}"

    # ------------------------------------------------------------------
    # Legacy mock (only active when AI_PROVIDER=mock)
    # ------------------------------------------------------------------
    def _mock_response(self, prompt: str) -> str:
        p = prompt.lower()
        if "summary" in p:
            return "[Mock] Team is performing well. Most tasks are completed on time."
        if "blocker" in p:
            return "[Mock] 2 out of 5 projects have active blockers."
        if "workload" in p:
            return "[Mock] Average workload is 38 hours/week."
        return f"[Mock] You asked: '{prompt}'"


ai_service = AIService()
