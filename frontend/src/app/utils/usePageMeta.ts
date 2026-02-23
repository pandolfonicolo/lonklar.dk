import { useEffect } from "react";

/**
 * Sets per-page SEO metadata: <title>, <meta name="description">,
 * <link rel="canonical">, and <meta property="og:…"> tags.
 *
 * Automatically cleans up on unmount (restores defaults).
 */
export function usePageMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  /** Path without origin, e.g. "/about" or "/wizard/fulltime" */
  path: string;
}) {
  useEffect(() => {
    const origin = "https://lonklar.dk";
    const canonicalUrl = `${origin}${path}`;

    // Title
    document.title = title;

    // Meta description
    let metaDesc = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    const prevDesc = metaDesc?.content;
    if (metaDesc) {
      metaDesc.content = description;
    } else {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      metaDesc.content = description;
      document.head.appendChild(metaDesc);
    }

    // Canonical
    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    const prevCanonical = canonical?.href;
    if (canonical) {
      canonical.href = canonicalUrl;
    } else {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      canonical.href = canonicalUrl;
      document.head.appendChild(canonical);
    }

    // OG tags
    const ogUpdates: [string, string][] = [
      ["og:title", title],
      ["og:description", description],
      ["og:url", canonicalUrl],
    ];
    const prevOg: [string, string | undefined][] = [];
    for (const [prop, value] of ogUpdates) {
      const el = document.querySelector<HTMLMetaElement>(
        `meta[property="${prop}"]`,
      );
      prevOg.push([prop, el?.content]);
      if (el) el.content = value;
    }

    return () => {
      // Restore previous values on unmount
      if (metaDesc && prevDesc !== undefined) metaDesc.content = prevDesc;
      if (canonical && prevCanonical !== undefined)
        canonical.href = prevCanonical;
      for (const [prop, prev] of prevOg) {
        const el = document.querySelector<HTMLMetaElement>(
          `meta[property="${prop}"]`,
        );
        if (el && prev !== undefined) el.content = prev;
      }
    };
  }, [title, description, path]);
}
