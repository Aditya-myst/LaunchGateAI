
from __future__ import annotations

import os
import signal
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PORT = os.getenv("PORT", "8000")
START_AGENTS = os.getenv("START_AGENTS", "true").lower() == "true"

processes: list[subprocess.Popen] = []


def start_process(name: str, command: list[str], cwd: Path) -> subprocess.Popen:
    print(f"[start] starting {name}: {' '.join(command)}", flush=True)
    process = subprocess.Popen(command, cwd=str(cwd))
    processes.append(process)
    return process


def shutdown(*_):
    print("[start] shutting down", flush=True)
    for process in processes:
        if process.poll() is None:
            process.terminate()

    time.sleep(3)

    for process in processes:
        if process.poll() is None:
            process.kill()

    sys.exit(0)


signal.signal(signal.SIGTERM, shutdown)
signal.signal(signal.SIGINT, shutdown)

# Ensure agent_config.yaml exists
subprocess.check_call([sys.executable, str(ROOT / "scripts" / "write_agent_config.py")], cwd=str(ROOT))

if START_AGENTS:
    start_process(
        "band-agents",
        ["uv", "run", "python", "run_production.py"],
        ROOT / "agents",
    )
    time.sleep(4)

api = start_process(
    "fastapi",
    ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", PORT],
    ROOT / "backend",
)

while True:
    code = api.poll()
    if code is not None:
        print(f"[start] backend exited with {code}", flush=True)
        shutdown()
    time.sleep(5)
