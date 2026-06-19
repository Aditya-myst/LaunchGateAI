from __future__ import annotations

import subprocess
import sys
import time
from pathlib import Path

AGENTS = [
    "coordinator/agent.py",
    "engineering/agent.py",
    "security/agent.py",
    "privacy_compliance/agent.py",
    "qa_test/agent.py",
    "decision_arbiter/agent.py",
    # "audit_scribe/agent.py",
]

ROOT = Path(__file__).resolve().parent

processes = []

try:
    for script in AGENTS:
        print(f"Starting {script}...")
        p = subprocess.Popen([sys.executable, str(ROOT / script)])
        processes.append(p)
        time.sleep(1.0)

    print("\\nAll LaunchGate agents started.")
    print("Keep this terminal open. Press Ctrl+C to stop all agents.\\n")

    while True:
        time.sleep(1)

except KeyboardInterrupt:
    print("\\nStopping agents...")
    for p in processes:
        p.terminate()
    for p in processes:
        try:
            p.wait(timeout=5)
        except subprocess.TimeoutExpired:
            p.kill()
