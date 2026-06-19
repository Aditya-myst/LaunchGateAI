from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
STATE_DIR = ROOT / "data" / "state"
HISTORY_FILE = STATE_DIR / "review_history.json"


def load_history() -> list[dict[str, Any]]:
    if not HISTORY_FILE.exists():
        return []

    try:
        return json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
    except Exception:
        return []


def save_history(items: list[dict[str, Any]]) -> None:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    HISTORY_FILE.write_text(json.dumps(items, indent=2), encoding="utf-8")


def upsert_review_history(item: dict[str, Any]) -> list[dict[str, Any]]:
    history = load_history()

    review_id = item.get("id")

    cleaned = []
    for existing in history:
        if existing.get("id") != review_id:
            cleaned.append(existing)

    item["updated_at"] = datetime.utcnow().isoformat() + "Z"
    cleaned.insert(0, item)

    cleaned = cleaned[:20]
    save_history(cleaned)

    return cleaned
