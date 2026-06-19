
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

AGENTS = {
    "coordinator": ("BAND_COORDINATOR_AGENT_ID", "BAND_COORDINATOR_API_KEY"),
    "engineering": ("BAND_ENGINEERING_AGENT_ID", "BAND_ENGINEERING_API_KEY"),
    "security": ("BAND_SECURITY_AGENT_ID", "BAND_SECURITY_API_KEY"),
    "privacy_compliance": ("BAND_PRIVACY_AGENT_ID", "BAND_PRIVACY_API_KEY"),
    "qa_test": ("BAND_QA_AGENT_ID", "BAND_QA_API_KEY"),
    "decision_arbiter": ("BAND_DECISION_AGENT_ID", "BAND_DECISION_API_KEY"),
    "audit_scribe": ("BAND_AUDIT_AGENT_ID", "BAND_AUDIT_API_KEY"),
}

lines = [
    "# Auto-generated from environment variables. Do not commit real secrets.",
    "",
]

missing = []

for key, (id_env, api_env) in AGENTS.items():
    agent_id = os.getenv(id_env, "")
    api_key = os.getenv(api_env, "")

    if key != "audit_scribe" and (not agent_id or not api_key):
        missing.append((key, id_env, api_env))

    lines.append(f"{key}:")
    lines.append(f'  agent_id: "{agent_id}"')
    lines.append(f'  api_key: "{api_key}"')
    lines.append("")

path = ROOT / "agent_config.yaml"
path.write_text("\n".join(lines), encoding="utf-8")

print(f"Wrote {path}")

if missing:
    print("Missing required agent env vars:")
    for item in missing:
        print(item)
    raise SystemExit(1)