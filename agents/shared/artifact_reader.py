from __future__ import annotations

from pathlib import Path

from shared.config import ROOT

ARTIFACT_DIR = ROOT / "data" / "demo_artifacts" / "ai_ticket_summarizer"


def read_artifact(filename: str) -> str:
    path = ARTIFACT_DIR / filename
    if not path.exists():
        return f"[missing artifact: {filename}]"
    return path.read_text(encoding="utf-8", errors="ignore")


def read_all_artifacts() -> dict[str, str]:
    if not ARTIFACT_DIR.exists():
        return {}

    result: dict[str, str] = {}
    for path in sorted(ARTIFACT_DIR.iterdir()):
        if path.is_file():
            result[path.name] = path.read_text(encoding="utf-8", errors="ignore")
    return result


def artifact_summary() -> str:
    artifacts = read_all_artifacts()
    if not artifacts:
        return "No artifacts found."

    lines = []
    for name, content in artifacts.items():
        lines.append(f"## {name}\\n{content[:1800]}")
    return "\\n\\n".join(lines)
