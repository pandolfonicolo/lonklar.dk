"""Regression tests plus real local Workers/D1 integration, never production."""
import json
import os
import signal
import secrets
import subprocess
import sys
import time
import tomllib
import urllib.request
from pathlib import Path
from pywrangler.utils import get_python_version

root = Path(__file__).resolve().parents[1]
project = root / "workers_poc"
config = json.loads((project / "wrangler.jsonc").read_text())
assert config["name"] == "lonklar-python-poc"
assert config["account_id"] == "585ac81ae021c1bcd59e429e7a6af1ac"
assert config["d1_databases"][0]["database_id"] == "891c9b79-dc3e-4b65-be50-b2233ecdb80b"
assert config["d1_databases"][0]["database_name"] == "lonklar-python-poc"
assert not any(key in config for key in ("routes", "route", "env", "kv_namespaces", "services", "triggers"))
assert config["preview_urls"] is False and config["workers_dev"] is True
wasm_lock = tomllib.loads((project / "pylock.toml").read_text())
assert wasm_lock["requires-python"].startswith(">=" + get_python_version() + "."), (
    "Wasm lock targets a different Python runtime; run pywrangler sync --force"
)
for path in (project / "src/api").rglob("*.py"):
    assert path.read_bytes() == (root / "api" / path.relative_to(project / "src/api")).read_bytes(), path

subprocess.run([sys.executable, "-m", "unittest", "discover", "-s", "tests"], cwd=root, check=True)
subprocess.run(["uv", "run", "--locked", "pywrangler", "d1", "migrations", "apply", "FEEDBACK_DB", "--local"], cwd=project, check=True)
secret_file = project / ".dev.vars"
previous_secret_file = secret_file.read_bytes() if secret_file.exists() else None
admin_token = secrets.token_urlsafe(40)
secret_file.write_text("FEEDBACK_ADMIN_TOKEN=" + admin_token + "\n")
secret_file.chmod(0o600)
log_path = project / ".wrangler/poc-verification.log"
log_path.parent.mkdir(exist_ok=True)
with log_path.open("w") as log:
    process = subprocess.Popen(["uv", "run", "--locked", "pywrangler", "dev", "--port", "8791"], cwd=project,
                               stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
    try:
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        for _ in range(120):
            if process.poll() is not None:
                raise RuntimeError(log_path.read_text()[-5000:])
            try:
                with opener.open("http://127.0.0.1:8791/api/poc/health", timeout=1) as response:
                    if response.status == 200:
                        break
            except Exception:
                time.sleep(0.5)
        else:
            raise RuntimeError("Worker did not become ready; inspect " + str(log_path))
        subprocess.run([sys.executable, "scripts/smoke-workers-poc.py", "--report", str(project / ".wrangler/verification.json")], cwd=root, check=True)
        subprocess.run([sys.executable, "scripts/test-workers-feedback.py"], cwd=root,
                       env={**os.environ, "LONKLAR_TEST_ADMIN_TOKEN": admin_token}, check=True)
    finally:
        if previous_secret_file is None:
            secret_file.unlink(missing_ok=True)
        else:
            secret_file.write_bytes(previous_secret_file)
        try:
            os.killpg(process.pid, signal.SIGTERM)
        except ProcessLookupError:
            pass  # Preserve the startup/test error if the runtime already exited.
        try:
            process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            os.killpg(process.pid, signal.SIGKILL)
