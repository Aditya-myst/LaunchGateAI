import yaml
import requests
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "agent_config.yaml"

data = yaml.safe_load(CONFIG.read_text())

def mask(value):
    if not value:
        return "<empty>"
    if len(value) <= 10:
        return value[:2] + "***"
    return value[:6] + "..." + value[-4:]

for name, block in data.items():
    api_key = block.get("api_key", "")
    agent_id = block.get("agent_id", "")

    print()
    print("Agent block:", name)
    print("agent_id:", mask(agent_id))
    print("api_key:", mask(api_key))

    try:
        res = requests.get(
            "https://app.band.ai/api/v1/agent/me",
            headers={"X-API-Key": api_key},
            timeout=15,
        )
        print("status:", res.status_code)
        print("body:", res.text[:300])
    except Exception as e:
        print("error:", e)
