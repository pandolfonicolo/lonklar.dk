"""Small curl transport: credentials go through stdin, never command arguments."""
import email.parser
import json
import subprocess
import tempfile
from pathlib import Path
from urllib.parse import urlparse


def request(base, path, payload=None, headers=None, method=None):
    assert base in ("http://127.0.0.1:8791", "https://lonklar-python-poc.nicolo-pandolfo.workers.dev"), "Proof targets only"
    assert path.startswith("/") and not path.startswith("//") and "\n" not in path
    with tempfile.TemporaryDirectory(prefix="lonklar-http-") as folder:
        directory = Path(folder)
        config = []
        def quote(value):
            return '"' + str(value).replace('\\', '\\\\').replace('"', '\\"').replace('\r', '\\r').replace('\n', '\\n') + '"'
        for key, value in {"Content-Type": "application/json", **(headers or {})}.items():
            assert "\n" not in key and "\n" not in value and "\r" not in value
            config.append("header = " + quote(key + ": " + value))
        if payload is not None:
            body = directory / "request"
            body.write_text(json.dumps(payload, allow_nan=False))
            config.append("data-binary = " + quote("@" + str(body)))
        result = subprocess.run(["curl", "--silent", "--show-error", "--max-time", "45", "--config", "-",
                                 "--dump-header", str(directory / "headers"), "--output", str(directory / "body"),
                                 "--write-out", "%{json}", "--request", method or ("POST" if payload is not None else "GET"), base + path],
                                input="\n".join(config), capture_output=True, text=True, check=True)
        metadata = json.loads(result.stdout)
        raw = (directory / "body").read_bytes()
        blocks = (directory / "headers").read_text().strip().split("\n\n")
        parsed = email.parser.Parser().parsestr(blocks[-1].split("\n", 1)[1])
        return {"status": metadata["http_code"], "body": raw, "headers": {key.lower(): value for key, value in parsed.items()},
                "http_ms": metadata["time_total"] * 1000, "ttfb_ms": metadata["time_starttransfer"] * 1000,
                "connect_ms": metadata["time_connect"] * 1000}
