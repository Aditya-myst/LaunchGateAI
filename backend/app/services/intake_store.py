from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
STATE_DIR = ROOT / "data" / "state"
INTAKE_FILE = STATE_DIR / "latest_intake.json"


def save_latest_intake(data: dict[str, Any]) -> None:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    INTAKE_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")


def load_latest_intake() -> dict[str, Any]:
    if not INTAKE_FILE.exists():
        return {
            "title": "AI Ticket Summarizer",
            "owner": "Support Ops",
            "target_launch": "Next Friday",
            "description": "AI-powered summarizer for enterprise customer support conversations.",
            "artifact_names": [],
        }

    return json.loads(INTAKE_FILE.read_text(encoding="utf-8"))