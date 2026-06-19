from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import requests
import yaml
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[3]
load_dotenv(ROOT / ".env")

AGENT_CONFIG_PATH = ROOT / "agent_config.yaml"

BAND_BASE = os.getenv("BAND_REST_URL", "https://app.band.ai").rstrip("/")
BAND_AGENT_BASE = f"{BAND_BASE}/api/v1/agent"


def load_agent_key(agent_name: str = "coordinator") -> str:
    data = yaml.safe_load(AGENT_CONFIG_PATH.read_text(encoding="utf-8")) or {}
    block = data.get(agent_name)
    if not block or not block.get("api_key"):
        raise ValueError(f"Missing api_key for {agent_name} in agent_config.yaml")
    return block["api_key"]


def headers(agent_name: str = "coordinator") -> dict[str, str]:
    return {
        "X-API-Key": load_agent_key(agent_name),
        "Content-Type": "application/json",
    }


def band_get(path: str, agent_name: str = "coordinator") -> Any:
    res = requests.get(f"{BAND_AGENT_BASE}{path}", headers=headers(agent_name), timeout=20)
    res.raise_for_status()
    return res.json()


def band_post(path: str, payload: dict[str, Any], agent_name: str = "coordinator") -> Any:
    res = requests.post(f"{BAND_AGENT_BASE}{path}", headers=headers(agent_name), json=payload, timeout=20)
    res.raise_for_status()
    if not res.text:
        return {}
    return res.json()


def get_participants(chat_id: str) -> list[dict[str, Any]]:
    data = band_get(f"/chats/{chat_id}/participants", "coordinator")

    if isinstance(data, list):
        return data

    for key in ["participants", "data", "items"]:
        if isinstance(data, dict) and isinstance(data.get(key), list):
            return data[key]

    return []


def _deep_get(d: Any, keys: list[str]) -> Any:
    current = d
    for key in keys:
        if not isinstance(current, dict):
            return None
        current = current.get(key)
    return current


def normalize_participant(raw: dict[str, Any]) -> dict[str, Any]:
    pid = (
        raw.get("id")
        or raw.get("participant_id")
        or raw.get("user_id")
        or raw.get("agent_id")
        or _deep_get(raw, ["participant", "id"])
        or _deep_get(raw, ["agent", "id"])
        or _deep_get(raw, ["user", "id"])
    )

    name = (
        raw.get("name")
        or raw.get("display_name")
        or raw.get("agent_name")
        or _deep_get(raw, ["participant", "name"])
        or _deep_get(raw, ["agent", "name"])
        or _deep_get(raw, ["user", "name"])
    )

    handle = (
        raw.get("handle")
        or raw.get("slug")
        or _deep_get(raw, ["participant", "handle"])
        or _deep_get(raw, ["agent", "handle"])
        or _deep_get(raw, ["user", "handle"])
        or name
    )

    return {"id": pid, "name": name, "handle": handle, "raw": raw}


def find_participant(chat_id: str, wanted_name: str) -> dict[str, Any] | None:
    wanted = wanted_name.lower().strip()

    for raw in get_participants(chat_id):
        p = normalize_participant(raw)
        haystack = " ".join(
            str(x or "").lower()
            for x in [
                p.get("name"),
                p.get("handle"),
                raw.get("name"),
                raw.get("handle"),
                raw.get("agent_name"),
                raw.get("display_name"),
                str(raw),
            ]
        )

        if wanted in haystack:
            return p

    return None


def make_mention(participant: dict[str, Any]) -> dict[str, str]:
    return {
        "id": participant["id"],
        "name": participant.get("name") or participant.get("handle") or "Participant",
        "handle": participant.get("handle") or participant.get("name") or "participant",
    }


def send_message_as(
    chat_id: str,
    agent_key: str,
    content: str,
    mentions: list[dict[str, Any]],
) -> Any:
    clean_mentions = [make_mention(m) for m in mentions if m and m.get("id")]

    payload = {
        "message": {
            "content": content,
            "mentions": clean_mentions,
        }
    }

    return band_post(f"/chats/{chat_id}/messages", payload, agent_key)


def post_event_as(
    chat_id: str,
    agent_key: str,
    content: str,
    metadata: dict[str, Any] | None = None,
) -> Any:
    payload = {
        "event": {
            "content": content,
            "message_type": "task",
            "metadata": metadata or {},
        }
    }

    return band_post(f"/chats/{chat_id}/events", payload, agent_key)


def participant_report(chat_id: str) -> dict[str, Any]:
    names = [
        "LaunchGate Coordinator",
        "Security Review",
        "Privacy Compliance",
        "Engineering Readiness",
        "QA Test",
        "Decision Arbiter",
    ]

    found = {name: bool(find_participant(chat_id, name)) for name in names}

    return {
        "chat_id": chat_id,
        "participants_raw_count": len(get_participants(chat_id)),
        "found": found,
    }
