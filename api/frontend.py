"""Serve known SPA routes with useful initial HTML and real HTTP errors."""

import json
from html import escape
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles


class CachedAssets(StaticFiles):
    async def get_response(self, path, scope):
        response = await super().get_response(path, scope)
        if response.status_code in (200, 304):
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        return response


def mount_frontend(app: FastAPI, static_dir: Path):
    static_dir = static_dir.resolve()
    config = json.loads((static_dir / "pages.json").read_text(encoding="utf-8"))
    template = (static_dir / "index.html").read_text(encoding="utf-8")
    pages, origin = config["pages"], config["origin"]
    private_paths = set(config["privatePaths"])
    routes = set(pages) | private_paths
    for marker in ("<!-- PAGE_META -->", "<!-- PAGE_CONTENT -->"):
        if template.count(marker) != 1:
            raise RuntimeError(f"Frontend build is missing its unique {marker} marker")

    nav = '<nav aria-label="Pages"><ul>' + "".join(
        f'<li><a href="{escape(path)}">{escape(page["label"])}</a></li>'
        for path, page in pages.items()
    ) + "</ul></nav>"

    def render(path):
        page = pages.get(path)
        if page:
            title, description, heading = page["title"], page["description"], page["heading"]
            paragraphs = page["paragraphs"]
        elif path in private_paths:
            heading = "Feedback administration" if path.startswith("/admin/") else "Your salary estimate"
            title = f"{heading} – Lonklar"
            description = "Open the interactive application to continue."
            paragraphs = [description]
        else:
            title, heading = "Page not found – Lonklar", "Page not found"
            description = "This address does not match a Lonklar page. Choose a calculator or another page below."
            paragraphs = [description]

        tags = [
            f"<title>{escape(title)}</title>",
            f'<meta name="description" content="{escape(description)}" />',
            f'<meta name="robots" content="{"index,follow" if page else "noindex,follow"}" />',
        ]
        for attribute, name, value in (
            ("property", "og:title", title), ("property", "og:description", description),
            ("name", "twitter:title", title), ("name", "twitter:description", description),
        ):
            tags.append(f'<meta {attribute}="{name}" content="{escape(value)}" />')
        if page:
            canonical = escape(origin + path)
            tags += [f'<link rel="canonical" href="{canonical}" />',
                     f'<meta property="og:url" content="{canonical}" />']

        content = f'<main class="initial-page"><a href="/">LønKlar</a><h1>{escape(heading)}</h1>'
        content += "".join(f"<p>{escape(p)}</p>" for p in paragraphs)
        if path in routes:
            content += "<p>JavaScript enables the interactive calculators and forms.</p>"
        content += nav + "</main>"
        return template.replace("<!-- PAGE_META -->", "\n".join(tags)).replace("<!-- PAGE_CONTENT -->", content)

    # A finite set of documents; request paths never become HTML or canonical URLs.
    documents = {path: render(path) for path in routes}
    not_found = render(None)
    app.mount("/assets", CachedAssets(directory=static_dir / "assets"), name="assets")

    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"], include_in_schema=False)
    async def serve_frontend(request: Request, full_path: str):
        path = "/" + full_path
        if path == "/api" or path.startswith("/api/"):
            raise HTTPException(404, "Not found")

        target = "/" if path == "/index.html" else path[:-1] if path.endswith("/") else None
        if target in routes:
            query = request.url.query
            return RedirectResponse(target + ("?" + query if query else ""), status_code=308)

        if path in documents:
            headers = {"Cache-Control": "no-cache"}
            if path in private_paths:
                headers["X-Robots-Tag"] = "noindex, follow"
            return HTMLResponse(documents[path], headers=headers)

        # Never expose arbitrary HTML, internal manifests, dotfiles or paths outside static/.
        try:
            file = (static_dir / full_path).resolve()
        except (OSError, ValueError):
            raise HTTPException(404, "Not found")
        safe = (file.is_relative_to(static_dir) and
                not any(part.startswith(".") for part in Path(full_path).parts) and
                file.suffix.lower() not in (".html", ".htm") and file.name != "pages.json")
        if safe and file.is_file():
            media_type = {".xml": "application/xml", ".txt": "text/plain"}.get(file.suffix)
            return FileResponse(file, media_type=media_type, headers={"Cache-Control": "no-cache"})

        return HTMLResponse(not_found, status_code=404, headers={
            "Cache-Control": "no-cache", "X-Robots-Tag": "noindex, follow",
        })
