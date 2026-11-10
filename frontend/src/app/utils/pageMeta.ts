import config from "../../../public/pages.json";

type Page = { title: string; description: string };
const pages: Record<string, Page> = config.pages;

/** Keep client navigation consistent with the initial HTTP document. */
export function updatePageMeta(pathname: string) {
  const path = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  const page = pages[path];
  const heading = path.startsWith("/admin/") ? "Feedback administration" : "Your salary estimate";
  const privatePage = config.privatePaths.includes(path);
  const title = page?.title ?? `${privatePage ? heading : "Page not found"} – Lonklar`;
  const description = page?.description ?? (privatePage
    ? "Open the interactive application to continue."
    : "This address does not match a Lonklar page. Choose a calculator or another page below.");
  document.title = title;

  const tags: [string, string, string | null][] = [
    ["name", "description", description],
    ["name", "robots", page ? "index,follow" : "noindex,follow"],
    ["property", "og:title", title],
    ["property", "og:description", description],
    ["property", "og:url", page ? config.origin + path : null],
    ["name", "twitter:title", title],
    ["name", "twitter:description", description],
  ];
  for (const [attribute, name, content] of tags) {
    let tag = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
    if (content === null) { tag?.remove(); continue; }
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute(attribute, name);
      document.head.appendChild(tag);
    }
    tag.content = content;
  }

  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!page) { canonical?.remove(); return; }
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = config.origin + path;
}
