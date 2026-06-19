
from __future__ import annotations

import json
from typing import Any

import requests

from shared.config import backend_url


def mirror_event(
    *,
    review_id: str,
    event_type: str,
    from_agent: str,
    message: str,
    severity: str | None = None,
    structured: dict[str, Any] | None = None,
) -> str:
    url = f"{backend_url().rstrip('/')}/api/agent-events"
    payload = {
        "review_id": review_id,
        "event_type": event_type,
        "from_agent": from_agent,
        "message": message,
        "severity": severity,
        "structured": structured or {},
    }

    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        return json.dumps({"ok": True, "status_code": response.status_code})
    except Exception as exc:
        return json.dumps({"ok": False, "error": str(exc), "payload": payload})
