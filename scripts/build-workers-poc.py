"""Copy generated frontend to a labeled, unindexed test deployment."""
import re
import shutil
from pathlib import Path

root = Path(__file__).resolve().parents[1]
target = root / "workers_poc/public"
shutil.rmtree(target, ignore_errors=True)
shutil.copytree(root / "frontend/dist", target)
index = target / "index.html"
html = index.read_text()
html = re.sub(r'<script[^>]+analytics\.lonklar\.dk/[^>]+></script>', '', html)
html = html.replace('</head>', '<meta name="robots" content="noindex,nofollow,noarchive"></head>')
html = html.replace('<body>', '<body><aside role="note" style="padding:12px 20px;background:#eeece5;color:#334b68;text-align:center;font:14px system-ui;border-bottom:1px solid #5b7a9e">Lonklar Cloudflare proof — use synthetic inputs only. Feedback is stored in a separate test database. <a href="https://lonklar.dk">Open the current site</a></aside>')
index.write_text(html)
(target / "robots.txt").write_text('User-agent: *\nDisallow: /\n')
(target / "_headers").write_text('/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n  Cache-Control: no-cache\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n')

# Stage only unchanged, portable API modules; never copy filesystem persistence, secrets, or server data.
api = root / "workers_poc/src/api"
shutil.rmtree(api, ignore_errors=True)
(api / "routers").mkdir(parents=True)
for name in ["__init__.py", "data.py", "models.py", "tax_engine.py", "chart_curves.py", "salary_scenarios.py", "routers/__init__.py", "routers/compute.py", "routers/meta.py"]:
    shutil.copy2(root / "api" / name, api / name)
