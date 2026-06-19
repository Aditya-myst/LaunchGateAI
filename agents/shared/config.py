
from __future__ import annotations

import os
from pathlib import Path

import yaml
from dotenv import load_dotenv


ROOT = Path(__file__).resolve().parents[2]
AGENTS_ROOT = Path(__file__).resolve().parents[1]

load_dotenv(ROOT / ".env")
load_dotenv(AGENTS_ROOT / ".env")


def env(name: str, default: str = "") -> str:
    return os.getenv(name, default)


def load_agent_credentials(agent_key: str) -> tuple[str, str]:
    config_path = ROOT / "agent_config.yaml"
    if not config_path.exists():
        config_path = AGENTS_ROOT / "agent_config.yaml"

    if not config_path.exists():
        raise FileNotFoundError(
            "agent_config.yaml not found. Put it in project root or agents folder."
        )

    data = yaml.safe_load(config_path.read_text()) or {}
    block = data.get(agent_key)

    if not block:
        raise KeyError(f"Missing agent_config.yaml block: {agent_key}")

    agent_id = block.get("agent_id", "")
    api_key = block.get("api_key", "")

    if not agent_id or not api_key:
        raise ValueError(f"agent_config.yaml block {agent_key} has empty credentials")

    return agent_id, api_key


def band_rest_url() -> str:
    return env("BAND_REST_URL") or env("THENVOI_REST_URL") or "https://app.band.ai/"


def band_ws_url() -> str:
    return (
        env("BAND_WS_URL")
        or env("THENVOI_WS_URL")
        or "wss://app.band.ai/api/v1/socket/websocket"
    )


def aimlapi_key() -> str:
    return env("AIMLAPI_API_KEY")


def aimlapi_base_url() -> str:
    return env("AIMLAPI_BASE_URL", "https://api.aimlapi.com/v1")


def model_for(role: str) -> str:
    role_env = {
        "coordinator": "COORDINATOR_MODEL",
        "engineering": "ENGINEERING_MODEL",
        "security": "SECURITY_MODEL",
        "privacy_compliance": "PRIVACY_MODEL",
        "qa_test": "QA_MODEL",
        "decision_arbiter": "DECISION_MODEL",
        "audit_scribe": "AUDIT_MODEL",
    }.get(role, "PRIMARY_LLM_MODEL")

    return env(role_env) or env("PRIMARY_LLM_MODEL", "gpt-4o-mini")


def backend_url() -> str:
    return env("API_BASE_URL", "http://localhost:8000")
