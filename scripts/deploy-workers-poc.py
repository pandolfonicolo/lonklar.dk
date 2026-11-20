"""Publish only the dedicated proof, with metadata from a clean Git revision."""
import json
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[1]
project = root / "workers_poc"
config = json.loads((project / "wrangler.jsonc").read_text())
assert config["name"] == "lonklar-python-poc" and "routes" not in config and "route" not in config
assert config["d1_databases"][0]["database_id"] == "891c9b79-dc3e-4b65-be50-b2233ecdb80b"
assert not subprocess.check_output(["git", "status", "--porcelain"], cwd=root, text=True).strip(), "Commit the proof before deploying"
updated = subprocess.check_output(["git", "log", "-1", "--format=%cI"], cwd=root, text=True).strip()
subprocess.run(["uv", "run", "--locked", "pywrangler", "deploy", "--var", "APP_UPDATED_AT:" + updated], cwd=project, check=True)
