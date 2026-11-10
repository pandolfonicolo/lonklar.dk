"""Indexing regressions against the built frontend and production route handler.

Build frontend/dist first, or run inside the production image with /app/static.
No production requests or feedback writes are made by these tests.
"""

import json
import shutil
import tempfile
import unittest
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.frontend import mount_frontend
from api.routers import meta


class Document(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.tags = []
        self.text = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

    def handle_data(self, data):
        self.text.append(data)

    def select(self, tag, **attrs):
        return [a for t, a in self.tags if t == tag and all(a.get(k) == v for k, v in attrs.items())]


class FrontendIndexingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        root = Path(__file__).resolve().parents[1]
        source = root / "static"
        if not source.is_dir():
            source = root / "frontend" / "dist"
        if not source.is_dir():
            raise AssertionError("Run npm ci && npm run build in frontend/ before these tests")
        cls.temp = tempfile.TemporaryDirectory()
        cls.addClassCleanup(cls.temp.cleanup)
        cls.static = Path(cls.temp.name) / "static"
        shutil.copytree(source, cls.static)
        cls.config = json.loads((cls.static / "pages.json").read_text())
        app = FastAPI(redirect_slashes=False)
        app.include_router(meta.router)
        mount_frontend(app, cls.static)
        cls.client = TestClient(app)
        cls.addClassCleanup(cls.client.close)

    def test_all_eight_indexable_pages_have_unique_initial_content(self):
        titles, descriptions, headings = set(), set(), set()
        self.assertEqual(len(self.config["pages"]), 8)
        for path, page in self.config["pages"].items():
            with self.subTest(path=path):
                response = self.client.get(path)
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.headers["cache-control"], "no-cache")
                doc = Document(response.text)
                self.assertEqual(len(doc.select("title")), 1)
                self.assertEqual(doc.select("link", rel="canonical"), [
                    {"rel": "canonical", "href": self.config["origin"] + path}])
                for key, value in [("description", page["description"]), ("robots", "index,follow"),
                                   ("twitter:title", page["title"]), ("twitter:description", page["description"])]:
                    self.assertEqual(doc.select("meta", name=key), [{"name": key, "content": value}])
                for key, value in [("og:title", page["title"]), ("og:description", page["description"]),
                                   ("og:url", self.config["origin"] + path)]:
                    self.assertEqual(doc.select("meta", property=key), [{"property": key, "content": value}])
                self.assertIn(page["title"], doc.text)
                self.assertIn(page["heading"], doc.text)
                self.assertEqual(len(doc.select("h1")), 1)
                self.assertEqual(len(doc.select("main")), 1)
                self.assertFalse(doc.select("noscript"))
                for paragraph in page["paragraphs"]:
                    self.assertIn(paragraph, doc.text)
                links = {a["href"] for a in doc.select("a")}
                self.assertTrue(set(self.config["pages"]).issubset(links))
                self.assertNotIn("Loading…", response.text)
                self.assertNotIn("<!-- PAGE_", response.text)
                self.assertNotIn("SearchAction", response.text)
                titles.add(page["title"])
                descriptions.add(page["description"])
                headings.add(page["heading"])
        self.assertEqual([len(titles), len(descriptions), len(headings)], [8, 8, 8])

    def test_head_has_same_status_and_headers_as_get_without_body(self):
        paths = list(self.config["pages"]) + self.config["privatePaths"] + [
            "/missing", "/wizard/missing", "/missing.js", "/sitemap.xml", "/robots.txt"]
        for path in paths:
            with self.subTest(path=path):
                get, head = self.client.get(path), self.client.head(path)
                self.assertEqual(head.status_code, get.status_code)
                self.assertEqual(head.content, b"")
                for header in ("content-type", "content-length", "cache-control", "x-robots-tag"):
                    self.assertEqual(head.headers.get(header), get.headers.get(header))

    def test_unknown_routes_and_invalid_calculators_are_real_404s(self):
        for path in ["/missing", "/ABOUT", "/wizard", "/wizard/missing", "/wizard/constructor",
                     "/wizard/student/extra", "/results/missing", "/admin", "/missing.js",
                     "/missing.png", "/about.html", "/about/index.html", "/pages.json"]:
            with self.subTest(path=path):
                r = self.client.get(path, follow_redirects=False)
                self.assertEqual(r.status_code, 404)
                doc = Document(r.text)
                self.assertIn("Page not found", doc.text)
                self.assertFalse(doc.select("link", rel="canonical"))
                self.assertFalse(doc.select("meta", property="og:url"))
                self.assertEqual(r.headers["x-robots-tag"], "noindex, follow")

    def test_api_misses_never_receive_spa_html(self):
        for path in ("/api", "/api/", "/api/missing", "/api/meta/missing"):
            with self.subTest(path=path):
                self.assertEqual(self.client.get(path).status_code, 404)
                self.assertEqual(self.client.head(path).status_code, 404)
                self.assertEqual(self.client.get(path).headers["content-type"], "application/json")
        self.assertEqual(self.client.get("/api/meta").status_code, 200)
        self.assertIn("data_freshness", self.client.get("/api/meta").json())

    def test_valid_results_and_admin_routes_remain_accessible_but_noindex(self):
        for path in self.config["privatePaths"]:
            with self.subTest(path=path):
                r = self.client.get(path)
                self.assertEqual(r.status_code, 200)
                self.assertEqual(r.headers["x-robots-tag"], "noindex, follow")
                doc = Document(r.text)
                self.assertEqual(doc.select("meta", name="robots")[0]["content"], "noindex,follow")
                self.assertFalse(doc.select("link", rel="canonical"))

    def test_query_strings_and_host_headers_cannot_change_canonical(self):
        for path in self.config["pages"]:
            with self.subTest(path=path):
                r = self.client.get(path + "?utm_source=test&salary=42000", headers={"Host": "example.invalid"})
                self.assertEqual(r.status_code, 200)
                doc = Document(r.text)
                self.assertEqual(doc.select("link", rel="canonical")[0]["href"], self.config["origin"] + path)
                self.assertNotIn("example.invalid", r.text)
                self.assertNotIn("utm_source", r.text)

    def test_aliases_redirect_once_to_canonical_path_preserving_query(self):
        for path in list(self.config["pages"])[1:] + self.config["privatePaths"]:
            for method in ("GET", "HEAD"):
                with self.subTest(path=path, method=method):
                    r = self.client.request(method, path + "/?x=1%202", follow_redirects=False)
                    self.assertEqual(r.status_code, 308)
                    self.assertEqual(r.headers["location"], path + "?x=1%202")
                    self.assertEqual(self.client.get(r.headers["location"]).status_code, 200)
        r = self.client.get("/index.html?x=1", follow_redirects=False)
        self.assertEqual((r.status_code, r.headers["location"]), (308, "/?x=1"))
        self.assertEqual(self.client.get("/missing/", follow_redirects=False).status_code, 404)

    def test_sitemap_matches_only_indexable_canonical_documents(self):
        r = self.client.get("/sitemap.xml")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.headers["content-type"], "application/xml")
        xml = ET.fromstring(r.content)
        urls = [node.text for node in xml.findall("{*}url/{*}loc")]
        self.assertEqual(len(urls), len(set(urls)))
        self.assertEqual(set(urls), {self.config["origin"] + path for path in self.config["pages"]})
        for url in urls:
            with self.subTest(url=url):
                page = self.client.get(urlsplit(url).path, follow_redirects=False)
                self.assertEqual(page.status_code, 200)
                doc = Document(page.text)
                self.assertEqual(doc.select("link", rel="canonical")[0]["href"], url)
                self.assertEqual(doc.select("meta", name="robots")[0]["content"], "index,follow")
        self.assertFalse(xml.findall("{*}url/{*}lastmod"))

    def test_robots_allows_crawlers_to_see_results_noindex(self):
        r = self.client.get("/robots.txt")
        self.assertEqual(r.status_code, 200)
        self.assertIn("text/plain", r.headers["content-type"])
        self.assertIn("Sitemap: " + self.config["origin"] + "/sitemap.xml", r.text)
        self.assertNotIn("Disallow: /results", r.text)

    def test_built_entry_assets_and_icons_resolve(self):
        doc = Document(self.client.get("/wizard/student").text)
        assets = [tag["src"] for tag in doc.select("script", type="module")]
        assets += [tag["href"] for tag in doc.select("link", rel="stylesheet")]
        self.assertGreaterEqual(len(assets), 2)
        for asset in assets:
            with self.subTest(asset=asset):
                self.assertTrue(asset.startswith("/assets/"))
                r = self.client.get(asset)
                self.assertEqual(r.status_code, 200)
                self.assertEqual(r.headers["cache-control"], "public, max-age=31536000, immutable")
        for path in ("/favicon.svg", "/apple-touch-icon.png", "/og-image.png"):
            self.assertEqual(self.client.get(path).status_code, 200)

    def test_missing_assets_do_not_fall_back_to_html_or_immutable_cache(self):
        for path in ("/assets/missing.js", "/assets/missing.css"):
            r = self.client.get(path)
            self.assertEqual(r.status_code, 404)
            self.assertNotIn("text/html", r.headers["content-type"])
            self.assertNotIn("immutable", r.headers.get("cache-control", ""))

    def test_static_files_cannot_escape_root_or_expose_html_and_dotfiles(self):
        outside = Path(self.temp.name) / "secret.txt"
        outside.write_text("private sentinel")
        (self.static / "outside.txt").symlink_to(outside)
        (self.static / "assets" / "outside.txt").symlink_to(outside)
        (self.static / ".hidden").write_text("private sentinel")
        (self.static / "unlisted.html").write_text("private sentinel")
        for path in ("/%2e%2e/secret.txt", "/outside.txt", "/assets/outside.txt", "/.hidden", "/unlisted.html"):
            with self.subTest(path=path):
                r = self.client.get(path)
                self.assertEqual(r.status_code, 404)
                self.assertNotIn("private sentinel", r.text)

    def test_bad_build_template_fails_closed(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder)
            shutil.copy(self.static / "pages.json", target)
            (target / "index.html").write_text("<html>Old shell without route content</html>")
            with self.assertRaisesRegex(RuntimeError, "marker"):
                mount_frontend(FastAPI(), target)
